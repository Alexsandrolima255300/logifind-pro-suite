import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PEDIDOS, OCORRENCIAS, BRL, getCliente, getCarrier } from "@/lib/mock/data";
import { TrendingUp, ShoppingCart, DollarSign, Users, AlertTriangle, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/vendedor")({
  head: () => ({
    meta: [
      { title: "Painel do Vendedor — LogiFinder" },
      { name: "description", content: "Acompanhe pedidos, timeline, ocorrências e comissões dos seus clientes." },
      { property: "og:title", content: "Painel do Vendedor — LogiFinder" },
      { property: "og:description", content: "Central do vendedor com KPIs, pedidos, ocorrências e comunicação." },
    ],
  }),
  component: Vendedor,
});

function Vendedor() {
  const vendedor = "Marcos Costa";
  const meus = PEDIDOS.filter((p) => p.vendedor === vendedor);
  const total = meus.reduce((s, p) => s + p.valor, 0);
  const kpis = [
    { label: "Pedidos do dia", value: String(meus.length), icon: ShoppingCart, delta: "+3", up: true },
    { label: "Ticket médio", value: BRL(total / Math.max(1, meus.length)), icon: TrendingUp, delta: "+8,2%", up: true },
    { label: "Faturamento", value: BRL(total), icon: DollarSign, delta: "+12%", up: true },
    { label: "Clientes atendidos", value: String(new Set(meus.map((p) => p.clienteId)).size), icon: Users, delta: "+1", up: true },
  ];

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow={`Vendedor · ${vendedor}`}
          title="Painel do Vendedor"
          description="Acompanhe todos os pedidos dos seus clientes em tempo real, sem depender de outros setores."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map((k, i) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="glass rounded-2xl p-4 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-semibold text-primary">{k.delta}</span>
                </div>
                <div className="mt-4 text-xl md:text-2xl font-bold tracking-tight">{k.value}</div>
                <div className="text-xs text-muted-foreground">{k.label}</div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 glass rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.05] text-sm font-semibold">Meus pedidos</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-5 py-3">Nº</th>
                  <th className="text-left font-medium px-5 py-3">Cliente</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3 hidden md:table-cell">Transp.</th>
                  <th className="text-left font-medium px-5 py-3">Valor</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {meus.map((p) => (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-5 py-3 font-mono text-primary">#{p.numero}</td>
                    <td className="px-5 py-3">{getCliente(p.clienteId)?.nomeFantasia}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">{getCarrier(p.transportadora).nome}</td>
                    <td className="px-5 py-3 font-semibold">{BRL(p.valor)}</td>
                    <td className="px-5 py-3">
                      <Link to="/pedidos/$id" params={{ id: p.numero }} className="text-xs text-primary flex items-center gap-1">
                        Abrir <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm font-semibold mb-4">
              <AlertTriangle className="h-4 w-4 text-yellow-400" /> Ocorrências abertas
            </div>
            <div className="space-y-3">
              {OCORRENCIAS.map((o) => (
                <div key={o.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-mono text-primary">{o.pedido}</div>
                    <span className="text-[10px] uppercase tracking-wider text-yellow-400">{o.status.replace("_", " ")}</span>
                  </div>
                  <div className="text-sm font-medium">{o.tipo}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{o.descricao}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-2">{o.data} · {o.hora} · {o.responsavel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
