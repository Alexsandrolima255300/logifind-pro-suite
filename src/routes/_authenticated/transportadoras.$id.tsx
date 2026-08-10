import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { CarrierEditor } from "@/components/carrier-editor";
import { CARRIERS } from "@/lib/mock/data";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/transportadoras/$id")({
  head: () => ({
    meta: [
      { title: "Editar transportadora — LogiFinder" },
      { name: "description", content: "Edite tarifas, prazos e cidades atendidas da transportadora, com importação inteligente de planilhas por IA." },
      { property: "og:title", content: "Editar transportadora — LogiFinder" },
      { property: "og:description", content: "Cadastro, tarifas, cidades atendidas e assistente de IA para planilhas de frete." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditarTransportadora,
});

function EditarTransportadora() {
  const { id } = Route.useParams();
  const carrier = CARRIERS.find((c) => c.id === id);
  const nome = carrier?.nome ?? id;

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <Link to="/transportadoras" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Voltar para transportadoras
        </Link>
        <PageHeader
          eyebrow="Cadastro · Cobertura · IA"
          title={nome}
          description="Edite tarifas e prazos, adicione ou remova cidades atendidas e use a IA para ler planilhas em Excel e cadastrar as cidades automaticamente."
        />
        <CarrierEditor carrierId={id} carrierNome={nome} />
      </div>
    </AppLayout>
  );
}
