import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { AuditPanel } from "@/components/audit-panel";

export const Route = createFileRoute("/auditoria")({
  head: () => ({
    meta: [
      { title: "Auditoria de Fretes — LogiFinder" },
      {
        name: "description",
        content:
          "Agente auditor somente leitura que compara notas fiscais com CT-es recebidos e aponta divergências de valor e transportadora.",
      },
      { property: "og:title", content: "Auditoria de Fretes — LogiFinder" },
      {
        property: "og:description",
        content: "Conferência automática de NF x CT-e com relatório exportável em Excel e PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Auditoria,
});

function Auditoria() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1200px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Agente auditor"
          title="Auditoria de Fretes"
          description="Conferência automática entre as notas fiscais e os CT-es recebidos das transportadoras. Operação exclusivamente de consulta — nada é alterado nos sistemas de origem."
        />
        <AuditPanel />
      </div>
    </AppLayout>
  );
}
