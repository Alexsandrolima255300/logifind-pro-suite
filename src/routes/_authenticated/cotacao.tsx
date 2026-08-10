import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PremiumQuoteEngine } from "@/components/premium-quote-engine";

export const Route = createFileRoute("/_authenticated/cotacao")({
  head: () => ({
    meta: [
      { title: "Nova Cotação — LogiFinder" },
      { name: "description", content: "Cotação inteligente de fretes com consulta de CNPJ, CEP, cubagem e comparação de transportadoras." },
    ],
  }),
  component: () => <AppLayout><PremiumQuoteEngine /></AppLayout>,
});
