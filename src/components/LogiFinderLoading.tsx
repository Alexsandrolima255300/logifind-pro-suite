import { useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const labels: Record<string, string> = {
  "/": "Carregando dashboard...",
  "/cotacao": "Preparando nova cotação...",
  "/cotacoes": "Carregando cotações...",
  "/transportadoras": "Carregando transportadoras...",
  "/rastreio": "Consultando rastreamento...",
  "/rastreamento": "Consultando rastreamento...",
  "/clientes": "Carregando clientes...",
  "/configuracoes": "Carregando configurações...",
};

function getLoadingLabel(pathname: string) {
  const exact = labels[pathname];
  if (exact) return exact;
  if (/transport/i.test(pathname)) return "Carregando transportadoras...";
  if (/cot/i.test(pathname)) return "Carregando cotações...";
  if (/rast|track/i.test(pathname)) return "Consultando rastreamento...";
  if (/cliente|empresa/i.test(pathname)) return "Carregando cadastros...";
  if (/config/i.test(pathname)) return "Carregando configurações...";
  return "Carregando página...";
}

export function LogiFinderLoading() {
  const status = useRouterState({ select: (state) => state.status });
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  if (status !== "pending") return null;

  return (
    <>
      <style>{`
        @keyframes lf-slide{0%{transform:translateX(-120%)}50%{transform:translateX(25%)}100%{transform:translateX(120%)}}
        @keyframes lf-pulse{0%,100%{transform:scale(.9);opacity:.5}50%{transform:scale(1.05);opacity:1}}
        @keyframes lf-ring{0%{transform:scale(.55);opacity:.8}100%{transform:scale(1.55);opacity:0}}
        @keyframes lf-dot{0%,80%,100%{transform:scale(.5);opacity:.3}40%{transform:scale(1);opacity:1}}
        @keyframes lf-shimmer{0%{background-position:-220% 0}100%{background-position:220% 0}}
        .lf-load-bar{position:fixed;top:0;left:0;right:0;height:3px;z-index:99999;overflow:hidden;pointer-events:none}
        .lf-load-bar:after{content:"";display:block;width:42%;height:100%;background:linear-gradient(90deg,transparent,#f59e0b,#fde68a,transparent);box-shadow:0 0 18px #f59e0b;animation:lf-slide 1.1s cubic-bezier(.4,0,.2,1) infinite}
        .lf-load-overlay{position:fixed;inset:0;z-index:99998;display:grid;place-items:center;background:rgba(10,8,6,.42);backdrop-filter:blur(5px);pointer-events:none}
        .lf-load-card{min-width:205px;display:flex;flex-direction:column;align-items:center;gap:10px;padding:20px 24px;border:1px solid rgba(245,158,11,.25);border-radius:20px;background:linear-gradient(135deg,rgba(31,25,18,.96),rgba(13,11,9,.96));box-shadow:0 25px 80px -35px #000,0 0 45px -25px rgba(245,158,11,.7)}
        .lf-load-ring{position:relative;width:44px;height:44px;display:grid;place-items:center}.lf-load-ring:before,.lf-load-ring:after{content:"";position:absolute;inset:0;border:2px solid #f59e0b;border-radius:50%;animation:lf-ring 1.5s ease-out infinite}.lf-load-ring:after{animation-delay:.75s}.lf-load-ring span{width:11px;height:11px;border-radius:50%;background:#f59e0b;box-shadow:0 0 20px #f59e0b;animation:lf-pulse 1s ease-in-out infinite}
        .lf-load-dots{display:flex;gap:5px}.lf-load-dots i{width:6px;height:6px;border-radius:50%;background:#f59e0b;animation:lf-dot 1.1s ease-in-out infinite}.lf-load-dots i:nth-child(2){animation-delay:.15s}.lf-load-dots i:nth-child(3){animation-delay:.3s}
        .lf-load-shimmer{position:fixed;inset:0;z-index:99997;pointer-events:none;opacity:.08;background:linear-gradient(90deg,transparent 25%,rgba(255,255,255,.7) 50%,transparent 75%);background-size:220% 100%;animation:lf-shimmer 1.35s ease-in-out infinite}
        @media(prefers-reduced-motion:reduce){.lf-load-bar:after,.lf-load-ring:before,.lf-load-ring:after,.lf-load-dots i,.lf-load-shimmer{animation:none}}
      `}</style>
      <div className="lf-load-bar" aria-hidden="true" />
      <div className="lf-load-shimmer" aria-hidden="true" />
      <div className="lf-load-overlay" role="status" aria-live="polite">
        <div className="lf-load-card">
          <div className="lf-load-ring"><span /></div>
          <div className="text-sm font-bold text-foreground">{getLoadingLabel(pathname)}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Sincronizando dados</span>
            <div className="lf-load-dots"><i /><i /><i /></div>
          </div>
        </div>
      </div>
    </>
  );
}
