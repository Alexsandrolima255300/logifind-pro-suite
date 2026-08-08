import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { CLIENTES, BRL } from "@/lib/mock/data";
import { Building2, Plus, Search } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({
    meta: [
      { title: "Clientes — LogiFinder" },
      { name: "description", content: "Cadastro de clientes com histórico de pedidos, contatos e ticket total." },
      { property: "og:title", content: "Clientes — LogiFinder" },
      { property: "og:description", content: "Gestão da base de clientes atendidos." },
    ],
  }),
  component: Clientes,
});

function Clientes() {
  const [q, setQ] = useState("");
  const list = CLIENTES.filter(
    (c) => !q || c.razaoSocial.toLowerCase().includes(q.toLowerCase()) || c.cnpj.includes(q) || c.nomeFantasia.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1280px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Base"
          title="Clientes"
          description="Cadastro completo com endereço, contato e histórico de compras."
          actions={
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 transition">
              <Plus className="h-4 w-4" /> Novo Cliente
            </button>
          }
        />
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por razão social, nome fantasia ou CNPJ…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {list.map((c, i) => (
            <div key={c.id} className="glass rounded-2xl p-5 hover:border-primary/30 transition animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-base font-bold truncate">{c.nomeFantasia}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{c.razaoSocial}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{c.cnpj}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat label="Pedidos" value={String(c.totalPedidos)} />
                <Stat label="Total" value={BRL(c.totalComprado)} />
                <Stat label="Última" value={c.ultimaCompra.slice(5)} />
              </div>
              <div className="mt-4 text-xs text-muted-foreground space-y-1">
                <div>{c.contato} · {c.telefone}</div>
                <div>{c.cidade} / {c.uf}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] py-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-bold">{value}</div>
    </div>
  );
}
