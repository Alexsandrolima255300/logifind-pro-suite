import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { PageHeader } from "@/components/page-header";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { CalendarDays, FileBarChart2, Printer, TrendingUp, Truck, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/relatorios")({
  head: () => ({ meta: [{ title: "Diretoria — LogiFinder" }, { name: "description", content: "Painel executivo para cotações e faturamento." }] }),
  component: Diretoria,
});

type QuoteRow = { id: string; date: string; client: string; destination: string; carrier: string; freight: number; invoice: number; status: "Aprovada" | "Cotada" | "Reprovada" };
const quotes: QuoteRow[] = [
  { id: "COT-0811-001", date: "2026-08-11", client: "Brasil Engrenagens", destination: "Uberaba/MG", carrier: "Danúbio", freight: 100, invoice: 4200, status: "Aprovada" },
  { id: "COT-0811-002", date: "2026-08-11", client: "Indústria Alpha", destination: "Campinas/SP", carrier: "Rodonaves", freight: 186.5, invoice: 8200, status: "Cotada" },
  { id: "COT-0811-003", date: "2026-08-11", client: "Metalúrgica Minas", destination: "Belo Horizonte/MG", carrier: "Braspress", freight: 244.9, invoice: 12800, status: "Aprovada" },
  { id: "COT-0810-001", date: "2026-08-10", client: "Auto Peças Brasil", destination: "São Paulo/SP", carrier: "Rodonaves", freight: 312.7, invoice: 15400, status: "Aprovada" },
  { id: "COT-0809-001", date: "2026-08-09", client: "Distribuidora Central", destination: "Ribeirão Preto/SP", carrier: "Alfa", freight: 198.4, invoice: 9600, status: "Cotada" },
  { id: "COT-0808-001", date: "2026-08-08", client: "Comercial Triângulo", destination: "Uberlândia/MG", carrier: "Danúbio", freight: 140, invoice: 6800, status: "Aprovada" },
  { id: "COT-0807-001", date: "2026-08-07", client: "Fábrica Horizonte", destination: "Curitiba/PR", carrier: "Braspress", freight: 426.8, invoice: 22100, status: "Aprovada" },
  { id: "COT-0806-001", date: "2026-08-06", client: "Peças Nacional", destination: "Rio de Janeiro/RJ", carrier: "Rodonaves", freight: 351.2, invoice: 17500, status: "Reprovada" },
  { id: "COT-0805-001", date: "2026-08-05", client: "Grupo Industrial Sul", destination: "Joinville/SC", carrier: "Alfa", freight: 398.6, invoice: 19600, status: "Aprovada" },
  { id: "COT-0804-001", date: "2026-08-04", client: "Logística Mineira", destination: "Contagem/MG", carrier: "Danúbio", freight: 112, invoice: 5200, status: "Aprovada" },
];
const money = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const today = "2026-08-11";

