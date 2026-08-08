// Servidor-only: integração oficial de cotação Rodonaves (RTE).
// Fluxo documentado: token por gateway -> city id por CEP -> gera-cotacao.
// Credenciais vivem apenas em variáveis de ambiente e nunca são retornadas.

const GW = {
  dne: "https://dne-api.rte.com.br",
  quotation: "https://quotation-apigateway.rte.com.br",
  legacy: "https://01wapi.rte.com.br",
} as const;

type Cache = { token: string; expiresAt: number };
const tokens: Record<string, Cache> = {};

async function tokenFor(host: string): Promise<string> {
  const cached = tokens[host];
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  const username = process.env["RODONAVES_USERNAME"];
  const password = process.env["RODONAVES_PASSWORD"];
  if (!username || !password) throw new Error("Credenciais Rodonaves não configuradas no servidor.");

  const res = await fetch(`${host}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      auth_type: process.env["RODONAVES_AUTH_TYPE"] || "DEV",
      grant_type: "password",
      companyId: "1",
      username,
      password,
    }),
  });
  if (!res.ok) throw new Error(`Falha na autenticação Rodonaves (HTTP ${res.status}).`);
  const json = (await res.json()) as Record<string, unknown>;
  const token = String(json["access_token"] ?? "");
  if (!token) throw new Error("Token Rodonaves não retornado.");
  const expiresIn = Number(json["expires_in"] ?? 3600);
  tokens[host] = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return token;
}

/** Passo 2/3 — Id da cidade a partir do CEP (API DNE). */
export async function cityIdByZip(zip: string): Promise<{ id: number; cidade: string } | null> {
  const clean = zip.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const token = await tokenFor(GW.dne);
    const res = await fetch(`${GW.dne}/api/cities/byzipcode?zipCode=${clean}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) return null;
    const j = (await res.json()) as Record<string, unknown>;
    const id = Number(j["Id"] ?? 0);
    if (!id) return null;
    return { id, cidade: String(j["Description"] ?? "") };
  } catch {
    return null;
  }
}

export type RteQuoteInput = {
  cepOrigem: string;
  cepDestino: string;
  pesoKg: number;
  valorNF: number;
  volumes: number;
  cnpjRemetente: string;
  cpfCnpjDestinatario: string;
  nomeContato?: string;
  telefoneContato?: string;
  emailContato?: string;
  packs?: { quantidade: number; pesoKg: number; alturaCm: number; larguraCm: number; comprimentoCm: number }[];
};

export type RteQuoteOutput = {
  ok: boolean;
  valor?: number;
  prazoDias?: number;
  protocolo?: string;
  cubado?: boolean;
  unidadeOrigem?: string;
  unidadeDestino?: string;
  gateway?: string;
  mensagem?: string;
  raw?: string;
};

/** Passo 7 — cotação oficial. Tenta o gateway novo e cai para o legado. */
export async function quoteRodonavesApi(input: RteQuoteInput): Promise<RteQuoteOutput> {
  const origem = (input.cepOrigem || "").replace(/\D/g, "");
  const destino = (input.cepDestino || "").replace(/\D/g, "");
  if (origem.length !== 8 || destino.length !== 8) return { ok: false, mensagem: "CEPs inválidos." };

  const [o, d] = await Promise.all([cityIdByZip(origem), cityIdByZip(destino)]);

  const body = {
    OriginZipCode: origem,
    OriginCityId: o?.id ?? 0,
    DestinationZipCode: destino,
    DestinationCityId: d?.id ?? 0,
    TotalWeight: Number(input.pesoKg) || 0,
    EletronicInvoiceValue: Number(input.valorNF) || 0,
    CustomerTaxIdRegistration: (input.cnpjRemetente || "").replace(/\D/g, ""),
    ReceiverCpfcnp: (input.cpfCnpjDestinatario || "").replace(/\D/g, ""),
    TotalPackages: Number(input.volumes) || 1,
    ContactName: input.nomeContato || "LogiFinder",
    ContactPhoneNumber: (input.telefoneContato || "0000000000").replace(/\D/g, ""),
    CustomerEmail: input.emailContato || undefined,
    Packs: (input.packs ?? []).map((p) => ({
      AmountPackages: p.quantidade,
      Weight: p.pesoKg,
      Length: p.comprimentoCm,
      Height: p.alturaCm,
      Width: p.larguraCm,
    })),
  };

  let lastMessage = "Falha ao consultar a API Rodonaves.";
  for (const host of [GW.quotation, GW.legacy]) {
    try {
      const token = await tokenFor(host);
      const res = await fetch(`${host}/api/v1/gera-cotacao`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let json: Record<string, unknown> = {};
      try {
        json = JSON.parse(text) as Record<string, unknown>;
      } catch {
        /* resposta não-JSON */
      }
      if (!res.ok) {
        lastMessage = String(json["Message"] ?? `HTTP ${res.status}`);
        continue;
      }
      const valor = Number(json["Value"] ?? 0);
      return {
        ok: valor > 0,
        valor: valor > 0 ? valor : undefined,
        prazoDias: Number(json["DeliveryTime"] ?? 0) || undefined,
        protocolo: json["ProtocolNumber"] ? String(json["ProtocolNumber"]) : undefined,
        cubado: Boolean(json["Cubed"]),
        unidadeOrigem: json["UnitOriginDescription"] ? String(json["UnitOriginDescription"]) : undefined,
        unidadeDestino: json["UnitDestinyDescription"] ? String(json["UnitDestinyDescription"]) : undefined,
        gateway: host,
        mensagem: json["Message"] ? String(json["Message"]) : undefined,
        raw: text,
      };
    } catch (e) {
      lastMessage = e instanceof Error ? e.message : lastMessage;
    }
  }
  return { ok: false, mensagem: lastMessage };
}

/** Malha de atendimento / prazo oficial por cidade. */
export async function deliveryTimeApi(input: {
  cidadeOrigem: string;
  ufOrigem: string;
  cidadeDestino: string;
  ufDestino: string;
}): Promise<{ ok: boolean; prazoPj?: number; prazoPf?: number; mensagem?: string }> {
  try {
    const token = await tokenFor(GW.legacy);
    const res = await fetch(`${GW.legacy}/api/v1/prazo-entrega`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        OriginCityDescription: input.cidadeOrigem,
        OriginUFDescription: input.ufOrigem,
        DestinationCityDescription: input.cidadeDestino,
        DestinationUFDescription: input.ufDestino,
      }),
    });
    const json = (await res.json()) as Record<string, unknown>;
    if (!res.ok) return { ok: false, mensagem: String(json["Message"] ?? `HTTP ${res.status}`) };
    return {
      ok: true,
      prazoPj: Number(json["DeliveryLegalPerson"] ?? 0) || undefined,
      prazoPf: Number(json["DeliveryPhysicalPerson"] ?? 0) || undefined,
    };
  } catch (e) {
    return { ok: false, mensagem: e instanceof Error ? e.message : "Falha no prazo de entrega." };
  }
}
