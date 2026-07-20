import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { QuoteHome } from "@/components/quote-home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LogiFinder — Cotação Inteligente de Fretes" },
      {
        name: "description",
        content:
          "Cotação de frete em tempo real com as principais transportadoras do Brasil. Compare valores, prazos e economize.",
      },
      { property: "og:title", content: "LogiFinder — Cotação Inteligente de Fretes" },
      {
        property: "og:description",
        content:
          "Encontre o melhor frete em segundos. Rodonaves, Braspress, Jadlog, Alfa Transportes e mais em uma única plataforma.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppLayout>
      <QuoteHome />
    </AppLayout>
  );
}
