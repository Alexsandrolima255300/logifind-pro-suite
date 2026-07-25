import { cn } from "@/lib/utils";
import { STATUS_LABEL, type StatusPedido } from "@/lib/mock/data";

const map: Record<StatusPedido, string> = {
  recebido: "bg-white/[0.05] text-foreground border-white/10",
  analise: "bg-white/[0.05] text-muted-foreground border-white/10",
  aprovado: "bg-primary/10 text-primary border-primary/20",
  separacao: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  conferencia: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  embalagem: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  aguardando_coleta: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  coletado: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  em_transporte: "bg-blue-500/10 text-blue-300 border-blue-500/20",
  cd: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  saiu_entrega: "bg-purple-500/10 text-purple-300 border-purple-500/20",
  entregue: "bg-primary/15 text-primary border-primary/30",
  cancelado: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function StatusBadge({ status }: { status: StatusPedido }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
        map[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABEL[status]}
    </span>
  );
}
