import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { NOTIFICACOES } from "@/lib/mock/data";
import { Bell, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notificacoes")({
  head: () => ({
    meta: [
      { title: "Notificações — LogiFinder" },
      { name: "description", content: "Central de notificações da operação em tempo real." },
      { property: "og:title", content: "Notificações — LogiFinder" },
      { property: "og:description", content: "Acompanhe todas as mudanças de status em um só lugar." },
    ],
  }),
  component: Notificacoes,
});

function Notificacoes() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[900px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Central" title="Notificações" description="Todas as atualizações da operação em tempo real." />
        <div className="glass rounded-2xl divide-y divide-white/[0.04]">
          {NOTIFICACOES.map((n, i) => {
            const Icon = n.tipo === "sucesso" ? CheckCircle2 : n.tipo === "alerta" ? AlertTriangle : Info;
            const color = n.tipo === "sucesso" ? "text-primary bg-primary/10 border-primary/20" : n.tipo === "alerta" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" : "text-blue-300 bg-blue-500/10 border-blue-500/20";
            return (
              <div key={n.id} className={cn("flex items-start gap-3 p-4 md:p-5 animate-in fade-in", !n.lida && "bg-white/[0.02]")} style={{ animationDelay: `${i * 40}ms` }}>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{n.titulo}</div>
                    {!n.lida && <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.74_0.18_152)]" />}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
                </div>
                <div className="text-[11px] text-muted-foreground whitespace-nowrap">{n.tempo}</div>
              </div>
            );
          })}
        </div>
        <div className="glass rounded-2xl p-4 flex items-center gap-3 text-xs text-muted-foreground">
          <Bell className="h-4 w-4 text-primary" />
          Notificações via e-mail e push são enviadas a cada mudança de status.
        </div>
      </div>
    </AppLayout>
  );
}