function Diretoria() {
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const filtered = useMemo(() => quotes.filter((q) => q.date >= startDate && q.date <= endDate), [startDate, endDate]);
  const approved = filtered.filter((q) => q.status === "Aprovada");
  const freightTotal = filtered.reduce((sum, q) => sum + q.freight, 0);
  const invoiceTotal = filtered.reduce((sum, q) => sum + q.invoice, 0);
  const approvedFreight = approved.reduce((sum, q) => sum + q.freight, 0);
  const approvalRate = filtered.length ? Math.round((approved.length / filtered.length) * 100) : 0;

  const byCarrier = useMemo(() => {
    const map = new Map<string, { carrier: string; quotes: number; freight: number }>();
    filtered.forEach((q) => { const current = map.get(q.carrier) ?? { carrier: q.carrier, quotes: 0, freight: 0 }; current.quotes += 1; current.freight += q.freight; map.set(q.carrier, current); });
    return Array.from(map.values()).sort((a, b) => b.quotes - a.quotes);
  }, [filtered]);
  const byDay = useMemo(() => {
    const map = new Map<string, { day: string; faturamento: number }>();
    filtered.forEach((q) => { const current = map.get(q.date) ?? { day: q.date.slice(8), faturamento: 0 }; current.faturamento += q.invoice; map.set(q.date, current); });
    return Array.from(map.values());
  }, [filtered]);
  const printReport = () => window.print();

  return (
    <AppLayout>
      <div className="mx-auto max-w-[1480px] space-y-6 p-2 md:p-4 print:p-0">
        <div className="print:hidden"><PageHeader eyebrow="Gestão Executiva" title="Diretoria" description="Visão gerencial de cotações, faturamento e desempenho no período selecionado." actions={<button onClick={printReport} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-110"><Printer className="h-4 w-4" /> Imprimir relatório</button>} /></div>
        <section className="glass rounded-2xl p-4 md:p-5 print:hidden">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-1 flex items-center gap-2 text-sm font-bold"><CalendarDays className="h-4 w-4 text-primary" /> Período do relatório</div><p className="text-xs text-muted-foreground">Escolha o intervalo que será exibido e enviado para impressão.</p></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[520px]"><label className="text-xs font-semibold text-muted-foreground">Data inicial<input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /></label><label className="text-xs font-semibold text-muted-foreground">Data final<input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary" /></label></div></div>
        </section>
        <div className="hidden print:block border-b border-black/20 pb-4"><div className="text-2xl font-black">LogiFinder — Relatório Executivo</div><div className="mt-1 text-sm">Diretoria • Cotações e faturamento • {startDate.split("-").reverse().join("/")} a {endDate.split("-").reverse().join("/")}</div></div>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={FileBarChart2} label="Cotações no período" value={String(filtered.length)} hint={`${approvalRate}% aprovadas`} /><Metric icon={Wallet} label="Faturamento (NF-e)" value={money(invoiceTotal)} hint="Valor das mercadorias cotadas" /><Metric icon={Truck} label="Frete cotado" value={money(freightTotal)} hint={`${approved.length} aprovada(s)`} /><Metric icon={TrendingUp} label="Frete aprovado" value={money(approvedFreight)} hint="Total das cotações aprovadas" /></section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-3"><div className="glass rounded-2xl p-5 xl:col-span-2"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-bold">Faturamento por dia</h3><p className="text-xs text-muted-foreground">Valor das NF-e incluídas nas cotações</p></div><Wallet className="h-4 w-4 text-primary" /></div><div className="h-[260px]"><ResponsiveContainer><AreaChart data={byDay}><defs><linearGradient id="diretoriaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0.42} /><stop offset="100%" stopColor="oklch(0.74 0.18 152)" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} /><XAxis dataKey="day" stroke="oklch(0.66 0.02 240)" fontSize={11} tickLine={false} axisLine={false} /><YAxis stroke="oklch(0.66 0.02 240)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} /><Tooltip formatter={(v: number) => money(v)} contentStyle={{ background: "oklch(0.2 0.01 240 / 0.96)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} /><Area type="monotone" dataKey="faturamento" stroke="oklch(0.74 0.18 152)" strokeWidth={2.5} fill="url(#diretoriaFill)" /></AreaChart></ResponsiveContainer></div></div><div className="glass rounded-2xl p-5"><h3 className="text-sm font-bold">Cotações por transportadora</h3><p className="mb-4 text-xs text-muted-foreground">Volume de cotações</p><div className="h-[260px]"><ResponsiveContainer><BarChart data={byCarrier} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="carrier" type="category" width={76} fontSize={10} stroke="oklch(0.66 0.02 240)" tickLine={false} axisLine={false} /><Tooltip formatter={(v: number) => v} contentStyle={{ background: "oklch(0.2 0.01 240 / 0.96)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} /><Bar dataKey="quotes" fill="oklch(0.74 0.18 152)" radius={[0, 8, 8, 0]} /></BarChart></ResponsiveContainer></div></div></section>

        <section className="glass overflow-hidden rounded-2xl"><div className="flex items-center justify-between border-b border-white/[0.06] p-5"><div><h3 className="text-sm font-bold">Relatório de cotações</h3><p className="text-xs text-muted-foreground">Detalhamento pronto para impressão.</p></div></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-muted-foreground"><tr><th className="px-5 py-3">Cotação</th><th className="px-5 py-3">Data</th><th className="px-5 py-3">Cliente</th><th className="px-5 py-3">Destino</th><th className="px-5 py-3">Transportadora</th><th className="px-5 py-3 text-right">NF-e</th><th className="px-5 py-3 text-right">Frete</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-white/[0.05]">{filtered.map((q) => <tr key={q.id} className="hover:bg-white/[0.02]"><td className="px-5 py-3 font-semibold">{q.id}</td><td className="px-5 py-3 text-muted-foreground">{q.date.split("-").reverse().join("/")}</td><td className="px-5 py-3">{q.client}</td><td className="px-5 py-3">{q.destination}</td><td className="px-5 py-3">{q.carrier}</td><td className="px-5 py-3 text-right">{money(q.invoice)}</td><td className="px-5 py-3 text-right font-semibold">{money(q.freight)}</td><td className="px-5 py-3"><span className={q.status === "Aprovada" ? "text-emerald-400" : q.status === "Reprovada" ? "text-red-400" : "text-amber-400"}>{q.status}</span></td></tr>)}{filtered.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-muted-foreground">Nenhuma cotação encontrada no período selecionado.</td></tr>}</tbody><tfoot className="border-t border-white/10 bg-white/[0.02] font-bold"><tr><td colSpan={5} className="px-5 py-3">Totais</td><td className="px-5 py-3 text-right">{money(invoiceTotal)}</td><td className="px-5 py-3 text-right">{money(freightTotal)}</td><td className="px-5 py-3">{filtered.length} registros</td></tr></tfoot></table></div></section>
        <div className="text-center text-[10px] text-muted-foreground">Documento gerado pelo LogiFinder • Relatório executivo</div>
      </div>
      <style>{`@media print { body { background:white !important; color:#111 !important; } .lf-sidebar,.lf-topbar { display:none !important; } .lf-shell, main { padding:0 !important; margin:0 !important; } .glass { background:white !important; color:#111 !important; border:1px solid #ddd !important; box-shadow:none !important; } .text-muted-foreground { color:#666 !important; } table { font-size:10px !important; } }`}</style>
    </AppLayout>
  );
}

function Metric({ icon: Icon, label, value, hint }: { icon: typeof Wallet; label: string; value: string; hint: string }) {
  return <div className="glass rounded-2xl p-5"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></div><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-xl font-black tracking-tight">{value}</div><div className="mt-1 text-[10px] text-muted-foreground">{hint}</div></div>;
}
