import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { Bell, Mail, Palette, Sliders, Truck, KeyRound } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — LogiFinder" },
      { name: "description", content: "Preferências da empresa, regras comerciais, notificações e integrações." },
      { property: "og:title", content: "Configurações — LogiFinder" },
      { property: "og:description", content: "Personalize regras, transportadoras preferenciais e notificações." },
    ],
  }),
  component: Configuracoes,
});

const groups = [
  { icon: Sliders, title: "Regras comerciais", desc: "Limite de 1,5% sobre NF-e, faixa de peso, kg excedente, Ad Valorem e GRIS." },
  { icon: Truck, title: "Transportadoras preferenciais", desc: "Priorização automática por rota, prazo e custo." },
  { icon: Bell, title: "Notificações", desc: "Ative alertas por status, atraso, ocorrência e valor." },
  { icon: Mail, title: "E-mails automáticos", desc: "Modelos HTML enviados a cada mudança de status." },
  { icon: KeyRound, title: "APIs e integrações", desc: "Rodonaves, Braspress, Jadlog, União Express, Alfa, Jamef, Correios." },
  { icon: Palette, title: "Aparência", desc: "Tema, logotipo, cores da marca no portal do cliente." },
];

function Configuracoes() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1080px] p-4 md:p-8 space-y-6">
        <PageHeader eyebrow="Sistema" title="Configurações" description="Personalize a operação LogiFinder para a sua empresa." />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((g, i) => {
            const Icon = g.icon;
            return (
              <button key={g.title} className="glass rounded-2xl p-5 text-left hover:border-primary/30 transition group animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:scale-110 transition">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-base font-bold">{g.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{g.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
