import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

// Silhueta estilizada do Brasil, criada para o visual do LogiFinder.
const BRAZIL_PATH = "M178 70 C198 58 220 55 244 62 L266 48 292 54 318 43 345 50 370 44 398 53 425 50 451 63 474 65 492 78 513 84 526 101 548 108 558 126 576 137 580 157 595 174 589 191 601 210 593 226 600 246 588 260 591 279 579 291 576 310 560 319 555 337 539 342 529 359 511 360 497 377 478 375 466 391 446 388 431 402 412 396 397 410 376 402 360 414 341 405 324 412 307 401 289 404 278 389 259 386 250 370 232 365 227 347 211 337 214 319 198 307 202 288 188 276 193 258 180 244 187 226 176 210 183 192 174 176 183 160 174 144 185 128 176 113 188 98 179 84 Z";

const tabs = {
  dashboard: { label: "Painel executivo", subtitle: "Rede nacional em movimento" },
  cotacao: { label: "Cotação inteligente", subtitle: "Origem → destino" },
  cotacoes: { label: "Cotações", subtitle: "Fluxo de propostas" },
  transportadoras: { label: "Cobertura logística", subtitle: "Transportadoras e cidades" },
  clientes: { label: "Rede de clientes", subtitle: "Distribuição nacional" },
  cidades: { label: "Malha atendida", subtitle: "Cidades e regiões" },
  pedidos: { label: "Fluxo de cargas", subtitle: "Operação em movimento" },
  rastreamento: { label: "Rastreamento", subtitle: "Rotas em trânsito" },
  historico: { label: "Histórico logístico", subtitle: "Trajetos realizados" },
  relatorios: { label: "Inteligência executiva", subtitle: "Indicadores nacionais" },
  vendedor: { label: "Performance comercial", subtitle: "Oportunidades e rotas" },
  notificacoes: { label: "Central de alertas", subtitle: "Eventos logísticos" },
  usuarios: { label: "Operação da equipe", subtitle: "Atividade do sistema" },
  configuracoes: { label: "Centro de controle", subtitle: "Configuração logística" },
  documentacao: { label: "Conhecimento LogiFinder", subtitle: "Inteligência operacional" },
  perfil: { label: "Perfil operacional", subtitle: "Seu ambiente LogiFinder" },
} as const;

type Variant = keyof typeof tabs;

function variantFromPath(pathname: string): Variant {
  if (pathname === "/") return "dashboard";
  const key = pathname.replace(/^\//, "").split("/")[0] as Variant;
  return key in tabs ? key : "dashboard";
}

const POINTS = [[215,128],[245,111],[278,96],[314,87],[350,92],[390,84],[430,99],[468,116],[500,143],[530,173],[550,205],[562,241],[546,270],[530,304],[503,335],[470,350],[435,370],[398,383],[360,390],[324,375],[292,355],[263,330],[240,300],[220,267],[210,230],[200,195],[194,160],[285,190],[330,220],[375,190],[420,235],[465,265],[345,285],[400,315]];

function Grid() {
  return <g opacity=".18" stroke="currentColor" strokeWidth="1">
    <path d="M180 90 250 395 M230 65 295 410 M285 55 335 415 M345 50 350 420 M405 55 375 410 M465 70 420 395 M520 105 470 370" />
    <path d="M175 130 555 130 M170 180 575 180 M175 230 585 230 M185 280 580 280 M205 330 550 330 M235 375 505 375" />
  </g>;
}

function Dots() {
  return <g className="text-primary">{POINTS.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.5" fill="currentColor">
    <animate attributeName="r" values="2;5;2" dur="2.2s" begin={`${i * .11}s`} repeatCount="indefinite" />
    <animate attributeName="opacity" values=".25;1;.25" dur="2.2s" begin={`${i * .11}s`} repeatCount="indefinite" />
  </circle>)}</g>;
}

function MapBase({ children }: { children?: ReactNode }) {
  return <>
    <path d={BRAZIL_PATH} fill="currentColor" opacity=".035" />
    <path d={BRAZIL_PATH} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="7 5" opacity=".9" filter="url(#lfGlow)">
      <animate attributeName="stroke-dashoffset" from="0" to="-120" dur="5s" repeatCount="indefinite" />
    </path>
    <path d={BRAZIL_PATH} fill="none" stroke="currentColor" strokeWidth="7" opacity=".08" filter="url(#lfGlowStrong)">
      <animate attributeName="opacity" values=".03;.18;.03" dur="3.5s" repeatCount="indefinite" />
    </path>
    <Grid />
    {children}
  </>;
}

function ConnectedMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeWidth="1.8" opacity=".78">
    <path d="M345 250 Q285 190 215 128" /><path d="M345 250 Q390 160 430 99" /><path d="M345 250 Q470 205 530 173" />
    <path d="M345 250 Q465 290 503 335" /><path d="M345 250 Q300 330 263 330" /><path d="M345 250 Q275 270 220 230" />
  </g><Dots /><circle cx="345" cy="250" r="7" fill="currentColor"><animate attributeName="r" values="5;11;5" dur="1.7s" repeatCount="indefinite" /></circle></MapBase>;
}

function PulseMap() {
  return <MapBase><Dots /><g fill="none" stroke="currentColor">
    {[0, .8, 1.6].map((delay, i) => <circle key={i} cx="345" cy="250" r="25" opacity=".55"><animate attributeName="r" values="18;145;18" dur="3.6s" begin={`${delay}s`} repeatCount="indefinite" /><animate attributeName="opacity" values=".55;0;.55" dur="3.6s" begin={`${delay}s`} repeatCount="indefinite" /></circle>)}
    <circle cx="345" cy="250" r="8" fill="currentColor"><animate attributeName="r" values="6;10;6" dur="1.4s" repeatCount="indefinite" /></circle>
  </g></MapBase>;
}

function RoutesMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeLinecap="round">
    <path d="M215 330 C260 275 295 290 345 250 S425 175 500 145" strokeWidth="3" strokeDasharray="12 8"><animate attributeName="stroke-dashoffset" from="500" to="0" dur="3.4s" repeatCount="indefinite" /></path>
    <path d="M205 165 C260 205 300 180 345 215 S430 285 540 300" strokeWidth="2" strokeDasharray="8 10" opacity=".7"><animate attributeName="stroke-dashoffset" from="250" to="0" dur="2.8s" repeatCount="indefinite" /></path>
    <path d="M250 365 C310 330 350 350 405 370 S470 365 520 335" strokeWidth="2" strokeDasharray="5 9" opacity=".55"><animate attributeName="stroke-dashoffset" from="220" to="0" dur="2.5s" repeatCount="indefinite" /></path>
  </g><Dots /></MapBase>;
}

function CoverageMap() {
  return <MapBase><g fill="currentColor" className="text-primary" opacity=".75">{POINTS.slice(0, 27).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3.5"><animate attributeName="r" values="2;6;2" dur="2.5s" begin={`${i * .1}s`} repeatCount="indefinite" /></circle>)}</g><g fill="none" stroke="currentColor" strokeWidth="1" opacity=".5" strokeDasharray="2 7"><path d="M205 165 Q345 70 530 173" /><path d="M190 230 Q345 145 562 241" /><path d="M220 300 Q350 220 546 270" /><path d="M263 330 Q370 290 503 335" /></g></MapBase>;
}

function HubMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M345 250 Q285 165 215 128" /><path d="M345 250 Q380 150 430 99" /><path d="M345 250 Q455 210 530 173" /><path d="M345 250 Q445 315 503 335" /><path d="M345 250 Q300 330 263 330" /><path d="M345 250 Q250 250 205 165" /></g><circle cx="345" cy="250" r="9" fill="currentColor"><animate attributeName="r" values="6;13;6" dur="1.8s" repeatCount="indefinite" /></circle><Dots /></MapBase>;
}

function Map3D() {
  return <MapBase><path d={BRAZIL_PATH} fill="currentColor" opacity=".12" transform="translate(0 12)" /><path d={BRAZIL_PATH} fill="currentColor" opacity=".08" transform="translate(0 7)" /><g fill="currentColor" className="text-primary">{POINTS.slice(0, 24).map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3.5"><animate attributeName="cy" values={`${cy + 5};${cy - 5};${cy + 5}`} dur="2.3s" begin={`${i * .12}s`} repeatCount="indefinite" /></circle>)}</g></MapBase>;
}

function FlowMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeWidth="2.5" opacity=".8">
    <path d="M190 320 Q285 250 345 250 T535 145"><animate attributeName="stroke-dasharray" values="1 18;18 1;1 18" dur="3s" repeatCount="indefinite" /></path>
    <path d="M200 145 Q285 200 345 250 T530 335"><animate attributeName="stroke-dasharray" values="1 18;18 1;1 18" dur="3.2s" repeatCount="indefinite" /></path>
  </g><g fill="currentColor"><circle cx="190" cy="320" r="7"/><circle cx="535" cy="145" r="7"/><circle cx="200" cy="145" r="7"/><circle cx="530" cy="335" r="7"/></g><Dots /></MapBase>;
}

export function LogisticsTabVisual({ variant }: { variant?: Variant }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeVariant = variant ?? variantFromPath(pathname);
  const meta = tabs[activeVariant];
  const Map = activeVariant === "cotacao" ? PulseMap : activeVariant === "cotacoes" || activeVariant === "historico" || activeVariant === "rastreamento" ? RoutesMap : activeVariant === "transportadoras" || activeVariant === "cidades" ? CoverageMap : activeVariant === "clientes" || activeVariant === "vendedor" ? HubMap : activeVariant === "relatorios" ? Map3D : activeVariant === "pedidos" ? FlowMap : ConnectedMap;

  return <section className="relative mb-6 min-h-[260px] overflow-hidden rounded-2xl border border-primary/20 bg-black/45 shadow-[0_0_55px_-22px_var(--color-primary)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(255,125,0,.17),transparent_38%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.98)_0%,rgba(0,0,0,.82)_32%,rgba(0,0,0,.18)_68%,rgba(0,0,0,.65)_100%)]" />
    <div className="relative z-10 flex min-h-[260px] items-center justify-between gap-6 px-5 py-7 md:px-8">
      <div className="max-w-[430px]">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">LogiFinder • {meta.label}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{meta.subtitle}</h2>
        <p className="mt-2 max-w-[380px] text-xs leading-5 text-muted-foreground">Mapa nacional em formato do Brasil, com rotas, cidades, pulsos e tráfego luminoso em movimento.</p>
      </div>
      <div className="absolute inset-y-0 right-0 w-[70%] text-primary md:w-[62%]" aria-hidden="true">
        <svg viewBox="155 35 455 400" className="h-full w-full overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="lfGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="lfGlowStrong" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="10" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <Map />
          <path d={BRAZIL_PATH} fill="none" stroke="currentColor" strokeWidth="1" opacity=".25" strokeDasharray="2 12"><animate attributeName="stroke-dashoffset" from="0" to="-180" dur="4s" repeatCount="indefinite" /></path>
          <circle cx="345" cy="250" r="155" fill="none" stroke="currentColor" strokeWidth="1" opacity=".12"><animate attributeName="r" values="130;170;130" dur="5s" repeatCount="indefinite" /></circle>
        </svg>
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 h-24 w-full bg-gradient-to-t from-black/65 to-transparent" />
    </div>
  </section>;
}
