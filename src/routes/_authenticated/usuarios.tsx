import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { USUARIOS } from "@/lib/mock/data";
import { Plus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/usuarios")({
  head: () => ({
    meta: [
      { title: "Usuários — LogiFinder" },
      { name: "description", content: "Gestão de usuários, perfis e permissões da plataforma." },
      { property: "og:title", content: "Usuários — LogiFinder" },
      { property: "og:description", content: "Controle de acesso por perfil e permissão." },
    ],
  }),
  component: Usuarios,
});

function Usuarios() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1080px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Acesso"
          title="Usuários"
          description="Administradores, supervisores, vendedores, expedição e clientes."
          actions={
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 transition">
              <Plus className="h-4 w-4" /> Novo Usuário
            </button>
          }
        />
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-6 py-3">Usuário</th>
                <th className="text-left font-medium px-6 py-3">Perfil</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Último acesso</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {USUARIOS.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/40 to-emerald-800/40 border border-white/10 flex items-center justify-center text-[11px] font-bold">
                        {u.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div className="font-medium">{u.nome}</div>
                        <div className="text-[11px] text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                      <Shield className="h-3 w-3" /> {u.perfil}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{u.ultimoAcesso}</td>
                  <td className="px-6 py-3">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]",
                      u.ativo ? "border-primary/20 bg-primary/10 text-primary" : "border-red-500/20 bg-red-500/10 text-red-400")}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
