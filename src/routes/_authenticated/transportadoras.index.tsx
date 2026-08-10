import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { CARRIERS, COVERAGE, ESTADOS } from "@/lib/mock/data";
import { Star, Check, X, Phone, Mail, Globe, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/_authenticated/transportadoras/")({
  head: () => ({
    meta: [
      { title: "Transportadoras — LogiFinder" },
      { name: "description", content: "Cadastro completo de transportadoras parceiras e cobertura por estado." },
      { property: "og:title", content: "Transportadoras — LogiFinder" },
      { property: "og:description", content: "Cobertura, contato e avaliação de cada transportadora parceira." },
    ],
  }),
  component: Transportadoras,
});

function Transportadoras() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Cadastro · Cobertura" title="Transportadoras" description="Clique em uma transportadora para editar tarifas, prazos e as cidades atendidas — com importação de planilhas por IA." />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARRIERS.map((c, i) => (
            <Link
              key={c.id}
              to="/transportadoras/$id"
              params={{ id: c.id }}
              className="glass rounded-2xl p-5 block text-left hover:border-primary/40 hover:-translate-y-0.5 transition animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold">{c.nome}</div>
                  <div className="text-[11px] text-muted-foreground font-mono">{c.cnpj}</div>
                </div>
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", c.ativo ? "bg-primary/10 text-primary border-primary/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <Kpi label="Prazo" value={`${c.prazoMedio}d`} />
                <Kpi label="R$/kg" value={c.valorPorKg.toFixed(2)} />
                <Kpi label="Rating" value={c.rating.toFixed(1)} icon={<Star className="h-3 w-3 fill-primary text-primary" />} />
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {c.telefone}</div>
                <div className="flex items-center gap-2"><Mail className="h-3 w-3" /> {c.email}</div>
                <div className="flex items-center gap-2"><Globe className="h-3 w-3" /> {c.site}</div>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Pencil className="h-3 w-3" /> Editar cadastro e cidades
              </div>
            </Link>
          ))}
        </div>


        <div className="glass rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/[0.05]">
            <div className="text-sm font-semibold">Matriz de cobertura</div>
            <div className="text-xs text-muted-foreground mt-1">Filtra automaticamente antes de qualquer cotação.</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.04] text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-4 py-3">UF</th>
                  <th className="text-left font-medium px-4 py-3">Estado</th>
                  {CARRIERS.map((c) => <th key={c.id} className="px-4 py-3 text-center font-medium">{c.nome.split(" ")[0]}</th>)}
                </tr>
              </thead>
              <tbody>
                {COVERAGE.map((row) => {
                  const nome = ESTADOS.find((e) => e.uf === row.uf)?.nome ?? row.uf;
                  const flags = { rodonaves: row.rodonaves, braspress: row.braspress, danubio: row.danubio, alfa: row.alfa, uniao: row.uniao, jadlog: row.jadlog };
                  return (
                    <tr key={row.uf} className="border-b border-white/[0.03] last:border-0">
                      <td className="px-4 py-2.5 font-mono font-semibold text-primary">{row.uf}</td>
                      <td className="px-4 py-2.5">{nome}</td>
                      {CARRIERS.map((c) => (
                        <td key={c.id} className="px-4 py-2.5 text-center">
                          {flags[c.id as keyof typeof flags] ? <Check className="mx-auto h-4 w-4 text-primary" /> : <X className="mx-auto h-4 w-4 text-red-500/60" />}
                        </td>
                      ))}
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

function Kpi({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1 text-sm font-bold">{icon}{value}</div>
    </div>
  );
}
