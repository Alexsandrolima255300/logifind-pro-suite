import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

function GlobalUserNameFix() {
  useEffect(() => {
    const normalize = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const replacements: Array<[RegExp, string]> = [
        [/\bMarcos\b/gi, "Alexsandro"],
        [/\bMarcor\b/gi, "Alexsandro"],
        [/\bMarcoso\b/gi, "Alexsandro"],
      ];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const value = node.nodeValue;
        if (!value) continue;
        let next = value;
        for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
        if (next !== value) node.nodeValue = next;
      }
    };

    normalize();
    const observer = new MutationObserver(normalize);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return null;
}

function TrackingHomeButton() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isTracking = /rastre|track/i.test(pathname);

  if (!isTracking) return null;

  return (
    <Link
      to="/"
      aria-label="Voltar para o início"
      className="fixed left-5 top-5 z-[100] inline-flex items-center gap-2 rounded-xl border border-primary/50 bg-background/95 px-4 py-2.5 text-sm font-semibold text-primary shadow-[0_0_24px_-8px_var(--color-primary)] backdrop-blur-xl transition-all hover:bg-primary hover:text-primary-foreground"
    >
      <span aria-hidden="true">←</span>
      Voltar para o início
    </Link>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard — LogiFinder TMS" },
      {
        name: "description",
        content:
          "Painel executivo LogiFinder: pedidos do dia, economia gerada, entregas em trânsito e performance por transportadora.",
      },
      { name: "author", content: "LogiFinder" },
      { property: "og:title", content: "Dashboard — LogiFinder TMS" },
      {
        property: "og:description",
        content:
          "Painel executivo LogiFinder: pedidos do dia, economia gerada, entregas em trânsito e performance por transportadora.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dashboard — LogiFinder TMS" },
      { name: "twitter:description", content: "Painel executivo LogiFinder: pedidos do dia, economia gerada, entregas em trânsito e performance por transportadora." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eae00810-e7e6-41c6-a4cf-1e41e94bef9b/id-preview-7d3cb578--50516af8-e796-4e2f-a7f4-a8c43bbaf9c6.lovable.app-1784718444874.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/eae00810-e7e6-41c6-a4cf-1e41e94bef9b/id-preview-7d3cb578--50516af8-e796-4e2f-a7f4-a8c43bbaf9c6.lovable.app-1784718444874.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalUserNameFix />
      <TrackingHomeButton />
      <Outlet />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  );
}
