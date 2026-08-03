// Agente de Auditoria — MODO SOMENTE LEITURA (READ ONLY).
// Nenhuma função desta camada grava, altera, aprova ou cancela documentos
// em sistemas externos. Toda integração futura (Sankhya, Gmail) deve usar
// exclusivamente verbos de consulta (GET / SELECT / read).

export const AUDIT_READ_ONLY = true as const;

export type NotaFiscal = {
  numeroNF: string;
  valorFrete: number;
  transportadora: string;
  cliente: string;
  dataEmissao: string; // ISO
  origem: "sankhya" | "xml" | "manual";
};

export type Cte = {
  numeroCte: string;
  numeroNF: string;
  valorFrete: number;
  transportadora: string;
  dataEmissao?: string;
  origem: "email" | "xml" | "manual";
};

export type AuditStatus =
  | "conferido"
  | "valor_divergente"
  | "transportadora_divergente"
  | "cte_nao_encontrado"
  | "nota_nao_encontrada";

export type AuditRow = {
  status: AuditStatus;
  numeroNF: string;
  numeroCte?: string;
  cliente?: string;
  transportadoraNF?: string;
  transportadoraCte?: string;
  valorNF?: number;
  valorCte?: number;
  diferenca?: number;
  dataEmissao?: string;
  observacao?: string;
};

export type AuditSummary = {
  totalNotas: number;
  totalCtes: number;
  divergencias: number;
  conferidos: number;
  valorTotalNF: number;
  valorTotalCte: number;
  diferencaTotal: number;
};

export const STATUS_META: Record<AuditStatus, { label: string; dot: string; className: string }> = {
  conferido: { label: "Conferido", dot: "🟢", className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  valor_divergente: { label: "Valor divergente", dot: "🟡", className: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  transportadora_divergente: { label: "Transportadora divergente", dot: "🟠", className: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  cte_nao_encontrado: { label: "CT-e não encontrado", dot: "🔴", className: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  nota_nao_encontrada: { label: "Nota não encontrada", dot: "🔵", className: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
};
