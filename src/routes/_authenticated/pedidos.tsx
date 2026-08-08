import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PEDIDOS, BRL, getCliente, getCarrier } from "@/lib/mock/data";
import { ArrowUpRight, MapPin } from "lucide-react";

export const Route = createFileRoute("/_authenticated/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos — LogiFinder" },
      { name: "description", content: "Todos os pedidos da operação com status, transportadora, previsão e rastreio." },
      { property: "og:title", content: "Pedidos — LogiFinder" },
      { property: "og:description", content: "Gestão completa da jornada do pedido." },
    ],
  }),
  component: PedidosPage,
});

function PedidosPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Operação · Tempo real"
          title="Pedidos"
          description="Acompanhe a jornada de cada pedido, do recebimento à entrega."
        />
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-6 py-3">Nº</th>
                  <th className="text-left font-medium px-6 py-3">Cliente</th>
                  <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Rota</th>
                  <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Transportadora</th>
                  <th className="text-left font-medium px-6 py-3 hidden lg:table-cell">Previsão</th>
                  <th className="text-left font-medium px-6 py-3">Valor</th>
                  <th className="text-left font-medium px-6 py-3">Status</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {PEDIDOS.map((p, i) => {
                  const cli = getCliente(p.clienteId);
                  const car = getCarrier(p.transportadora);
                  return (
                    <tr key={p.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] animate-in fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="px-6 py-4 text-sm font-mono text-primary">#{p.numero}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium truncate max-w-[200px]">{cli?.nomeFantasia}</div>
                        <div className="text-[11px] text-muted-foreground">{p.vendedor}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{p.origemCidade}/{p.origemUf} → {p.destinoCidade}/{p.destinoUf}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm hidden md:table-cell">{car.nome}</td>
                      <td className="px-6 py-4 text-sm hidden lg:table-cell">
                        <span className={p.atrasado ? "text-yellow-400" : "text-muted-foreground"}>{p.previsao}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">{BRL(p.valor)}</td>
                      <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-4">
                        <Link to="/pedidos/$id" params={{ id: p.numero }} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
                          Abrir <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
