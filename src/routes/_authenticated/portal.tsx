import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Timeline } from "@/components/timeline";
import { PEDIDOS, getCarrier, getCliente, BRL } from "@/lib/mock/data";
import { Package, Download, Phone, Mail } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "Portal do Cliente — LogiFinder" },
      { name: "description", content: "Acompanhe seus pedidos, timeline de entrega, transportadora e documentos." },
      { property: "og:title", content: "Portal do Cliente — LogiFinder" },
      { property: "og:description", content: "Área exclusiva do cliente com rastreamento em tempo real." },
    ],
  }),
  component: Portal,
});

function Portal() {
  const pedido = PEDIDOS[0];
  const cli = getCliente(pedido.clienteId);
  const car = getCarrier(pedido.transportadora);

  return (
    <div className="min-h-screen grid-noise">
      <header className="glass sticky top-0 z-30 border-b border-white/[0.05]">
        <div className="mx-auto max-w-[1200px] flex h-16 items-center gap-3 px-4 md:px-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600">
            <Package className="h-5 w-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-bold">Logi<span className="text-gradient-green">Finder</span></div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Portal do Cliente</div>
          </div>
          <div className="ml-auto text-xs text-muted-foreground hidden md:block">{cli?.nomeFantasia}</div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow={`Pedido #${pedido.numero} · ${car.nome}`}
          title={`Olá, ${cli?.contato.split(" ")[0]}`}
          description={`Seu pedido está a caminho de ${pedido.destinoCidade}/${pedido.destinoUf}. Previsão de entrega: ${pedido.previsao}.`}
          actions={<StatusBadge status={pedido.status} />}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl p-5 md:p-6">
            <div className="text-sm font-semibold mb-5">Acompanhe sua entrega</div>
            <Timeline pedido={pedido} />
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl p-5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80">Previsão de entrega</div>
              <div className="text-3xl font-bold text-gradient-green mt-1">{pedido.previsao}</div>
              <div className="mt-3 text-xs text-muted-foreground">Rastreio · <span className="font-mono text-primary">{pedido.codigoRastreio}</span></div>
            </div>
            <div className="glass rounded-2xl p-5 space-y-2 text-sm">
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Resumo</div>
              <Row k="Volumes" v={`${pedido.volumes}`} />
              <Row k="Peso" v={`${pedido.peso} kg`} />
              <Row k="Valor" v={BRL(pedido.valor)} />
              <Row k="Transportadora" v={car.nome} />
            </div>
            <div className="glass rounded-2xl p-5 space-y-3">
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary/15 border border-primary/30 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition">
                <Download className="h-4 w-4" /> Baixar comprovante
              </button>
              <div className="text-[11px] text-muted-foreground text-center pt-2 border-t border-white/[0.04]">
                Precisa de ajuda?
              </div>
              <div className="flex gap-2 text-xs">
                <a className="flex-1 rounded-lg bg-white/[0.03] border border-white/10 py-2 text-center hover:bg-white/[0.06]" href={`tel:${car.telefone}`}><Phone className="h-3 w-3 inline mr-1" /> Ligar</a>
                <a className="flex-1 rounded-lg bg-white/[0.03] border border-white/10 py-2 text-center hover:bg-white/[0.06]" href={`mailto:${car.email}`}><Mail className="h-3 w-3 inline mr-1" /> E-mail</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
