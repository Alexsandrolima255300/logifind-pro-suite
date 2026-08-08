import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { RodonavesPanel } from "@/components/rodonaves-panel";

export const Route = createFileRoute("/_authenticated/rodonaves")({
  head: () => ({
    meta: [
      { title: "Integração Rodonaves — LogiFinder" },
      { name: "description", content: "Painel de integração com a API Rodonaves: autenticação segura, descoberta de endpoints e testes de requisições." },
      { property: "og:title", content: "Integração Rodonaves — LogiFinder" },
      { property: "og:description", content: "Autentique, explore endpoints e teste a API Rodonaves com segurança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RodonavesPage,
});

function RodonavesPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] space-y-6">
        <PageHeader
          eyebrow="Integrações"
          title="API Rodonaves"
          description="Conexão automática e segura, descoberta de endpoints da conta e testes de requisições em tempo real."
        />
        <RodonavesPanel />
      </div>
    </AppLayout>
  );
}
