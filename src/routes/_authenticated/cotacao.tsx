import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { QuoteEngine } from "@/components/quote-engine";

export const Route = createFileRoute("/_authenticated/cotacao")({
  head: () => ({
    meta: [
      { title: "Nova Cotação — LogiFinder" },
      { name: "description", content: "Compare valores, prazos e cobertura das principais transportadoras do Brasil em uma única cotação inteligente." },
      { property: "og:title", content: "Cotação Inteligente — LogiFinder" },
      { property: "og:description", content: "Motor de cotação com cubagem, peso tarifável e filtro de cobertura por transportadora." },
    ],
  }),
  component: () => <AppLayout><QuoteEngine /></AppLayout>,
});
