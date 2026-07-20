import {
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  DollarSign,
  Clock,
  ArrowUpRight,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { cn } from "@/lib/utils";

const kpis = [
  { label: "Cotações no mês", value: "2.847", delta: "+12,4%", up: true, icon: Package, hint: "vs. mês anterior" },
  { label: "Economia gerada", value: "R$ 184.320", delta: "+8,2%", up: true, icon: DollarSign, hint: "em fretes negociados" },
  { label: "Embarques ativos", value: "137", delta: "-3,1%", up: false, icon: Truck, hint: "24 em trânsito" },
  { label: "Tempo médio", value: "1m 42s", delta: "-18%", up: true, icon: Clock, hint: "por cotação" },
];

const chartData = [
  { m: "Jan", cotacoes: 1820, economia: 92 },
  { m: "Fev", cotacoes: 2100, economia: 110 },
  { m: "Mar", cotacoes: 1980, economia: 105 },
  { m: "Abr", cotacoes: 2450, economia: 138 },
  { m: "Mai", cotacoes: 2320, economia: 128 },
  { m: "Jun", cotacoes: 2680, economia: 162 },
  { m: "Jul", cotacoes: 2847, economia: 184 },
];

const carriers = [
  { name: "Rodonaves", win: 34, color: "oklch(0.74 0.18 152)" },
  { name: "Braspress", win: 26, color: "oklch(0.66 0.16 165)" },
  { name: "Jadlog", win: 21, color: "oklch(0.58 0.14 180)" },
  { name: "Alfa Transp.", win: 12, color: "oklch(0.5 0.1 200)" },
  { name: "Outros", win: 7, color: "oklch(0.42 0.06 220)" },
];

const recent = [
  { id: "COT-8241", origem: "São Paulo, SP", destino: "Curitiba, PR", peso: "420kg", carrier: "Rodonaves", valor: "R$ 1.284,00", status: "aprovada" },
  { id: "COT-8240", origem: "Campinas, SP", destino: "Rio de Janeiro, RJ", peso: "890kg", carrier: "Braspress", valor: "R$ 2.140,50", status: "pendente" },
  { id: "COT-8239", origem: "Belo Horizonte, MG", destino: "Salvador, BA", peso: "1.240kg", carrier: "Jadlog", valor: "R$ 3.890,00", status: "aprovada" },
  { id: "COT-8238", origem: "Porto Alegre, RS", destino: "Florianópolis, SC", peso: "310kg", carrier: "Alfa Transp.", valor: "R$ 720,00", status: "recusada" },
  { id: "COT-8237", origem: "Recife, PE", destino: "Fortaleza, CE", peso: "560kg", carrier: "Rodonaves", valor: "R$ 1.560,00", status: "aprovada" },
];

const statusStyles: Record<string, string> = {
  aprovada: "bg-primary/10 text-primary border-primary/20",
  pendente: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  recusada: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function Dashboard() {
  return (
    <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Hero header */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-primary/80 mb-2">
              Painel Executivo · Julho 2026
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              Bem-vindo de volta, <span className="text-gradient-green">Marcos</span>
            </h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
              Você economizou R$ 184.320 em fretes este mês. Confira as cotações em andamento e a performance por transportadora.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="glass rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-white/[0.08] transition">
              Exportar
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_12px_32px_-12px_oklch(0.74_0.18_152/0.7)] hover:brightness-110 transition">
              Ver relatório completo
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="glass group relative overflow-hidden rounded-2xl p-5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${i * 80}ms`, animationDuration: "700ms" }}
            >
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    k.up
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20",
                  )}
                >
                  {k.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {k.delta}
                </div>
              </div>
              <div className="mt-5">
                <div className="text-2xl md:text-3xl font-bold tracking-tight">{k.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{k.label}</div>
                <div className="mt-2 text-[11px] text-muted-foreground/70">{k.hint}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Big chart */}
        <div className="glass lg:col-span-2 rounded-2xl p-5 md:p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Volume de Cotações</h3>
              <p className="text-xs text-muted-foreground mt-1">Últimos 7 meses · comparativo com economia</p>
            </div>
            <div className="flex gap-1 rounded-xl bg-white/[0.04] border border-white/[0.08] p-1 text-xs">
              {["7D", "1M", "6M", "1A"].map((p, i) => (
                <button
                  key={p}
                  className={cn(
                    "px-3 py-1 rounded-lg transition font-medium",
                    i === 2 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.6 0.14 180)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.6 0.14 180)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.2 0.01 240 / 0.95)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    borderRadius: "12px",
                    backdropFilter: "blur(12px)",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "oklch(0.97 0.005 240)" }}
                />
                <Area type="monotone" dataKey="cotacoes" stroke="oklch(0.74 0.18 152)" strokeWidth={2.5} fill="url(#g1)" />
                <Area type="monotone" dataKey="economia" stroke="oklch(0.6 0.14 180)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Carriers */}
        <div className="glass rounded-2xl p-5 md:p-6">
          <div className="mb-5">
            <h3 className="text-base font-semibold">Transportadoras</h3>
            <p className="text-xs text-muted-foreground mt-1">Participação em cotações ganhas</p>
          </div>
          <div className="space-y-4">
            {carriers.map((c, i) => (
              <div key={c.name} className="animate-in fade-in slide-in-from-right-4" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.win}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${c.win * 2.5}%`,
                      background: `linear-gradient(90deg, ${c.color}, ${c.color} 60%, transparent)`,
                      boxShadow: `0 0 12px ${c.color}`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-white/[0.05] h-[100px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-5)}>
                <Bar dataKey="economia" fill="oklch(0.74 0.18 152)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent quotes table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 md:p-6 border-b border-white/[0.05]">
          <div>
            <h3 className="text-base font-semibold">Cotações Recentes</h3>
            <p className="text-xs text-muted-foreground mt-1">Últimas 5 solicitações · atualizado agora</p>
          </div>
          <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
            Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-6 py-3">Código</th>
                <th className="text-left font-medium px-6 py-3">Rota</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Peso</th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Transportadora</th>
                <th className="text-left font-medium px-6 py-3">Valor</th>
                <th className="text-left font-medium px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr
                  key={r.id}
                  className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition animate-in fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <td className="px-6 py-4 text-sm font-mono text-primary">{r.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.origem}</div>
                        <div className="truncate text-xs text-muted-foreground">→ {r.destino}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{r.peso}</td>
                  <td className="px-6 py-4 text-sm hidden md:table-cell">{r.carrier}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{r.valor}</td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                        statusStyles[r.status],
                      )}
                    >
                      {r.status === "aprovada" && <CheckCircle2 className="h-3 w-3" />}
                      {r.status === "pendente" && <Clock className="h-3 w-3" />}
                      {r.status === "recusada" && <AlertCircle className="h-3 w-3" />}
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
