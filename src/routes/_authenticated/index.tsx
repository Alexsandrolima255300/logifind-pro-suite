import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { Dashboard } from "@/components/dashboard";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LogiFinder TMS" },
      { name: "description", content: "Painel executivo LogiFinder: pedidos do dia, economia gerada, entregas em trânsito e performance por transportadora." },
      { property: "og:title", content: "Dashboard — LogiFinder TMS" },
      { property: "og:description", content: "Painel executivo LogiFinder: pedidos do dia, economia gerada, entregas em trânsito e performance por transportadora." },
    ],
  }),
  component: () => <AppLayout><Dashboard /></AppLayout>,
});
