import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PremiumDashboard } from "@/components/premium-dashboard";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Dashboard — LogiFinder TMS" },
      { name: "description", content: "Painel executivo LogiFinder para cotação e gestão logística." },
    ],
  }),
  component: () => <AppLayout><PremiumDashboard /></AppLayout>,
});
