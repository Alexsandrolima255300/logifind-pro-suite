import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const labels: Record<string, string> = {
  "/": "Carregando dashboard",
  "/cotacao": "Preparando nova cotação",
  "/cotacoes": "Carregando cotações",
  "/transportadoras": "Carregando transportadoras",
  "/rastreio": "Consultando rastreamento",
  "/rastreamento": "Consultando rastreamento",
  "/clientes": "Carregando clientes",
  "/configuracoes": "Carregando configurações",
};

function getLoadingLabel(pathname: string) {
  if (labels[pathname]) return labels[pathname];
  if (/transport/i.test(pathname)) return "Carregando transportadoras";
  if (/cot/i.test(pathname)) return "Carregando cotações";
  if (/rast|track/i.test(pathname)) return "Consultando rastreamento";
  if (/cliente|empresa/i.test(pathname)) return "Carregando cadastros";
  if (/config/i.test(pathname)) return "Carregando configurações";
  return "Carregando página";
}

export function LogiFinderLoading() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="lf-loading" role="status" aria-live="polite">
      <style>{`
        @keyframes lf-fade{from{opacity:0}to{opacity:1}}
        @keyframes lf-logo{0%,100%{transform:translateY(0);opacity:.82}50%{transform:translateY(-3px);opacity:1}}
        @keyframes lf-glow{0%,100%{opacity:.3;transform:scale(.94)}50%{opacity:.7;transform:scale(1.06)}}
        @keyframes lf-dot{0%,70%,100%{transform:translateY(0);opacity:.3}35%{transform:translateY(-3px);opacity:1}}
        @keyframes lf-progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}
        .lf-loading{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:rgba(7,8,11,.68);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:lf-fade .16s ease-out}
        .lf-loading-card{position:relative;width:min(360px,calc(100vw - 40px));padding:30px 32px 27px;border:1px solid rgba(255,255,255,.09);border-radius:24px;background:rgba(17,19,25,.9);box-shadow:0 30px 80px rgba(0,0,0,.4),0 0 55px rgba(245,158,11,.06);text-align:center;overflow:hidden}
        .lf-loading-card:before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 20%,rgba(255,255,255,.035) 50%,transparent 80%);pointer-events:none}
        .lf-logo{position:relative;width:54px;height:54px;margin:0 auto 18px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,rgba(245,158,11,.18),rgba(245,158,11,.04));border:1px solid rgba(245,158,11,.25);box-shadow:0 0 35px rgba(245,158,11,.12);animation:lf-logo 1.5s ease-in-out infinite}
        .lf-logo:before{content:"";position:absolute;inset:-8px;border-radius:22px;border:1px solid rgba(245,158,11,.13);animation:lf-glow 1.5s ease-in-out infinite}
        .lf-logo svg{position:relative;z-index:1}
        .lf-title{position:relative;font-size:14px;font-weight:600;letter-spacing:-.01em;color:hsl(var(--foreground));margin-bottom:7px}
        .lf-subtitle{position:relative;font-size:11px;color:hsl(var(--muted-foreground));display:flex;align-items:center;justify-content:center;gap:7px}
        .lf-dots{display:flex;gap:3px}.lf-dots i{width:3px;height:3px;border-radius:50%;background:#f59e0b;animation:lf-dot 1s ease-in-out infinite}.lf-dots i:nth-child(2){animation-delay:.13s}.lf-dots i:nth-child(3){animation-delay:.26s}
        .lf-progress{position:absolute;left:0;bottom:0;width:100%;height:2px;background:rgba(255,255,255,.05);overflow:hidden}.lf-progress:after{content:"";display:block;width:100%;height:100%;transform-origin:left;background:linear-gradient(90deg,transparent,#f59e0b,#fbbf24,transparent);animation:lf-progress 1.5s cubic-bezier(.4,0,.2,1) forwards}
        @media(prefers-reduced-motion:reduce){.lf-logo,.lf-logo:before,.lf-dots i,.lf-progress:after{animation:none}.lf-progress:after{transform:scaleX(1)}}
      `}</style>
      <div className="lf-loading-card">
        <div className="lf-logo"><Sparkles className="h-5 w-5 text-primary" /></div>
        <div className="lf-title">{getLoadingLabel(pathname)}</div>
        <div className="lf-subtitle"><span>Sincronizando dados</span><span className="lf-dots"><i /><i /><i /></span></div>
        <div className="lf-progress" aria-hidden="true" />
      </div>
    </div>
  );
}
