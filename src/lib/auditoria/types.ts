export type AuditStatus =
  | "CONFERIDO"
  | "VALOR_DIVERGENTE"
  | "TRANSPORTADORA_DIVERGENTE"
  | "CTE_NAO_ENCONTRADO"
  | "NF_NAO_ENCONTRADA";

export interface SankhyaInvoice {
  numeroNF: string;
  valorFrete: number | null;
  transportadora: string;
  cliente: string;
  dataEmissao: string;
}

export interface CteDocument {
  numeroCTe: string;
  numeroNF: string;
  valorFrete: number | null;
  transportadora: string;
  origemArquivo: string;
  recebidoEm?: string;
}

export interface AuditResult {
  numeroNF: string;
  numeroCTe?: string;
  status: AuditStatus;
  nfFrete?: number | null;
  cteFrete?: number | null;
  nfTransportadora?: string;
  cteTransportadora?: string;
  mensagem: string;
}

export interface AuditSummary {
  notasAnalisadas: number;
  ctesEncontrados: number;
  conferidos: number;
  divergenciasValor: number;
  divergenciasTransportadora: number;
  ctesNaoEncontrados: number;
  notasNaoEncontradas: number;
}

export interface ReadOnlyAuditSource {
  listInvoices(periodStart: string, periodEnd: string): Promise<SankhyaInvoice[]>;
}
