import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { Mail, Phone, Shield, Building2 } from "lucide-react";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — LogiFinder" },
      { name: "description", content: "Dados pessoais, cargo e preferências de conta." },
      { property: "og:title", content: "Meu Perfil — LogiFinder" },
      { property: "og:description", content: "Gestão da conta e credenciais." },
    ],
  }),
  component: Perfil,
});

function Perfil() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[900px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Conta" title="Meu Perfil" description="Suas informações pessoais e credenciais." />
        <div className="glass rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-2xl font-bold text-black shadow-[0_20px_60px_-15px_oklch(0.74_0.18_152/0.8)]">
            BEC
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-2xl font-bold">BRASIL ENGRENAGENS E CORRENTES</div>
            <div className="text-sm text-muted-foreground">Administrador · Gestor de Logística</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] text-primary">
                <Shield className="h-3 w-3" /> Administrador
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] text-muted-foreground">
                BRASIL ENGRENAGENS E CORRENTES
              </span>
            </div>
          </div>
        </div>
        <div className="glass rounded-2xl p-5 md:p-6 space-y-3">
          <Row icon={Mail} label="E-mail" value="marcos@logifinder.io" />
          <Row icon={Phone} label="Telefone" value="(11) 99887-4400" />
          <Row icon={Building2} label="Empresa" value="Aurora Logística Ltda · CNPJ 44.821.007/0001-19" />
        </div>
      </div>
    </AppLayout>
  );
}
function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
