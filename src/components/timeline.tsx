import { CheckCircle2, Circle, Truck, MapPin, Package as PackageIcon } from "lucide-react";
import { STATUS_LABEL, STATUS_ORDER, type Pedido, type StatusPedido } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

const icons: Partial<Record<StatusPedido, typeof CheckCircle2>> = {
  coletado: Truck,
  em_transporte: Truck,
  cd: PackageIcon,
  saiu_entrega: Truck,
  entregue: MapPin,
};

export function Timeline({ pedido }: { pedido: Pedido }) {
  const currentIdx = STATUS_ORDER.indexOf(pedido.status);
  const events = new Map(pedido.timeline.map((e) => [e.status, e]));

  return (
    <ol className="relative space-y-6">
      <span className="absolute left-[15px] top-2 bottom-2 w-px bg-white/[0.08]" aria-hidden />
      {STATUS_ORDER.map((s, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        const ev = events.get(s);
        const Icon = icons[s] ?? (done ? CheckCircle2 : Circle);
        return (
          <li key={s} className="relative flex gap-4 pl-0">
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                done
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_16px_-4px_oklch(0.74_0.18_152/0.7)]"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground",
                active && "scale-110",
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={2.5} />
              {active && <span className="absolute inset-0 rounded-full animate-pulse-ring" />}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className={cn("text-sm font-semibold", done ? "text-foreground" : "text-muted-foreground")}>
                {STATUS_LABEL[s]}
              </div>
              {ev ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {ev.data} · {ev.hora} · {ev.usuario}
                  {ev.obs && <div className="mt-1 text-[11px] text-muted-foreground/80 italic">{ev.obs}</div>}
                </div>
              ) : (
                <div className="mt-0.5 text-xs text-muted-foreground/50">Aguardando</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
