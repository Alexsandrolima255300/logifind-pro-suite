import { useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  Upload,
  FileSpreadsheet,
  FileText,
  Trash2,
  Lock,
  Plus,
  Play,
  Mail,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditRow, Cte, NotaFiscal } from "@/lib/audit/types";
import { STATUS_META } from "@/lib/audit/types";
import { compareDocs } from "@/lib/audit/compare";
import { parseFiles } from "@/lib/audit/xml";
import { exportCsv, exportPdf } from "@/lib/audit/export";

const brl = (v?: number) =>
  v === undefined ? "—" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const input =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/50 transition";

export function AuditPanel() {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [ctes, setCtes] = useState<Cte[]>([]);
  const [avisos, setAvisos] = useState<string[]>([]);
  const [periodo, setPeriodo] = useState({ de: "", ate: "" });
  const [tolerancia, setTolerancia] = useState("0,01");
  const [executado, setExecutado] = useState(false);
  const [filtro, setFiltro] = useState<"todos" | AuditRow["status"]>("todos");
  const fileRef = useRef<HTMLInputElement>(null);

  const tol = Number(tolerancia.replace(",", ".")) || 0;
  const { rows, summary } = useMemo(
    () => compareDocs(notas, ctes, { toleranciaValor: tol }),
    [notas, ctes, tol],
  );
  const visible = filtro === "todos" ? rows : rows.filter((r) => r.status === filtro);
  const periodoLabel = periodo.de || periodo.ate ? `${periodo.de || "…"} a ${periodo.ate || "…"}` : "";

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    const parsed = await parseFiles(Array.from(list));
    setNotas((p) => [...p, ...parsed.notas]);
    setCtes((p) => [...p, ...parsed.ctes]);
    setAvisos((p) => [...p, ...parsed.ignorados]);
    setExecutado(true);
  }

  function addManual(kind: "nf" | "cte") {
    if (kind === "nf")
      setNotas((p) => [
        ...p,
        { numeroNF: "", valorFrete: 0, transportadora: "", cliente: "", dataEmissao: "", origem: "manual" },
      ]);
    else
      setCtes((p) => [
        ...p,
        { numeroCte: "", numeroNF: "", valorFrete: 0, transportadora: "", origem: "manual" },
      ]);
    setExecutado(true);
  }

  return (
    <div className="space-y-6">
      {/* Selo read-only */}
      <div className="glass rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Lock className="h-4 w-4" />
        </div>
        <div className="text-sm">
          <div className="font-semibold text-emerald-400">Modo somente leitura ativo</div>
          <p className="text-muted-foreground text-xs mt-1 max-w-3xl">
            O agente apenas consulta, lê e compara. Nunca salva, altera, aprova, cancela ou exclui
            documentos no Sankhya nem responde e-mails. Qualquer situação duvidosa é registrada no
            relatório, sem nenhuma ação sobre o documento de origem.
          </p>
        </div>
      </div>

      {/* Fontes de dados */}
      <div className="grid gap-4 md:grid-cols-3">
        <SourceCard
          icon={<Database className="h-4 w-4" />}
          title="Sankhya (consulta)"
          state="Aguardando credenciais"
          detail="Integração REST somente leitura. Assim que as credenciais forem cadastradas, as notas do período são importadas automaticamente."
        />
        <SourceCard
          icon={<Mail className="h-4 w-4" />}
          title="E-mail dos CT-es"
          state="Aguardando conexão"
          detail="Leitura dos anexos XML/PDF enviados pelas transportadoras via conector Gmail."
        />
        <SourceCard
          icon={<Upload className="h-4 w-4" />}
          title="Importação manual"
          state="Disponível agora"
          active
          detail="Envie XMLs de NF-e e CT-e — o agente identifica o tipo do documento sozinho."
        />
      </div>

      {/* Controles */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <Field label="Período de">
            <input type="date" className={input} value={periodo.de} onChange={(e) => setPeriodo({ ...periodo, de: e.target.value })} />
          </Field>
          <Field label="Período até">
            <input type="date" className={input} value={periodo.ate} onChange={(e) => setPeriodo({ ...periodo, ate: e.target.value })} />
          </Field>
          <Field label="Tolerância de valor (R$)">
            <input className={input} value={tolerancia} onChange={(e) => setTolerancia(e.target.value)} />
          </Field>
          <Field label="Documentos carregados">
            <div className="flex items-center h-[38px] gap-2 text-sm">
              <span className="rounded-lg bg-white/[0.05] px-2 py-1">{notas.length} NF</span>
              <span className="rounded-lg bg-white/[0.05] px-2 py-1">{ctes.length} CT-e</span>
            </div>
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".xml,.pdf"
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-br from-primary to-emerald-600 px-4 py-2.5 text-sm font-semibold text-black hover:brightness-110 transition"
          >
            <Upload className="h-4 w-4" /> Importar XMLs (NF-e / CT-e)
          </button>
          <button onClick={() => addManual("nf")} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/[0.04] transition">
            <Plus className="h-4 w-4" /> Nota manual
          </button>
          <button onClick={() => addManual("cte")} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/[0.04] transition">
            <Plus className="h-4 w-4" /> CT-e manual
          </button>
          <button
            onClick={() => setExecutado(true)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-sm hover:bg-white/[0.04] transition"
          >
            <Play className="h-4 w-4" /> Rodar auditoria
          </button>
          {(notas.length > 0 || ctes.length > 0) && (
            <button
              onClick={() => { setNotas([]); setCtes([]); setAvisos([]); setExecutado(false); }}
              className="ml-auto flex items-center gap-2 rounded-xl border border-rose-500/20 px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition"
            >
              <Trash2 className="h-4 w-4" /> Limpar
            </button>
          )}
        </div>

        {avisos.length > 0 && (
          <ul className="text-xs text-amber-400/90 space-y-1">
            {avisos.map((a, i) => (
              <li key={i}>• {a}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Lançamento manual */}
      {(notas.some((n) => n.origem === "manual") || ctes.some((c) => c.origem === "manual")) && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ManualList
            title="Notas fiscais (manual)"
            items={notas.map((n, i) => ({ i, n })).filter((x) => x.n.origem === "manual")}
            fields={[
              { key: "numeroNF", label: "Nº NF" },
              { key: "cliente", label: "Cliente" },
              { key: "transportadora", label: "Transportadora" },
              { key: "valorFrete", label: "Frete", numeric: true },
            ]}
            onChange={(idx, key, value) =>
              setNotas((p) => p.map((n, i) => (i === idx ? { ...n, [key]: value } : n)))
            }
            onRemove={(idx) => setNotas((p) => p.filter((_, i) => i !== idx))}
          />
          <ManualList
            title="CT-es (manual)"
            items={ctes.map((c, i) => ({ i, n: c }))
              .filter((x) => x.n.origem === "manual")}
            fields={[
              { key: "numeroCte", label: "Nº CT-e" },
              { key: "numeroNF", label: "Nº NF" },
              { key: "transportadora", label: "Transportadora" },
              { key: "valorFrete", label: "Frete", numeric: true },
            ]}
            onChange={(idx, key, value) =>
              setCtes((p) => p.map((c, i) => (i === idx ? { ...c, [key]: value } : c)))
            }
            onRemove={(idx) => setCtes((p) => p.filter((_, i) => i !== idx))}
          />
        </div>
      )}

      {/* Resultado */}
      {executado && rows.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Kpi label="Notas analisadas" value={String(summary.totalNotas)} />
            <Kpi label="CT-es encontrados" value={String(summary.totalCtes)} />
            <Kpi label="Conferidos" value={String(summary.conferidos)} tone="ok" />
            <Kpi label="Divergências" value={String(summary.divergencias)} tone={summary.divergencias ? "bad" : "ok"} />
            <Kpi label="Diferença total" value={brl(summary.diferencaTotal)} tone={summary.diferencaTotal !== 0 ? "bad" : "ok"} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterChip active={filtro === "todos"} onClick={() => setFiltro("todos")} label={`Todos (${rows.length})`} />
            {(Object.keys(STATUS_META) as AuditRow["status"][]).map((s) => {
              const n = rows.filter((r) => r.status === s).length;
              if (!n) return null;
              return (
                <FilterChip key={s} active={filtro === s} onClick={() => setFiltro(s)} label={`${STATUS_META[s].dot} ${STATUS_META[s].label} (${n})`} />
              );
            })}
            <div className="ml-auto flex gap-2">
              <button onClick={() => exportCsv(rows, summary)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/[0.04] transition">
                <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Excel (CSV)
              </button>
              <button onClick={() => exportPdf(rows, summary, periodoLabel)} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/[0.04] transition">
                <FileText className="h-4 w-4 text-sky-400" /> PDF
              </button>
            </div>
          </div>

          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                  {["Status", "NF", "CT-e", "Cliente", "Transp. NF", "Transp. CT-e", "Valor NF", "Valor CT-e", "Diferença"].map((h) => (
                    <th key={h} className="text-left font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((r, i) => (
                  <tr key={i} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] animate-in fade-in">
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px] font-medium whitespace-nowrap", STATUS_META[r.status].className)}>
                        {STATUS_META[r.status].dot} {STATUS_META[r.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{r.numeroNF || "—"}</td>
                    <td className="px-4 py-3 font-mono">{r.numeroCte ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[180px] truncate">{r.cliente ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate">{r.transportadoraNF ?? "—"}</td>
                    <td className="px-4 py-3 max-w-[150px] truncate">{r.transportadoraCte ?? "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{brl(r.valorNF)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{brl(r.valorCte)}</td>
                    <td className={cn("px-4 py-3 font-semibold whitespace-nowrap", (r.diferenca ?? 0) !== 0 && "text-rose-400")}>
                      {r.diferenca !== undefined ? brl(r.diferenca) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {executado && rows.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Nenhum documento carregado ainda. Importe XMLs ou lance manualmente para iniciar a conferência.
        </div>
      )}

      {!executado && (
        <div className="glass rounded-2xl p-10 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary mb-3" />
          <div className="font-semibold">Pronto para auditar</div>
          <p className="text-sm text-muted-foreground mt-1">
            Importe os XMLs das notas e dos CT-es recebidos por e-mail — o agente compara NF, transportadora e valor do frete automaticamente.
          </p>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-2xl font-bold tracking-tight", tone === "ok" && "text-emerald-400", tone === "bad" && "text-rose-400")}>
        {value}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-xs font-medium transition",
        active ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:bg-white/[0.04]",
      )}
    >
      {label}
    </button>
  );
}

type ManualField = { key: string; label: string; numeric?: boolean };

function ManualList<T extends Record<string, unknown>>({
  title,
  items,
  fields,
  onChange,
  onRemove,
}: {
  title: string;
  items: { i: number; n: T }[];
  fields: ManualField[];
  onChange: (index: number, key: string, value: string | number) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="text-sm font-semibold">{title}</div>
      {items.map(({ i, n }) => (
        <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
          {fields.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</span>
              <input
                className={input}
                value={String(n[f.key] ?? "")}
                onChange={(e) => onChange(i, f.key, f.numeric ? Number(e.target.value.replace(",", ".")) || 0 : e.target.value)}
              />
            </label>
          ))}
          <button onClick={() => onRemove(i)} className="h-[38px] rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition flex items-center justify-center">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function SourceCard({
  icon,
  title,
  state,
  detail,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  state: string;
  detail: string;
  active?: boolean;
}) {
  return (
    <div className={cn("glass rounded-2xl p-5", active && "border border-primary/25")}>
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-xl", active ? "bg-primary/15 text-primary" : "bg-white/[0.05] text-muted-foreground")}>
          {icon}
        </span>
        {title}
      </div>
      <div className={cn("mt-3 text-[11px] uppercase tracking-wider", active ? "text-primary" : "text-amber-400/80")}>{state}</div>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
