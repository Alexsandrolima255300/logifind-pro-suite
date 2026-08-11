import { useRouterState } from "@tanstack/react-router";

const BRAZIL_PATH = "M153 76 188 59 220 67 243 54 275 62 303 48 337 60 367 49 400 65 432 62 455 78 489 82 514 101 543 108 562 132 585 143 594 169 617 187 608 213 621 232 609 252 617 278 598 293 594 321 574 334 563 361 536 371 522 397 496 402 478 427 451 432 431 452 398 447 375 462 349 448 324 456 300 441 271 446 255 425 227 419 215 397 191 390 187 365 166 352 171 326 151 308 158 280 145 258 159 233 151 210 164 188 151 166 164 145 150 122 164 102Z";

const tabs = {
  dashboard: { label: "Rede nacional", subtitle: "Rotas conectadas" },
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

function Grid() {
  return <g opacity="0.24" stroke="currentColor" strokeWidth="1"><path d="M185 80 220 430M240 65 275 445M300 55 325 450M365 55 350 450M430 68 395 445M490 88 445 430M545 118 500 400" /><path d="M160 150 580 145M150 205 610 205M150 265 615 265M160 325 590 325M185 385 555 385" /></g>;
}

function Dots() {
  const points = [[214,344],[275,292],[345,250],[418,201],[490,155],[181,215],[286,204],[350,207],[432,265],[535,300],[255,410],[350,352],[445,385],[520,365]];
  return <g className="text-primary">{points.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor"><animate attributeName="r" values="2;5;2" dur="2.7s" begin={`${i * 0.18}s`} repeatCount="indefinite" /><animate attributeName="opacity" values=".2;1;.2" dur="2.7s" begin={`${i * 0.18}s`} repeatCount="indefinite" /></circle>)}</g>;
}

function MapBase({ children }: { children?: React.ReactNode }) {
  return <>
    <path d={BRAZIL_PATH} fill="currentColor" opacity="0.055" />
    <path d={BRAZIL_PATH} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.72" filter="url(#lfVisualGlow)" />
    <Grid />
    {children}
  </>;
}

function ConnectedMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeWidth="1.8" opacity="0.75"><path d="M345 250 Q275 205 181 215" /><path d="M345 250 Q418 201 490 155" /><path d="M345 250 Q432 265 535 300" /><path d="M345 250 Q275 292 214 344" /><path d="M345 250 Q350 352 255 410" /><path d="M345 250 Q445 385 520 365" /></g><Dots /></MapBase>;
}

function PulseMap() {
  return <MapBase><Dots /><g fill="none" stroke="currentColor" className="text-primary"><circle cx="350" cy="250" r="20" opacity=".55"><animate attributeName="r" values="15;105;15" dur="3.2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".5;0;.5" dur="3.2s" repeatCount="indefinite" /></circle><circle cx="350" cy="250" r="40" opacity=".3"><animate attributeName="r" values="30;145;30" dur="3.2s" begin=".8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".4;0;.4" dur="3.2s" begin=".8s" repeatCount="indefinite" /></circle><circle cx="350" cy="250" r="9" fill="currentColor" /></g></MapBase>;
}

function RoutesMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeLinecap="round"><path d="M214 344 C260 285 305 300 345 250 S425 185 490 155" strokeWidth="3" opacity=".9"><animate attributeName="stroke-dashoffset" from="420" to="0" dur="3.2s" repeatCount="indefinite" /></path><path d="M181 215 C245 230 285 180 345 205 S430 280 535 300" strokeWidth="2" strokeDasharray="7 10" opacity=".6"><animate attributeName="stroke-dashoffset" from="170" to="0" dur="2.8s" repeatCount="indefinite" /></path><path d="M255 410 C300 365 350 350 405 380 S480 405 520 365" strokeWidth="2" strokeDasharray="4 8" opacity=".55"><animate attributeName="stroke-dashoffset" from="140" to="0" dur="2.4s" repeatCount="indefinite" /></path></g><Dots /></MapBase>;
}

function CoverageMap() {
  return <MapBase><g fill="currentColor" className="text-primary" opacity=".7">{[[190,130],[245,115],[305,100],[370,110],[440,120],[510,150],[550,205],[535,275],[500,335],[440,365],[370,400],[300,385],[235,350],[195,285],[170,220]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="4"><animate attributeName="r" values="2;6;2" dur="2.5s" begin={`${i * .12}s`} repeatCount="indefinite" /></circle>)}</g><path d="M190 130 Q345 30 510 150 M170 220 Q345 130 550 205 M195 285 Q350 220 535 275 M235 350 Q350 310 500 335" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 8" opacity=".45" /></MapBase>;
}

function HubMap() {
  return <MapBase><g fill="none" stroke="currentColor"><path d="M345 250 Q270 165 205 120" /><path d="M345 250 Q390 150 470 105" /><path d="M345 250 Q470 235 560 180" /><path d="M345 250 Q445 335 520 375" /><path d="M345 250 Q270 345 215 370" /><circle cx="345" cy="250" r="7" fill="currentColor"><animate attributeName="r" values="5;11;5" dur="1.8s" repeatCount="indefinite" /></circle></g><Dots /></MapBase>;
}

function Map3D() {
  return <MapBase><path d={`${BRAZIL_PATH} M153 86 188 69 220 77 243 64 275 72 303 58 337 70 367 59 400 75 432 72 455 88 489 92 514 111 543 118 562 142 585 153 594 179 617 197 608 223 621 242 609 262 617 288 598 303 594 331 574 344 563 371 536 381 522 407 496 412 478 437 451 442 431 462 398 457 375 472 349 458 324 466 300 451 271 456 255 435 227 429 215 407 191 400 187 375 166 362 171 336 151 318 158 290 145 268 159 243 151 220 164 198 151 176 164 155 150 132 164 112Z`} fill="currentColor" opacity=".12" /><g fill="currentColor" className="text-primary">{[[210,150],[285,125],[360,95],[445,135],[520,175],[255,220],[345,200],[430,245],[500,285],[285,315],[375,350],[460,345]].map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="4"><animate attributeName="cy" values={`${cy + 5};${cy - 5};${cy + 5}`} dur="2.4s" begin={`${i*.15}s`} repeatCount="indefinite"/></circle>)}</g></MapBase>;
}

