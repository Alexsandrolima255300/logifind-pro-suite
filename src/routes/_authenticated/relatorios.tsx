import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios — LogiFinder" },
      { name: "description", content: "Relatórios executivos, gráficos por transportadora, estado e mês." },
      { property: "og:title", content: "Relatórios — LogiFinder" },
      { property: "og:description", content: "Analytics e exportação em PDF e Excel." },
    ],
  }),
  component: Relatorios,
});

const monthData = [
  { m: "Jan", pedidos: 182, entregues: 168, atrasados: 14 },
  { m: "Fev", pedidos: 210, entregues: 198, atrasados: 12 },
  { m: "Mar", pedidos: 198, entregues: 187, atrasados: 11 },
  { m: "Abr", pedidos: 245, entregues: 231, atrasados: 14 },
  { m: "Mai", pedidos: 232, entregues: 219, atrasados: 13 },
  { m: "Jun", pedidos: 268, entregues: 254, atrasados: 14 },
  { m: "Jul", pedidos: 284, entregues: 272, atrasados: 12 },
];
const stateData = [
  { uf: "SP", v: 32 }, { uf: "MG", v: 21 }, { uf: "RJ", v: 18 }, { uf: "PR", v: 12 }, { uf: "RS", v: 9 }, { uf: "SC", v: 8 },
];
const pieData = [
  { name: "Rodonaves", value: 34, color: "oklch(0.74 0.18 152)" },
  { name: "Braspress", value: 26, color: "oklch(0.66 0.16 165)" },
  { name: "Jadlog", value: 21, color: "oklch(0.58 0.14 180)" },
  { name: "Alfa", value: 12, color: "oklch(0.5 0.1 200)" },
  { name: "Outros", value: 7, color: "oklch(0.42 0.06 220)" },
];

function Relatorios() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-[1440px] p-4 md:p-8 space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Relatórios"
          description="Indicadores executivos com exportação em PDF e Excel."
          actions={
            <button className="glass rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-1.5 hover:bg-white/[0.06]">
              <Download className="h-3.5 w-3.5" /> Exportar PDF
            </button>
          }
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="glass rounded-2xl p-5 lg:col-span-2">
            <div className="text-sm font-semibold mb-4">Pedidos por mês</div>
            <div className="h-[280px]">
              <ResponsiveContainer>
                <AreaChart data={monthData}>
                  <defs>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="m" stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.01 240 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Area type="monotone" dataKey="pedidos" stroke="oklch(0.74 0.18 152)" strokeWidth={2.5} fill="url(#gp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-semibold mb-4">Participação por transportadora</div>
            <div className="h-[280px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.01 240 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 lg:col-span-3">
            <div className="text-sm font-semibold mb-4">Pedidos por estado</div>
            <div className="h-[240px]">
              <ResponsiveContainer>
                <BarChart data={stateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                  <XAxis dataKey="uf" stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "oklch(0.2 0.01 240 / 0.95)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                  <Bar dataKey="v" fill="oklch(0.74 0.18 152)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
