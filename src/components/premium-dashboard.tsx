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

export function PremiumDashboard() {
  return <div className="space-y-7">
    <section className="lf-hero min-h-[190px]">
      <div><p className="text-xs font-black uppercase tracking-[.2em] text-primary">LogiFinder • Painel executivo</p><h1 className="mt-3 text-3xl font-black md:text-5xl">Seja bem-vindo de volta, <span className="text-primary">Alexsandro</span></h1><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Tudo que você precisa para cotar, comparar e acompanhar seus fretes em um único lugar.</p></div>
      <div className="flex gap-2"><Link to="/cotacao" className="lf-primary"><Plus className="h-4 w-4" /> Nova cotação</Link><Link to="/relatorios" className="lf-secondary"><BarChart3 className="h-4 w-4" /> Relatórios</Link></div>
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
