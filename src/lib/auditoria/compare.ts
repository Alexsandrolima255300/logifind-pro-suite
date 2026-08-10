import type { AuditResult, AuditSummary, CteDocument, SankhyaInvoice } from "./types";

const normalize = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const sameMoney = (a: number | null | undefined, b: number | null | undefined, tolerance = 0.01) =>
  a != null && b != null && Math.abs(a - b) <= tolerance;

export function compareInvoicesAndCtes(
  invoices: SankhyaInvoice[],
  ctes: CteDocument[],
): { results: AuditResult[]; summary: AuditSummary } {
  const byNF = new Map<string, CteDocument>();
  for (const cte of ctes) {
    const key = normalize(cte.numeroNF);
    if (key && !byNF.has(key)) byNF.set(key, cte);
  }

  const usedNF = new Set<string>();
  const results: AuditResult[] = invoices.map((nf) => {
    const key = normalize(nf.numeroNF);
    const cte = byNF.get(key);
    if (!cte) {
      return {
        numeroNF: nf.numeroNF,
        status: "CTE_NAO_ENCONTRADO",
        nfFrete: nf.valorFrete,
        nfTransportadora: nf.transportadora,
        mensagem: "CT-e não encontrado para esta NF.",
      };
    }

    usedNF.add(key);
    const carrierOk = normalize(nf.transportadora) === normalize(cte.transportadora);
    const valueOk = sameMoney(nf.valorFrete, cte.valorFrete);

    if (!carrierOk) {
      return {
        numeroNF: nf.numeroNF,
        numeroCTe: cte.numeroCTe,
        status: "TRANSPORTADORA_DIVERGENTE",
        nfFrete: nf.valorFrete,
        cteFrete: cte.valorFrete,
        nfTransportadora: nf.transportadora,
        cteTransportadora: cte.transportadora,
        mensagem: "A transportadora da NF difere da transportadora do CT-e.",
      };
    }

    if (!valueOk) {
      return {
        numeroNF: nf.numeroNF,
        numeroCTe: cte.numeroCTe,
        status: "VALOR_DIVERGENTE",
        nfFrete: nf.valorFrete,
        cteFrete: cte.valorFrete,
        nfTransportadora: nf.transportadora,
        cteTransportadora: cte.transportadora,
        mensagem: "O valor de frete da NF difere do valor informado no CT-e.",
      };
    }

    return {
      numeroNF: nf.numeroNF,
      numeroCTe: cte.numeroCTe,
      status: "CONFERIDO",
      nfFrete: nf.valorFrete,
      cteFrete: cte.valorFrete,
      nfTransportadora: nf.transportadora,
      cteTransportadora: cte.transportadora,
      mensagem: "NF e CT-e conferidos.",
    };
  });

  for (const cte of ctes) {
    if (!usedNF.has(normalize(cte.numeroNF))) {
      results.push({
        numeroNF: cte.numeroNF,
        numeroCTe: cte.numeroCTe,
        status: "NF_NAO_ENCONTRADA",
        cteFrete: cte.valorFrete,
        cteTransportadora: cte.transportadora,
        mensagem: "CT-e recebido sem NF correspondente no período consultado.",
      });
    }
  }

  const summary: AuditSummary = {
    notasAnalisadas: invoices.length,
    ctesEncontrados: ctes.length,
    conferidos: results.filter((r) => r.status === "CONFERIDO").length,
    divergenciasValor: results.filter((r) => r.status === "VALOR_DIVERGENTE").length,
    divergenciasTransportadora: results.filter((r) => r.status === "TRANSPORTADORA_DIVERGENTE").length,
    ctesNaoEncontrados: results.filter((r) => r.status === "CTE_NAO_ENCONTRADO").length,
    notasNaoEncontradas: results.filter((r) => r.status === "NF_NAO_ENCONTRADA").length,
  };

  return { results, summary };
}
