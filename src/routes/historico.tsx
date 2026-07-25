import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { PEDIDOS, BRL, getCarrier, getCliente } from "@/lib/mock/data";
import { StatusBadge } from "@/components/status-badge";
import { Filter, Download } from "lucide-react";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico — LogiFinder" },
      { name: "description", content: "Histórico completo de cotações e pedidos com filtros avançados." },
      { property: "og:title", content: "Histórico — LogiFinder" },
      { property: "og:description", content: "Consulte e exporte o histórico completo da operação." },
    ],
  }),
  component: Historico,
});

function Historico() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Registros"
          title="Histórico"
          description="Todas as cotações e pedidos com filtros por cidade, estado, cliente, transportadora, data e status."
          actions={
            <>
              <button className="glass rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06]">
                <Filter className="h-3.5 w-3.5" /> Filtros
              </button>
              <button className="glass rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06]">
                <Download className="h-3.5 w-3.5" /> Exportar Excel
              </button>
            </>
          }
        />
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-6 py-3">Nº</th>
                <th className="text-left font-medium px-6 py-3">Data</th>
                <th className="text-left font-medium px-6 py-3">Cliente</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Rota</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Transportadora</th>
                <th className="text-left font-medium px-6 py-3">Valor</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {PEDIDOS.map((p, i) => (
                <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] animate-in fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="px-6 py-3 font-mono text-primary">#{p.numero}</td>
                  <td className="px-6 py-3 text-muted-foreground">{p.dataVenda}</td>
                  <td className="px-6 py-3 truncate max-w-[200px]">{getCliente(p.clienteId)?.nomeFantasia}</td>
                  <td className="px-6 py-3 hidden md:table-cell text-muted-foreground">{p.origemUf} → {p.destinoCidade}/{p.destinoUf}</td>
                  <td className="px-6 py-3 hidden md:table-cell">{getCarrier(p.transportadora).nome}</td>
                  <td className="px-6 py-3 font-semibold">{BRL(p.valor)}</td>
                  <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
