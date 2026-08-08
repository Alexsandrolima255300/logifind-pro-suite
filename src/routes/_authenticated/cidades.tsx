import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { CoverageManager } from "@/components/coverage-manager";

export const Route = createFileRoute("/cidades")({
  head: () => ({
    meta: [
      { title: "Base de Atendimento — LogiFinder" },
      { name: "description", content: "Importe e gerencie as cidades atendidas por cada transportadora: prazos PJ/PF, quilometragem, frequência e status." },
      { property: "og:title", content: "Base de Atendimento — LogiFinder" },
      { property: "og:description", content: "Cidades atendidas por transportadora, importadas de planilha e usadas automaticamente na cotação." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cidades,
});

function Cidades() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Cobertura"
          title="Base de atendimento"
          description="Importe a planilha de cidades atendidas de cada transportadora. A base fica salva no banco e é usada automaticamente na cotação para validar cobertura e definir o prazo de entrega."
        />
        <CoverageManager />
      </div>
    </AppLayout>
  );
}
