import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { PEDIDOS, getCarrier } from "@/lib/mock/data";
import { Radar, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/rastreamento")({
  head: () => ({
    meta: [
      { title: "Rastreamento — LogiFinder" },
      { name: "description", content: "Rastreie qualquer pedido pelo código da transportadora, com timeline completa e última localização." },
      { property: "og:title", content: "Rastreamento — LogiFinder" },
      { property: "og:description", content: "Acompanhamento em tempo real da entrega." },
    ],
  }),
  component: Rastreio,
});

function Rastreio() {
  const [q, setQ] = useState("");
  const found = q ? PEDIDOS.find((p) => p.codigoRastreio.toLowerCase().includes(q.toLowerCase()) || p.numero.includes(q)) : PEDIDOS[0];

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1080px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Central de Rastreamento" title="Rastreie sua entrega" description="Digite o código de rastreio ou número do pedido." />

        <div className="glass-strong rounded-3xl p-5 md:p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex.: RD-9821-4471 ou 10548"
              className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] pl-12 pr-4 text-base font-medium focus:outline-none focus:border-primary/50 focus:bg-white/[0.06]"
            />
          </div>
        </div>

        {found ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="text-sm font-semibold">Linha do tempo</div>
                <StatusBadge status={found.status} />
              </div>
              <Timeline pedido={found} />
            </div>
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Transportadora</div>
                <div className="text-lg font-bold">{getCarrier(found.transportadora).nome}</div>
                <div className="mt-3 text-xs text-muted-foreground">Código</div>
                <div className="font-mono text-sm text-primary">{found.codigoRastreio}</div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Última localização</div>
                <div className="flex items-center gap-2 text-sm">
                  <Radar className="h-4 w-4 text-primary" />
                  {found.timeline.at(-1)?.usuario} · {found.timeline.at(-1)?.data} {found.timeline.at(-1)?.hora}
                </div>
              </div>
              <div className="glass rounded-2xl p-5">
                <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 mb-2">Previsão de entrega</div>
                <div className="text-2xl font-bold text-gradient-green">{found.previsao}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 text-center text-muted-foreground">Nenhum pedido encontrado com esse código.</div>
        )}
      </div>
    </AppLayout>
  );
}
