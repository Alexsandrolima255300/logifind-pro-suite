import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, FileSpreadsheet, FileText, LockKeyhole, Mail, RefreshCw, Search, ShieldCheck, Upload, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { compareInvoicesAndCtes } from "@/lib/auditoria/compare";
import { parseCteXmlFile } from "@/lib/auditoria/cte-xml";
import type { CteDocument, SankhyaInvoice } from "@/lib/auditoria/types";

export const Route = createFileRoute("/auditoria")({ component: AuditoriaPage });

const demoInvoices: SankhyaInvoice[] = [];

const statusLabel: Record<string, string> = {
  CONFERIDO: "Conferido",
  VALOR_DIVERGENTE: "Valor divergente",
  TRANSPORTADORA_DIVERGENTE: "Transportadora divergente",
  CTE_NAO_ENCONTRADO: "CT-e não encontrado",
  NF_NAO_ENCONTRADA: "Nota não encontrada",
};

const statusClass: Record<string, string> = {
  CONFERIDO: "text-emerald-300 bg-emerald-400/10 border-emerald-300/20",
  VALOR_DIVERGENTE: "text-amber-300 bg-amber-400/10 border-amber-300/20",
  TRANSPORTADORA_DIVERGENTE: "text-orange-300 bg-orange-400/10 border-orange-300/20",
  CTE_NAO_ENCONTRADO: "text-red-300 bg-red-400/10 border-red-300/20",
  NF_NAO_ENCONTRADA: "text-sky-300 bg-sky-400/10 border-sky-300/20",
};

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-2xl ${className}`}>{children}</section>;
}

export default function AuditoriaPage() {
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [invoices, setInvoices] = useState<SankhyaInvoice[]>(demoInvoices);
  const [ctes, setCtes] = useState<CteDocument[]>([]);
  const [message, setMessage] = useState("Nenhuma consulta executada.");
  const [busy, setBusy] = useState(false);

  const audit = useMemo(() => compareInvoicesAndCtes(invoices, ctes), [invoices, ctes]);

  async function handleCteFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    try {
      const parsed: CteDocument[] = [];
      for (const file of Array.from(files)) {
        if (file.name.toLowerCase().endsWith(".xml")) parsed.push(await parseCteXmlFile(file));
        else if (file.name.toLowerCase().endsWith(".pdf")) {
          setMessage(`PDF recebido: ${file.name}. A extração de PDF deve ocorrer no servidor autorizado; nenhum PDF é enviado ao Sankhya.`);
        }
      }
      setCtes((current) => [...current, ...parsed]);
      if (parsed.length) setMessage(`${parsed.length} CT-e(s) XML lido(s) localmente. Sem alterações no Sankhya.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha ao ler o anexo.");
    } finally {
      setBusy(false);
    }
  }

  function exportExcel() {
    const rows = audit.results.map((r) => ({
      NF: r.numeroNF,
      CTe: r.numeroCTe ?? "",
      Status: statusLabel[r.status],
      "Frete NF": r.nfFrete ?? "",
      "Frete CTe": r.cteFrete ?? "",
      "Transportadora NF": r.nfTransportadora ?? "",
      "Transportadora CTe": r.cteTransportadora ?? "",
      Observação: r.mensagem,
    }));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Auditoria");
    XLSX.writeFile(workbook, `auditoria-logifind-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <main className="min-h-screen bg-[#080808] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-2.5 text-sm backdrop-blur-xl transition hover:border-orange-400/40 hover:bg-orange-400/10"><ArrowLeft className="h-4 w-4" /> Início</Link>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-300"><ShieldCheck className="h-4 w-4" /> Auditoria LogiFinder</div>
              <h1 className="mt-1 text-2xl font-bold md:text-4xl">Conferência NF × CT-e</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-2.5 text-sm text-emerald-200 backdrop-blur-xl"><LockKeyhole className="h-4 w-4" /> MODO SOMENTE LEITURA</div>
        </div>

        <Glass className="p-5 md:p-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-2 text-sm"><span className="text-white/60">Início do período</span><input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-orange-400/60" /></label>
            <label className="space-y-2 text-sm"><span className="text-white/60">Fim do período</span><input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-orange-400/60" /></label>
            <button disabled={busy || !periodStart || !periodEnd} className="self-end rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"><Search className="mr-2 inline h-4 w-4" /> Consultar Sankhya</button>
          </div>
          <div className="mt-4 rounded-2xl border border-orange-300/10 bg-orange-300/[0.04] p-4 text-sm text-white/70"><strong className="text-orange-200">Proteção:</strong> o módulo de consulta não possui ações de gravação, edição, exclusão, aprovação, cancelamento ou emissão. A integração de produção deve usar um usuário/perfil do Sankhya sem permissão de escrita.</div>
        </Glass>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Glass className="p-5">
            <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">CT-es recebidos</h2><p className="mt-1 text-xs text-white/50">XML é interpretado localmente. PDF fica pendente de extração segura no servidor.</p></div><Mail className="h-5 w-5 text-orange-300" /></div>
            <label className="mt-5 flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-orange-300/30 bg-orange-300/[0.04] px-5 py-8 text-sm transition hover:bg-orange-300/[0.08]"><Upload className="h-5 w-5 text-orange-300" /> Selecionar XML/PDF<input type="file" multiple accept=".xml,.pdf" className="hidden" onChange={(e) => handleCteFiles(e.target.files)} /></label>
            <div className="mt-4 space-y-2">{ctes.length === 0 ? <p className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-sm text-white/45">Nenhum CT-e carregado.</p> : ctes.map((cte) => <div key={`${cte.numeroCTe}-${cte.origemArquivo}`} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm"><b>CT-e {cte.numeroCTe}</b> · NF {cte.numeroNF} · {cte.transportadora}</div>)}</div>
          </Glass>

          <Glass className="p-5">
            <div className="flex items-start justify-between"><div><h2 className="font-semibold">Fonte Sankhya</h2><p className="mt-1 text-xs text-white/50">Somente leitura. A consulta real será conectada ao endpoint autorizado do seu ambiente.</p></div><RefreshCw className="h-5 w-5 text-orange-300" /></div>
            <div className="mt-5 rounded-2xl border border-white/8 bg-black/20 p-4 text-sm text-white/65">{invoices.length ? `${invoices.length} nota(s) carregada(s) para conferência.` : "Nenhuma nota retornada ainda. Configure a integração server-side do Sankhya em modo read-only."}</div>
            <div className="mt-4 grid grid-cols-2 gap-3"><Metric label="Notas" value={audit.summary.notasAnalisadas} /><Metric label="CT-es" value={audit.summary.ctesEncontrados} /></div>
          </Glass>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5"><Metric label="Conferidos" value={audit.summary.conferidos} tone="green" /><Metric label="Valor divergente" value={audit.summary.divergenciasValor} tone="amber" /><Metric label="Transportadora" value={audit.summary.divergenciasTransportadora} tone="orange" /><Metric label="CT-e ausente" value={audit.summary.ctesNaoEncontrados} tone="red" /><Metric label="NF ausente" value={audit.summary.notasNaoEncontradas} tone="blue" /></div>

        <Glass className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 p-5"><div><h2 className="font-semibold">Resultado da auditoria</h2><p className="mt-1 text-xs text-white/50">Comparação determinística por NF, transportadora e valor de frete.</p></div><div className="flex gap-2"><button onClick={exportExcel} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs hover:border-orange-400/30"><FileSpreadsheet className="mr-1 inline h-4 w-4" /> Excel</button><button onClick={() => window.print()} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs hover:border-orange-400/30"><FileText className="mr-1 inline h-4 w-4" /> PDF</button></div></div>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/[0.025] text-xs text-white/45"><tr><th className="px-5 py-3">NF</th><th className="px-5 py-3">CT-e</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Frete NF</th><th className="px-5 py-3">Frete CT-e</th><th className="px-5 py-3">Transportadora</th><th className="px-5 py-3">Observação</th></tr></thead><tbody>{audit.results.map((row, index) => <tr key={`${row.numeroNF}-${row.numeroCTe}-${index}`} className="border-t border-white/5"><td className="px-5 py-4 font-mono">{row.numeroNF}</td><td className="px-5 py-4 font-mono">{row.numeroCTe ?? "—"}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${statusClass[row.status]}`}>{statusLabel[row.status]}</span></td><td className="px-5 py-4">{formatMoney(row.nfFrete)}</td><td className="px-5 py-4">{formatMoney(row.cteFrete)}</td><td className="px-5 py-4">{row.cteTransportadora ?? row.nfTransportadora ?? "—"}</td><td className="px-5 py-4 text-white/55">{row.mensagem}</td></tr>)}{audit.results.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-white/35"><FileText className="mx-auto mb-2 h-8 w-8" />Nenhum resultado para exibir.</td></tr>}</tbody></table></div>
        </Glass>

        <div className="flex items-center gap-2 text-xs text-white/40"><AlertTriangle className="h-4 w-4 text-orange-300" /> {message}</div>
      </div>
    </main>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: string }) {
  const toneClass: Record<string, string> = { green: "text-emerald-300", amber: "text-amber-300", orange: "text-orange-300", red: "text-red-300", blue: "text-sky-300", default: "text-white" };
  return <div className="rounded-2xl border border-white/8 bg-white/[0.035] p-4 backdrop-blur-xl"><div className={`text-2xl font-bold ${toneClass[tone]}`}>{value}</div><div className="mt-1 text-xs text-white/45">{label}</div></div>;
}

function formatMoney(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
