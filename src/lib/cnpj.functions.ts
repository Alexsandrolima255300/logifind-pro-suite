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

function cleanCnpj(value: string) { return value.replace(/\D/g, ""); }

function validCnpj(value: string) {
  const cnpj = cleanCnpj(value);
  if (cnpj.length !== 14 || /^([0-9])\1+$/.test(cnpj)) return false;
  const weights1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const weights2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  const digit = (base: string, weights: number[]) => {
    const sum = base.split("").reduce((total, char, index) => total + Number(char) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const d1 = digit(cnpj.slice(0, 12), weights1);
  const d2 = digit(cnpj.slice(0, 12) + d1, weights2);
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

async function requestJson(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "LogiFinder/1.0 (consulta cadastral)" },
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export const lookupCnpj = createServerFn({ method: "GET" })
  .inputValidator((data: LookupInput) => data)
  .handler(async ({ data }) => {
    const cnpj = cleanCnpj(data.cnpj);
    if (!validCnpj(cnpj)) return { ok: false as const, error: "CNPJ inválido. Confira os 14 dígitos." };

    const providers = [
      () => requestJson(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`),
      () => requestJson(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`),
    ];
    for (const provider of providers) {
      try {
        const company = normalize(await provider());
        if (company.razaoSocial || company.nomeFantasia) return { ok: true as const, company };
      } catch { /* tenta o próximo provedor */ }
    }
    return { ok: false as const, error: "CNPJ não encontrado ou os provedores estão temporariamente indisponíveis." };
  });
