import type { AuditRow, AuditStatus, AuditSummary, Cte, NotaFiscal } from "./types";

export const onlyDigits = (v: string) => (v ?? "").replace(/\D/g, "");
export const normalizeNF = (v: string) => onlyDigits(v).replace(/^0+/, "") || "0";
export const normalizeCarrier = (v: string) =>
  (v ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\b(LTDA|S\/?A|EIRELI|ME|EPP|TRANSPORTES?|TRANSPORTADORA|LOGISTICA)\b/g, "")
    .replace(/[^A-Z0-9]/g, "")
    .trim();

export type CompareOptions = {
  /** Tolerância absoluta em R$ para considerar o valor conferido. */
  toleranciaValor?: number;
};

export function compareDocs(
  notas: NotaFiscal[],
  ctes: Cte[],
  opts: CompareOptions = {},
): { rows: AuditRow[]; summary: AuditSummary } {
  const tol = opts.toleranciaValor ?? 0.01;
  const cteByNF = new Map<string, Cte>();
  for (const c of ctes) cteByNF.set(normalizeNF(c.numeroNF), c);

  const rows: AuditRow[] = [];
  const usados = new Set<string>();

  for (const nf of notas) {
    const key = normalizeNF(nf.numeroNF);
    const cte = cteByNF.get(key);
    if (!cte) {
      rows.push({
        status: "cte_nao_encontrado",
        numeroNF: nf.numeroNF,
        cliente: nf.cliente,
        transportadoraNF: nf.transportadora,
        valorNF: nf.valorFrete,
        dataEmissao: nf.dataEmissao,
        observacao: "Nenhum CT-e localizado para esta nota no período analisado.",
      });
      continue;
    }
    usados.add(key);
    const diferenca = +(cte.valorFrete - nf.valorFrete).toFixed(2);
    const carrierOk = normalizeCarrier(nf.transportadora) === normalizeCarrier(cte.transportadora);
    const valorOk = Math.abs(diferenca) <= tol;

    let status: AuditStatus = "conferido";
    if (!carrierOk) status = "transportadora_divergente";
    else if (!valorOk) status = "valor_divergente";

    rows.push({
      status,
      numeroNF: nf.numeroNF,
      numeroCte: cte.numeroCte,
      cliente: nf.cliente,
      transportadoraNF: nf.transportadora,
      transportadoraCte: cte.transportadora,
      valorNF: nf.valorFrete,
      valorCte: cte.valorFrete,
      diferenca,
      dataEmissao: nf.dataEmissao,
      observacao: !carrierOk
        ? "Transportadora do CT-e diferente da informada na nota."
        : !valorOk
          ? `Diferença de R$ ${diferenca.toFixed(2)} entre nota e CT-e.`
          : undefined,
    });
  }

  for (const c of ctes) {
    const key = normalizeNF(c.numeroNF);
    if (usados.has(key)) continue;
    rows.push({
      status: "nota_nao_encontrada",
      numeroNF: c.numeroNF,
      numeroCte: c.numeroCte,
      transportadoraCte: c.transportadora,
      valorCte: c.valorFrete,
      dataEmissao: c.dataEmissao,
      observacao: "CT-e recebido sem nota correspondente no período analisado.",
    });
  }

  const order: AuditStatus[] = [
    "valor_divergente",
    "transportadora_divergente",
    "cte_nao_encontrado",
    "nota_nao_encontrada",
    "conferido",
  ];
  rows.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  const valorTotalNF = notas.reduce((s, n) => s + n.valorFrete, 0);
  const valorTotalCte = ctes.reduce((s, c) => s + c.valorFrete, 0);

  return {
    rows,
    summary: {
      totalNotas: notas.length,
      totalCtes: ctes.length,
      conferidos: rows.filter((r) => r.status === "conferido").length,
      divergencias: rows.filter((r) => r.status !== "conferido").length,
      valorTotalNF: +valorTotalNF.toFixed(2),
      valorTotalCte: +valorTotalCte.toFixed(2),
      diferencaTotal: +(valorTotalCte - valorTotalNF).toFixed(2),
    },
  };
}
