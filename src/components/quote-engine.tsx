import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Scale, Box, Layers, DollarSign, Zap, Sparkles,
  Ruler, CheckCircle2, AlertTriangle, WifiOff, Loader2,
  FileText, Printer, Share2, Download, Trophy, ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyBlock } from "@/components/cnpj-lookup";
import type { CnpjCompany } from "@/lib/cnpj";
import {
  quoteAll, validateFreightRequest,
  type CarrierQuoteResult, type FreightRequest,
} from "@/lib/carriers";

const tiposCarga = ["Carga Seca", "Refrigerada", "Frágil", "Perigosa", "Eletrônicos", "Alimentos", "Química"];
const CNPJ_REMETENTE_PADRAO = "39860057000104";

const BRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const formatCep = (s: string) => {
  const d = onlyDigits(s);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : s;
};

type SortKey = "price" | "eta" | "alpha";

export function QuoteEngine() {
  const [cepOrigem, setCepOrigem] = useState("");
  const [cepDestino, setCepDestino] = useState("");
  const [cnpjRemetente, setCnpjRemetente] = useState("");
  const [cnpjDestinatario, setCnpjDestinatario] = useState("");
  const [remetente, setRemetente] = useState<CnpjCompany | null>(null);
  const [destinatario, setDestinatario] = useState<CnpjCompany | null>(null);

  const [pesoReal, setPesoReal] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [volumes, setVolumes] = useState("");
  const [valorNF, setValorNF] = useState("");
  const [tipoCarga, setTipoCarga] = useState("Carga Seca");

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarrierQuoteResult[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortKey>("price");
  const [quoteMeta, setQuoteMeta] = useState<{ id: string; at: string } | null>(null);

  const handleRemetente = useCallback((c: CnpjCompany) => {
    setRemetente(c);
    if (c.cep) setCepOrigem(onlyDigits(c.cep));
    if (c.cnpj) setCnpjRemetente(onlyDigits(c.cnpj));
  }, []);

  const handleDestinatario = useCallback((c: CnpjCompany) => {
    setDestinatario(c);
    if (c.cep) setCepDestino(onlyDigits(c.cep));
    if (c.cnpj) setCnpjDestinatario(onlyDigits(c.cnpj));
  }, []);

  const cubagem = useMemo(() => {
    const a = (parseFloat(altura) || 0) / 100;
    const l = (parseFloat(largura) || 0) / 100;
    const c = (parseFloat(comprimento) || 0) / 100;
    const q = Math.max(1, parseInt(volumes) || 1);
    return Math.max(0, a * l * c * q);
  }, [altura, largura, comprimento, volumes]);

  async function handleCotar() {
    const req: FreightRequest = {
      cepOrigem, cepDestino,
      cnpjRemetente, cnpjDestinatario,
      pesoKg: parseFloat(pesoReal) || 0,
      alturaCm: parseFloat(altura) || 0,
      larguraCm: parseFloat(largura) || 0,
      comprimentoCm: parseFloat(comprimento) || 0,
      valorNF: parseFloat(valorNF) || 0,
      volumes: parseInt(volumes) || 0,
    };
    const errs = validateFreightRequest(req);
    setErrors(errs);
    if (errs.length) { setResults(null); return; }

    setLoading(true);
    setResults(null);
    try {
      const res = await quoteAll(req);
      setResults(res);
      // Auto-select all successful carriers by default
      const preset: Record<string, boolean> = {};
      res.forEach((r) => { if (r.status === "success") preset[r.carrierId] = true; });
      setChecked(preset);
      setQuoteMeta({
        id: `COT-${Date.now().toString(36).toUpperCase()}`,
        at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }

  const toggle = useCallback((id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-8 space-y-6">
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/90">
          <Sparkles className="h-3 w-3" /> Motor Inteligente de Cotação
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Encontre o <span className="text-gradient-green">melhor frete</span> em segundos
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Integração direta com transportadoras — cotações reais, sem valores simulados.
        </p>
      </div>

      <div className="glass-strong rounded-3xl p-5 md:p-8 shadow-[0_40px_100px_-40px_oklch(0_0_0/0.8)]">
        <Divider>Empresas</Divider>
        <div className="grid grid-cols-1 gap-4">
          <CompanyBlock role="remetente" defaultCnpj={CNPJ_REMETENTE_PADRAO} onCompanyChange={handleRemetente} />
          <CompanyBlock role="destinatario" onCompanyChange={handleDestinatario} />
        </div>

        <Divider>Dados da Carga</Divider>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Field icon={Scale} label="Peso Bruto" value={pesoReal} onChange={setPesoReal} suffix="kg" type="number" />
          <Field icon={Layers} label="Volumes" value={volumes} onChange={setVolumes} suffix="un" type="number" />
          <Field icon={DollarSign} label="Valor NF-e" value={valorNF} onChange={setValorNF} prefix="R$" type="number" />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
              <Box className="h-3 w-3" /> Cubagem
            </div>
            <div className="text-lg font-bold text-primary">{cubagem.toFixed(3)} m³</div>
            <div className="text-[10px] text-muted-foreground">calculado automaticamente</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3">
          <Field icon={Ruler} label="Altura" value={altura} onChange={setAltura} suffix="cm" type="number" />
          <Field icon={Ruler} label="Largura" value={largura} onChange={setLargura} suffix="cm" type="number" />
          <Field icon={Ruler} label="Comprimento" value={comprimento} onChange={setComprimento} suffix="cm" type="number" />
        </div>

        <div className="mt-4">
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Tipo de Carga</label>
          <div className="flex flex-wrap gap-2">
            {tiposCarga.map((t) => (
              <button
                key={t} onClick={() => setTipoCarga(t)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all",
                  tipoCarga === t
                    ? "border-primary/40 bg-primary/15 text-primary shadow-[0_0_20px_-6px_oklch(0.74_0.18_152/0.6)]"
                    : "border-white/[0.08] bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/20",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-300">
            <div className="font-semibold mb-1 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Preencha os campos obrigatórios</div>
            <ul className="list-disc pl-5 space-y-0.5">
              {errors.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        )}

        <button
          onClick={handleCotar}
          disabled={loading}
          className="group mt-6 relative w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-600 py-4 md:py-5 text-base md:text-lg font-bold tracking-tight text-black shadow-[0_20px_60px_-20px_oklch(0.74_0.18_152/0.8)] hover:brightness-110 transition overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" strokeWidth={2.5} />}
          {loading ? "CONSULTANDO TRANSPORTADORAS..." : "CALCULAR FRETE"}
        </button>
      </div>

      {results && (
        <ResultsTable
          results={results}
          selected={selectedCarrier}
          onSelect={setSelectedCarrier}
          checked={checked}
          onToggle={toggle}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onGenerate={() => openReport({
            results, checked, sortBy,
            remetente, destinatario,
            cepOrigem, cepDestino,
            pesoKg: parseFloat(pesoReal) || 0,
            cubagem, volumes: parseInt(volumes) || 0,
            valorNF: parseFloat(valorNF) || 0,
            tipoCarga,
            quoteMeta: quoteMeta ?? { id: `COT-${Date.now().toString(36).toUpperCase()}`, at: new Date().toISOString() },
          })}
        />
      )}
    </div>
  );
}

function ResultsTable({
  results, selected, onSelect, checked, onToggle, sortBy, onSortChange, onGenerate,
}: {
  results: CarrierQuoteResult[];
  selected: string | null;
  onSelect: (id: string) => void;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  onGenerate: () => void;
}) {
  const successCount = results.filter((r) => r.status === "success").length;
  const selectedCount = results.filter((r) => checked[r.carrierId]).length;

  const successes = results.filter((r) => r.status === "success");
  const minPrice = successes.reduce((m, r) => Math.min(m, r.valor ?? Infinity), Infinity);
  const minEta = successes.reduce((m, r) => Math.min(m, r.prazoDias ?? Infinity), Infinity);

  const sorted = useMemo(() => {
    const copy = [...results];
    if (sortBy === "alpha") {
      copy.sort((a, b) => a.carrierNome.localeCompare(b.carrierNome, "pt-BR"));
    } else if (sortBy === "eta") {
      copy.sort((a, b) => {
        const av = a.status === "success" ? (a.prazoDias ?? Infinity) : Infinity;
        const bv = b.status === "success" ? (b.prazoDias ?? Infinity) : Infinity;
        return av - bv;
      });
    } else {
      copy.sort((a, b) => {
        const av = a.status === "success" ? (a.valor ?? Infinity) : Infinity;
        const bv = b.status === "success" ? (b.valor ?? Infinity) : Infinity;
        return av - bv;
      });
    }
    return copy;
  }, [results, sortBy]);

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="glass rounded-2xl p-4 md:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cotações recebidas</div>
          <div className="text-xl font-bold">
            <span className="text-gradient-green">{successCount}</span>
            <span className="text-muted-foreground text-sm font-medium"> / {results.length} transportadoras</span>
            <span className="ml-3 text-sm text-muted-foreground font-medium">
              · <span className="text-foreground font-semibold">{selectedCount}</span> selecionada{selectedCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground mx-1.5" />
            {(["price", "eta", "alpha"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => onSortChange(k)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-lg transition",
                  sortBy === k ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {k === "price" ? "Preço" : k === "eta" ? "Prazo" : "A-Z"}
              </button>
            ))}
          </div>
          <button
            onClick={onGenerate}
            disabled={selectedCount === 0}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition",
              selectedCount === 0
                ? "bg-white/[0.03] border border-white/[0.06] text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-br from-primary to-emerald-600 text-black hover:brightness-110 shadow-[0_10px_30px_-10px_oklch(0.74_0.18_152/0.7)]",
            )}
            title={selectedCount === 0 ? "Selecione pelo menos uma transportadora para gerar o relatório." : ""}
          >
            <FileText className="h-4 w-4" /> Gerar Relatório
          </button>
        </div>
      </div>

      {selectedCount === 0 && (
        <div className="glass rounded-xl px-4 py-2.5 text-xs text-yellow-300 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5" />
          Selecione pelo menos uma transportadora para gerar o relatório.
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[40px_1.4fr_1fr_1fr_1.2fr_1fr_1.5fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/[0.06]">
          <div></div>
          <div>Transportadora</div>
          <div>Valor</div>
          <div>Prazo</div>
          <div>Consultado em</div>
          <div>Status</div>
          <div className="text-right">Ação</div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {sorted.map((r, i) => (
            <ResultRow
              key={r.carrierId}
              r={r}
              index={i}
              selected={selected === r.carrierId}
              checked={!!checked[r.carrierId]}
              onToggle={() => onToggle(r.carrierId)}
              isBestPrice={r.status === "success" && r.valor === minPrice}
              isBestEta={r.status === "success" && r.prazoDias === minEta}
              onSelect={() => r.status === "success" && onSelect(r.carrierId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  r, index, selected, onSelect, checked, onToggle, isBestPrice, isBestEta,
}: {
  r: CarrierQuoteResult; index: number; selected: boolean; onSelect: () => void;
  checked: boolean; onToggle: () => void;
  isBestPrice: boolean; isBestEta: boolean;
}) {
  const dateLabel = new Date(r.consultadoEm).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
  const isBest = isBestPrice && isBestEta;
  const disabled = r.status !== "success";
  return (
    <div
      className={cn(
        "grid grid-cols-[40px_1fr_1fr] md:grid-cols-[40px_1.4fr_1fr_1fr_1.2fr_1fr_1.5fr] gap-3 px-5 py-4 items-center transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
        selected ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : checked ? "bg-primary/[0.04]" : "hover:bg-white/[0.02]",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <label className={cn("flex items-center justify-center", disabled && "opacity-30 cursor-not-allowed")}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={disabled}
          className="h-4 w-4 accent-primary cursor-pointer"
        />
      </label>
      <div className="col-span-2 md:col-span-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-sm font-bold truncate">{r.carrierNome}</div>
          {isBest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-emerald-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
              <Trophy className="h-2.5 w-2.5" /> Melhor Opção
            </span>
          )}
          {!isBest && isBestPrice && (
            <span className="rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">Menor Preço</span>
          )}
          {!isBest && isBestEta && (
            <span className="rounded-full bg-blue-500/15 text-blue-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">Menor Prazo</span>
          )}
        </div>
        {r.mensagem && r.status !== "success" && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.mensagem}</div>
        )}
      </div>
      <div className={cn("text-sm font-bold", isBestPrice ? "text-gradient-green" : "text-foreground")}>
        {r.status === "success" && r.valor !== undefined ? BRL(r.valor) : <span className="text-muted-foreground font-normal">—</span>}
      </div>
      <div className="text-sm">
        {r.status === "success" && r.prazoDias !== undefined
          ? <span className={cn("font-semibold", isBestEta && "text-blue-300")}>{r.prazoDias} {r.prazoDias === 1 ? "dia" : "dias"}</span>
          : <span className="text-muted-foreground">—</span>}
      </div>
      <div className="hidden md:block text-[11px] text-muted-foreground">{dateLabel}</div>
      <div className="hidden md:block"><StatusBadge status={r.status} /></div>
      <div className="col-span-3 md:col-span-1 md:text-right">
        <button
          disabled={disabled}
          onClick={onSelect}
          className={cn(
            "rounded-xl border px-4 py-2 text-xs font-semibold transition",
            disabled
              ? "bg-white/[0.02] border-white/[0.06] text-muted-foreground cursor-not-allowed"
              : selected
                ? "bg-primary text-black border-primary hover:brightness-110"
                : "bg-primary/15 border-primary/30 text-primary hover:bg-primary/20",
          )}
        >
          {selected ? "Selecionada" : r.status === "success" ? "Selecionar" : "Indisponível"}
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CarrierQuoteResult["status"] }) {
  if (status === "success") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
        <CheckCircle2 className="h-3.5 w-3.5" /> Sucesso
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-400">
        <AlertTriangle className="h-3.5 w-3.5" /> Erro
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400">
      <WifiOff className="h-3.5 w-3.5" /> Indisponível
    </span>
  );
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <div className="h-px flex-1 bg-white/[0.06]" />
      <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{children}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, prefix, suffix, type = "text",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1">
        <Icon className="h-3 w-3" strokeWidth={2} />
        <span className="truncate">{label}</span>
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">{prefix}</span>}
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold focus:outline-none focus:border-primary/50 transition",
            prefix ? "pl-9" : "pl-3", suffix ? "pr-10" : "pr-3",
          )} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Report generation — opens a new window with printable / shareable HTML
// -----------------------------------------------------------------------------

type ReportPayload = {
  results: CarrierQuoteResult[];
  checked: Record<string, boolean>;
  sortBy: SortKey;
  remetente: CnpjCompany | null;
  destinatario: CnpjCompany | null;
  cepOrigem: string;
  cepDestino: string;
  pesoKg: number;
  cubagem: number;
  volumes: number;
  valorNF: number;
  tipoCarga: string;
  quoteMeta: { id: string; at: string };
};

function openReport(p: ReportPayload) {
  const html = buildReportHtml(p);
  const w = window.open("", "_blank", "noopener,noreferrer,width=1024,height=800");
  if (!w) {
    alert("Não foi possível abrir o relatório. Habilite pop-ups para este site.");
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function buildReportHtml(p: ReportPayload): string {
  const selected = p.results.filter((r) => p.checked[r.carrierId]);
  const sorted = [...selected];
  if (p.sortBy === "alpha") sorted.sort((a, b) => a.carrierNome.localeCompare(b.carrierNome, "pt-BR"));
  else if (p.sortBy === "eta") sorted.sort((a, b) => (a.prazoDias ?? Infinity) - (b.prazoDias ?? Infinity));
  else sorted.sort((a, b) => (a.valor ?? Infinity) - (b.valor ?? Infinity));

  const successes = selected.filter((r) => r.status === "success");
  const minPrice = successes.reduce((m, r) => Math.min(m, r.valor ?? Infinity), Infinity);
  const minEta = successes.reduce((m, r) => Math.min(m, r.prazoDias ?? Infinity), Infinity);

  const dt = new Date(p.quoteMeta.at).toLocaleString("pt-BR");
  const empresa = p.remetente?.razaoSocial || "BRASIL ENGRENAGENS E CORRENTES";
  const dest = p.destinatario;

  const esc = (s: string | number | undefined | null) =>
    String(s ?? "—").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

  const rows = sorted.map((r) => {
    const isBestPrice = r.status === "success" && r.valor === minPrice;
    const isBestEta = r.status === "success" && r.prazoDias === minEta;
    const isBest = isBestPrice && isBestEta;
    const badges = [
      isBest ? '<span class="badge best">MELHOR OPÇÃO</span>' : "",
      !isBest && isBestPrice ? '<span class="badge price">Menor preço</span>' : "",
      !isBest && isBestEta ? '<span class="badge eta">Menor prazo</span>' : "",
    ].join(" ");
    const status = r.status === "success" ? '<span class="s ok">Sucesso</span>'
      : r.status === "error" ? '<span class="s err">Erro</span>'
      : '<span class="s un">Indisponível</span>';
    return `<tr class="${isBest ? "row-best" : ""}">
      <td><strong>${esc(r.carrierNome)}</strong> ${badges}</td>
      <td class="num ${isBestPrice ? "hi" : ""}">${r.status === "success" && r.valor !== undefined ? BRL(r.valor) : "—"}</td>
      <td class="${isBestEta ? "hi-eta" : ""}">${r.status === "success" && r.prazoDias !== undefined ? `${r.prazoDias} ${r.prazoDias === 1 ? "dia" : "dias"}` : "—"}</td>
      <td>Rodoviário</td>
      <td>${p.pesoKg.toLocaleString("pt-BR")} kg</td>
      <td>${esc(r.mensagem || "")}</td>
      <td>${status}</td>
    </tr>`;
  }).join("");

  return `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8" />
<title>Relatório de Cotação ${esc(p.quoteMeta.id)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; color: #0f172a; background: #f8fafc; }
  .wrap { max-width: 960px; margin: 0 auto; padding: 32px; background: #fff; }
  .toolbar { position: sticky; top: 0; background: #0f172a; color: #fff; padding: 12px 24px; display: flex; gap: 8px; justify-content: flex-end; z-index: 10; }
  .toolbar button { background: #22c55e; color: #000; border: 0; padding: 8px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 13px; }
  .toolbar button.ghost { background: #1e293b; color: #fff; }
  header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #22c55e; padding-bottom: 16px; margin-bottom: 24px; }
  .logo { display: flex; align-items: center; gap: 12px; }
  .logo-mark { width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #22c55e, #059669); display: flex; align-items: center; justify-content: center; color: #000; font-weight: 900; font-size: 20px; }
  .brand { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
  .brand small { display: block; font-weight: 500; color: #64748b; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 2px; }
  .meta { text-align: right; font-size: 12px; color: #475569; }
  .meta .id { font-family: "SF Mono", Menlo, monospace; font-weight: 700; color: #0f172a; font-size: 13px; }
  h1 { font-size: 24px; margin: 8px 0 24px; letter-spacing: -0.02em; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #64748b; margin: 24px 0 10px; font-weight: 700; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; background: #f8fafc; }
  .card .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700; }
  .card .val { font-size: 14px; font-weight: 600; margin-top: 2px; color: #0f172a; }
  .kvs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
  .kv { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; }
  .kv .label { font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; letter-spacing: 0.08em; }
  .kv .val { font-size: 14px; font-weight: 700; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
  th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; padding: 10px 8px; border-bottom: 2px solid #e2e8f0; background: #f8fafc; }
  td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
  td.num { font-weight: 700; }
  td.hi { color: #059669; }
  td.hi-eta { color: #2563eb; font-weight: 700; }
  tr.row-best { background: linear-gradient(90deg, rgba(34,197,94,0.08), rgba(34,197,94,0)); }
  .badge { display: inline-block; margin-left: 6px; padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: middle; }
  .badge.best { background: linear-gradient(90deg, #22c55e, #059669); color: #000; }
  .badge.price { background: #dcfce7; color: #059669; }
  .badge.eta { background: #dbeafe; color: #2563eb; }
  .s { padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
  .s.ok { background: #dcfce7; color: #059669; }
  .s.err { background: #fee2e2; color: #dc2626; }
  .s.un { background: #fef3c7; color: #b45309; }
  footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
  @media print {
    .toolbar { display: none; }
    body { background: #fff; }
    .wrap { padding: 0; max-width: none; }
  }
</style>
</head>
<body>
<div class="toolbar">
  <button onclick="window.print()">🖨️ Imprimir / PDF</button>
  <button class="ghost" onclick="navigator.share ? navigator.share({title:'Relatório de Cotação',text:'Relatório ${esc(p.quoteMeta.id)}',url:location.href}).catch(()=>{}) : (navigator.clipboard.writeText(document.title), alert('Título copiado.'))">🔗 Compartilhar</button>
</div>
<div class="wrap">
  <header>
    <div class="logo">
      <div class="logo-mark">L</div>
      <div class="brand">LogiFinder<small>${esc(empresa)}</small></div>
    </div>
    <div class="meta">
      <div class="id">${esc(p.quoteMeta.id)}</div>
      <div>${esc(dt)}</div>
    </div>
  </header>

  <h1>Relatório Comparativo de Fretes</h1>

  <h2>Partes envolvidas</h2>
  <div class="grid">
    <div class="card">
      <div class="label">Remetente</div>
      <div class="val">${esc(p.remetente?.razaoSocial || "—")}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">
        ${esc(p.remetente?.cnpj || "")}<br/>
        ${esc([p.remetente?.logradouro, p.remetente?.numero].filter(Boolean).join(", "))}<br/>
        ${esc([p.remetente?.cidade, p.remetente?.uf].filter(Boolean).join(" / "))} · CEP ${esc(formatCep(p.cepOrigem))}
      </div>
    </div>
    <div class="card">
      <div class="label">Destinatário</div>
      <div class="val">${esc(dest?.razaoSocial || "—")}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">
        ${esc(dest?.cnpj || "")}<br/>
        ${esc([dest?.logradouro, dest?.numero].filter(Boolean).join(", "))}<br/>
        ${esc([dest?.cidade, dest?.uf].filter(Boolean).join(" / "))} · CEP ${esc(formatCep(p.cepDestino))}
      </div>
    </div>
  </div>

  <h2>Dados da carga</h2>
  <div class="kvs">
    <div class="kv"><div class="label">Peso bruto</div><div class="val">${p.pesoKg.toLocaleString("pt-BR")} kg</div></div>
    <div class="kv"><div class="label">Cubagem</div><div class="val">${p.cubagem.toFixed(3)} m³</div></div>
    <div class="kv"><div class="label">Volumes</div><div class="val">${p.volumes}</div></div>
    <div class="kv"><div class="label">Valor NF-e</div><div class="val">${BRL(p.valorNF)}</div></div>
  </div>
  <div style="margin-top:8px;font-size:11px;color:#64748b;">Tipo de carga: <strong style="color:#0f172a">${esc(p.tipoCarga)}</strong></div>

  <h2>Comparativo de transportadoras (${sorted.length})</h2>
  <table>
    <thead>
      <tr>
        <th>Transportadora</th>
        <th>Valor</th>
        <th>Prazo</th>
        <th>Modal</th>
        <th>Peso considerado</th>
        <th>Observações</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px;">Nenhuma transportadora selecionada.</td></tr>`}</tbody>
  </table>

  <footer>
    Relatório gerado por LogiFinder · ${esc(dt)} · Documento sem validade fiscal · Valores sujeitos à confirmação da transportadora.
  </footer>
</div>
</body></html>`;
}
