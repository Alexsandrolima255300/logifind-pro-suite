export type CnpjCompany = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  dataAbertura: string;
  naturezaJuridica: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
};

export type CnpjLookupResult =
  | { status: "ok"; data: CnpjCompany }
  | { status: "not_found" }
  | { status: "unavailable" };

export function formatCnpj(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 14);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);
  let out = p1;
  if (d.length > 2) out += "." + p2;
  if (d.length > 5) out += "." + p3;
  if (d.length > 8) out += "/" + p4;
  if (d.length > 12) out += "-" + p5;
  return out;
}

export function formatCep(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function isValidCnpj(v: string): boolean {
  const c = v.replace(/\D/g, "");
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false;
  const calc = (base: string) => {
    let sum = 0;
    let pos = base.length - 7;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * pos--;
      if (pos < 2) pos = 9;
    }
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(c.slice(0, 12));
  const d2 = calc(c.slice(0, 12) + d1);
  return d1 === parseInt(c[12]) && d2 === parseInt(c[13]);
}

export async function fetchCnpj(cnpj: string): Promise<CnpjLookupResult> {
  const clean = cnpj.replace(/\D/g, "");
  if (!isValidCnpj(clean)) return { status: "not_found" };
  try {
    const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`);
    if (r.status === 404) return { status: "not_found" };
    if (!r.ok) return { status: "unavailable" };
    const j = await r.json();
    return {
      status: "ok",
      data: {
        cnpj: formatCnpj(clean),
        razaoSocial: j.razao_social ?? "",
        nomeFantasia: j.nome_fantasia ?? "",
        situacao: j.descricao_situacao_cadastral ?? "",
        dataAbertura: j.data_inicio_atividade ?? "",
        naturezaJuridica: j.natureza_juridica ?? "",
        logradouro: j.logradouro ?? "",
        numero: j.numero ?? "",
        complemento: j.complemento ?? "",
        bairro: j.bairro ?? "",
        cidade: j.municipio ?? "",
        uf: j.uf ?? "",
        cep: formatCep(j.cep ?? ""),
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}