function FlowMap() {
  return <MapBase><g fill="none" stroke="currentColor" strokeWidth="2.5" opacity=".75"><path d="M170 340 Q285 260 345 250 T545 130" /><path d="M190 145 Q285 195 345 250 T540 340" /></g><g className="text-primary" fill="currentColor"><circle cx="170" cy="340" r="8"/><circle cx="545" cy="130" r="8"/><circle cx="190" cy="145" r="8"/><circle cx="540" cy="340" r="8"/></g><Dots /></MapBase>;
}

export function LogisticsTabVisual({ variant }: { variant?: Variant }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeVariant = variant ?? variantFromPath(pathname);
  const meta = tabs[activeVariant];
  const Map = activeVariant === "cotacao" ? PulseMap : activeVariant === "cotacoes" || activeVariant === "historico" || activeVariant === "rastreamento" ? RoutesMap : activeVariant === "transportadoras" || activeVariant === "cidades" ? CoverageMap : activeVariant === "clientes" || activeVariant === "vendedor" ? HubMap : activeVariant === "relatorios" ? Map3D : activeVariant === "pedidos" ? FlowMap : ConnectedMap;

  return <section className="relative mb-6 min-h-[205px] overflow-hidden rounded-2xl border border-primary/20 bg-black/35 shadow-[0_0_45px_-25px_var(--color-primary)]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(255,125,0,.13),transparent_38%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.95)_0%,rgba(0,0,0,.72)_34%,rgba(0,0,0,.16)_70%,rgba(0,0,0,.55)_100%)]" />
    <div className="relative z-10 flex min-h-[205px] items-center justify-between gap-6 px-5 py-6 md:px-8">
      <div className="max-w-[420px]">
        <p className="text-[10px] font-black uppercase tracking-[.22em] text-primary">LogiFinder • {meta.label}</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">{meta.subtitle}</h2>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">Visualização logística em tempo real com a identidade premium do LogiFinder.</p>
      </div>
      <div className="absolute inset-y-0 right-0 w-[68%] text-primary md:w-[58%]" aria-hidden="true">
        <svg viewBox="100 25 550 460" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs><filter id="lfVisualGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="6" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
          <Map />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 h-20 w-full bg-gradient-to-t from-black/60 to-transparent" />
    </div>
  </section>;
}
