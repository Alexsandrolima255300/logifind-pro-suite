import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Dashboard } from "@/components/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LogiFinder — Cotação de Fretes para Grandes Operações" },
      {
        name: "description",
        content:
          "Plataforma premium de cotação de fretes integrada a Rodonaves, Braspress, Jadlog e Alfa Transportes. Compare, negocie e economize em segundos.",
      },
      { property: "og:title", content: "LogiFinder — Cotação Inteligente de Fretes" },
      {
        property: "og:description",
        content:
          "Compare cotações das principais transportadoras do Brasil em uma única plataforma. Economia, controle e velocidade para grandes operações logísticas.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
