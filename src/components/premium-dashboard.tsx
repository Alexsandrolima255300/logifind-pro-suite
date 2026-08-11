import { Link } from "@tanstack/react-router";
import { ArrowUpRight, BarChart3, Clock3, DollarSign, MapPin, PackageCheck, Plus, Truck, Zap } from "lucide-react";

const kpis = [
  ["Cotações no mês", "2.847", "+12,4%", PackageCheck],
  ["Economia gerada", "R$ 184.320", "+8,2%", DollarSign],
  ["Embarques ativos", "137", "24 em trânsito", Truck],
  ["Tempo médio", "1m 42s", "por cotação", Clock3],
] as const;

const recent = [
  ["COT-8241", "São Paulo/SP", "Curitiba/PR", "Rodonaves", "R$ 1.284,00", "Aprovada"],
  ["COT-8240", "Campinas/SP", "Rio de Janeiro/RJ", "Braspress", "R$ 2.140,50", "Pendente"],
  ["COT-8239", "Belo Horizonte/MG", "Salvador/BA", "Jadlog", "R$ 3.890,00", "Aprovada"],
  ["COT-8238", "Porto Alegre/RS", "Florianópolis/SC", "Alfa", "R$ 720,00", "Recusada"],
];

function BrazilMapAnimation() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -right-12 -top-20 h-[430px] w-[620px] opacity-[0.22] blur-[0.2px] md:-right-4 md:-top-24 md:h-[500px] md:w-[700px]">
        <svg viewBox="0 0 700 500" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="lfBrazilStroke" x1="160" y1="80" x2="570" y2="430" gradientUnits="userSpaceOnUse">
              <stop stopColor="currentColor" stopOpacity="0.95" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.25" />
            </linearGradient>
            <radialGradient id="lfBrazilGlow" cx="0" cy="0" r="1" gradientTransform="translate(385 235) rotate(90) scale(205 240)">
              <stop stopColor="currentColor" stopOpacity="0.28" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0" />
            </radialGradient>
            <filter id="lfMapGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="7" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <clipPath id="lfBrazilClip">
              <path d="M153 76 188 59 220 67 243 54 275 62 303 48 337 60 367 49 400 65 432 62 455 78 489 82 514 101 543 108 562 132 585 143 594 169 617 187 608 213 621 232 609 252 617 278 598 293 594 321 574 334 563 361 536 371 522 397 496 402 478 427 451 432 431 452 398 447 375 462 349 448 324 456 300 441 271 446 255 425 227 419 215 397 191 390 187 365 166 352 171 326 151 308 158 280 145 258 159 233 151 210 164 188 151 166 164 145 150 122 164 102Z" />
            </clipPath>
          </defs>

          <path d="M153 76 188 59 220 67 243 54 275 62 303 48 337 60 367 49 400 65 432 62 455 78 489 82 514 101 543 108 562 132 585 143 594 169 617 187 608 213 621 232 609 252 617 278 598 293 594 321 574 334 563 361 536 371 522 397 496 402 478 427 451 432 431 452 398 447 375 462 349 448 324 456 300 441 271 446 255 425 227 419 215 397 191 390 187 365 166 352 171 326 151 308 158 280 145 258 159 233 151 210 164 188 151 166 164 145 150 122 164 102Z" fill="url(#lfBrazilGlow)" className="text-primary" />
          <path d="M153 76 188 59 220 67 243 54 275 62 303 48 337 60 367 49 400 65 432 62 455 78 489 82 514 101 543 108 562 132 585 143 594 169 617 187 608 213 621 232 609 252 617 278 598 293 594 321 574 334 563 361 536 371 522 397 496 402 478 427 451 432 431 452 398 447 375 462 349 448 324 456 300 441 271 446 255 425 227 419 215 397 191 390 187 365 166 352 171 326 151 308 158 280 145 258 159 233 151 210 164 188 151 166 164 145 150 122 164 102Z" stroke="url(#lfBrazilStroke)" strokeWidth="2.2" className="text-primary" filter="url(#lfMapGlow)" />

          <g clipPath="url(#lfBrazilClip)" className="text-primary">
            <g opacity="0.34" stroke="currentColor" strokeWidth="1">
              <path d="M185 80 220 430M240 65 275 445M300 55 325 450M365 55 350 450M430 68 395 445M490 88 445 430M545 118 500 400" />
              <path d="M160 150 580 145M150 205 610 205M150 265 615 265M160 325 590 325M185 385 555 385" />
            </g>
            <g stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 9" opacity="0.55">
              <path d="M215 345 C260 285 305 300 345 250 S425 185 490 155" />
              <path d="M180 215 C245 230 285 180 345 205 S430 280 535 300" />
              <path d="M255 410 C300 365 350 350 405 380 S480 405 520 365" />
            </g>
          </g>

          <g className="text-primary" filter="url(#lfMapGlow)">
            {[
              [214, 344, 0], [275, 292, 0.4], [345, 250, 0.8], [418, 201, 1.2], [490, 155, 1.6],
              [181, 215, 0.25], [286, 204, 0.7], [350, 207, 1.1], [432, 265, 1.5], [535, 300, 1.9],
              [255, 410, 0.5], [350, 352, 1], [445, 385, 1.5], [520, 365, 2],
            ].map(([cx, cy, delay], index) => (
              <circle key={index} cx={cx} cy={cy} r="3.2" fill="currentColor">
                <animate attributeName="r" values="2.2;5.5;2.2" dur="2.8s" begin={`${delay}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0.95;0.25" dur="2.8s" begin={`${delay}s`} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          <circle cx="345" cy="250" r="8" stroke="currentColor" strokeWidth="1" opacity="0.35" className="text-primary">
            <animate attributeName="r" values="8;32;8" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.45;0;0.45" dur="3.2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="absolute right-[18%] top-[24%] h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 to-transparent" />
    </div>
  );
}

export function PremiumDashboard() {
  return <div className="space-y-7">
    <section className="lf-hero relative min-h-[190px] overflow-hidden">
      <BrazilMapAnimation />
      <div className="relative z-10 flex min-h-[190px] flex-col justify-between gap-7">
        <div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">LogiFinder • Painel executivo</p><h1 className="mt-3 text-3xl font-black md:text-5xl">Seja bem-vindo de volta, <span className="text-primary">Alexsandro</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Tudo que você precisa para cotar, comparar e acompanhar seus fretes em um único lugar.</p></div>
        <div className="flex gap-2"><Link to="/cotacao" className="lf-primary"><Plus className="h-4 w-4" /> Nova cotação</Link><Link to="/relatorios" className="lf-secondary"> <BarChart3 className="h-4 w-4" /> Relatórios</Link></div>
      </div>
    </section>

    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map(([label, value, delta, Icon]) => <div key={label} className="lf-card group p-5 hover:-translate-y-0.5 hover:border-primary/25 transition-all"><div className="flex items-start justify-between"><div className="lf-icon"><Icon className="h-5 w-5" /></div><span className="rounded-full border border-primary/20 bg-primary/8 px-2 py-1 text-[10px] font-bold text-primary">{delta}</span></div><p className="mt-5 text-2xl font-black tracking-tight md:text-3xl">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></div>)}
    </section>

    <section className="grid gap-5 lg:grid-cols-[1.5fr_.8fr]">
      <div className="lf-card p-5 md:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Performance</p><h2 className="mt-1 text-xl font-black">Volume de cotações</h2></div><span className="lf-pill">Últimos 7 meses</span></div><div className="mt-7 flex h-56 items-end gap-3 md:gap-5">{[48,62,56,76,68,88,100].map((height, i) => <div key={i} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="rounded-t-xl bg-gradient-to-t from-primary/35 to-primary shadow-[0_0_20px_-8px_var(--color-primary)]" style={{ height: `${height}%` }} /><span className="text-center text-[10px] text-muted-foreground">{["Fev","Mar","Abr","Mai","Jun","Jul","Ago"][i]}</span></div>)}</div></div>
      <div className="lf-card p-5 md:p-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Ranking</p><h2 className="mt-1 text-xl font-black">Transportadoras</h2><div className="mt-6 space-y-5">{[["Rodonaves",34],["Braspress",26],["Jadlog",21],["Alfa",12],["Outras",7]].map(([name,value]) => <div key={name}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{name}</span><span className="text-muted-foreground">{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-primary shadow-[0_0_12px_-2px_var(--color-primary)]" style={{width:`${Number(value)*2.5}%`}} /></div></div>)}</div></div>
    </section>

    <section className="lf-card overflow-hidden"><div className="flex items-center justify-between border-b border-white/7 p-5 md:p-6"><div><p className="text-xs font-bold uppercase tracking-widest text-primary">Operação</p><h2 className="mt-1 text-xl font-black">Cotações recentes</h2></div><Link to="/historico" className="lf-secondary">Ver histórico <ArrowUpRight className="h-4 w-4" /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-widest text-muted-foreground"><th className="px-6 py-4">Código</th><th>Origem</th><th>Destino</th><th>Transportadora</th><th>Valor</th><th>Status</th></tr></thead><tbody>{recent.map((r) => <tr key={r[0]} className="border-b border-white/4 last:border-0 hover:bg-white/[.025]"><td className="px-6 py-4 font-mono text-xs text-primary">{r[0]}</td><td className="text-sm">{r[1]}</td><td className="text-sm">{r[2]}</td><td className="text-sm font-semibold">{r[3]}</td><td className="text-sm font-bold">{r[4]}</td><td><span className="lf-pill success">{r[5]}</span></td></tr>)}</tbody></table></div></section>

    <section className="grid gap-4 md:grid-cols-3"><Link to="/cotacao" className="lf-card group p-5 hover:border-primary/30"><Zap className="h-5 w-5 text-primary"/><h3 className="mt-4 font-bold">Cotar frete</h3><p className="mt-1 text-xs text-muted-foreground">Compare transportadoras e veja o melhor custo.</p></Link><Link to="/transportadoras" className="lf-card group p-5 hover:border-primary/30"><Truck className="h-5 w-5 text-primary"/><h3 className="mt-4 font-bold">Gerenciar transportadoras</h3><p className="mt-1 text-xs text-muted-foreground">Tabelas, cidades, prazos e regras de frete.</p></Link><Link to="/rastreamento" className="lf-card group p-5 hover:border-primary/30"><MapPin className="h-5 w-5 text-primary"/><h3 className="mt-4 font-bold">Rastreamento</h3><p className="mt-1 text-xs text-muted-foreground">Acompanhe pedidos e entregas em trânsito.</p></Link></section>
  </div>;
}
