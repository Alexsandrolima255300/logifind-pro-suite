import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { CIDADES_ATENDIDAS } from "@/lib/mock/data";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/cidades")({
  head: () => ({
    meta: [
      { title: "Cidades — LogiFinder" },
      { name: "description", content: "Cidades atendidas por transportadora e prazo médio de entrega." },
      { property: "og:title", content: "Cidades atendidas — LogiFinder" },
      { property: "og:description", content: "Mapa de cobertura por município." },
    ],
  }),
  component: Cidades,
});

function Cidades() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Cobertura" title="Cidades atendidas" description="Municípios cobertos por cada transportadora, com prazo médio de entrega." />
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-6 py-3">Cidade</th>
                <th className="text-left font-medium px-6 py-3">UF</th>
                <th className="text-left font-medium px-6 py-3">Transportadora</th>
                <th className="text-left font-medium px-6 py-3">Prazo (dias)</th>
              </tr>
            </thead>
            <tbody>
              {CIDADES_ATENDIDAS.map((c, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-6 py-3 flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary" />{c.cidade}</td>
                  <td className="px-6 py-3 font-mono text-primary">{c.uf}</td>
                  <td className="px-6 py-3">{c.transportadora}</td>
                  <td className="px-6 py-3 font-semibold">{c.prazo}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
