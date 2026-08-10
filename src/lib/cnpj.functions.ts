import { createServerFn } from "@tanstack/react-start";

export type CnpjCompany = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  abertura?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefone?: string;
  email?: string;
};

type LookupInput = { cnpj: string };

function cleanCnpj(value: string) {
  return value.replace(/\D/g, "");
}

function validCnpj(value: string) {
  const cnpj = cleanCnpj(value);
  if (cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;

  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (const digit of base) sum += Number(digit) * factor--;
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const d1 = calc(cnpj.slice(0, 12), 5);
  const d2 = calc(cnpj.slice(0, 12) + d1, 6);
  return d1 === Number(cnpj[12]) && d2 === Number(cnpj[13]);
}

function normalize(data: any): CnpjCompany {
  return {
    cnpj: cleanCnpj(data.cnpj),
    razaoSocial: data.razao_social ?? data.nome ?? data.razaoSocial ?? "",
    nomeFantasia: data.nome_fantasia ?? data.fantasia ?? data.nomeFantasia ?? "",
    situacao: data.descricao_situacao_cadastral ?? data.situacao ?? "",
    abertura: data.data_inicio_atividade ?? data.abertura,
    logradouro: data.logradouro,
    numero: data.numero,
    complemento: data.complemento,
    bairro: data.bairro,
    municipio: data.municipio,
    uf: data.uf,
    cep: data.cep,
    telefone: data.ddd_telefone_1 ?? data.telefone,
    email: data.email,
  };
}

async function requestJson(url: string, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "LogiFinder/1.0 (consulta cadastral)",
      ...headers,
    },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export const lookupCnpj = createServerFn({ method: "GET" })
  .inputValidator((data: LookupInput) => data)
  .handler(async ({ data }) => {
    const cnpj = cleanCnpj(data.cnpj);
    if (!validCnpj(cnpj)) {
      return { ok: false as const, error: "CNPJ inválido. Confira os 14 dígitos." };
    }

    const errors: string[] = [];
    const providers = [
      async () => normalize(await requestJson(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`)),
      async () => normalize(await requestJson(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`)),
    ];

    for (const provider of providers) {
      try {
        const company = await provider();
        if (company.razaoSocial || company.nomeFantasia) {
          return { ok: true as const, company };
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : "Falha no provedor");
      }
    }

    return {
      ok: false as const,
      error: "Não foi possível localizar este CNPJ agora. Tente novamente em alguns segundos.",
      details: errors,
    };
  });
