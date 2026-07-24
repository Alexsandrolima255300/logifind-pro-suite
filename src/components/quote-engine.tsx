import { useCallback, useMemo, useState } from "react";
import {
  Scale, Box, Layers, DollarSign, Zap, Sparkles,
  Ruler, Clock, CheckCircle2, AlertTriangle, WifiOff, Loader2,
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

export function QuoteEngine() {
  const [cepOrigem, setCepOrigem] = useState("");
  const [cepDestino, setCepDestino] = useState("");
  const [cnpjRemetente, setCnpjRemetente] = useState("");
  const [cnpjDestinatario, setCnpjDestinatario] = useState("");

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

  const handleRemetente = useCallback((c: CnpjCompany) => {
    if (c.cep) setCepOrigem(onlyDigits(c.cep));
    if (c.cnpj) setCnpjRemetente(onlyDigits(c.cnpj));
  }, []);

  const handleDestinatario = useCallback((c: CnpjCompany) => {
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
    } finally {
      setLoading(false);
    }
  }

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
        />
      )}
    </div>
  );
}

function ResultsTable({
  results, selected, onSelect,
}: {
  results: CarrierQuoteResult[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const successCount = results.filter((r) => r.status === "success").length;
  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <div className="glass rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Cotações recebidas</div>
          <div className="text-xl font-bold">
            <span className="text-gradient-green">{successCount}</span>
            <span className="text-muted-foreground text-sm font-medium"> / {results.length} transportadoras</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          Ordenadas do menor para o maior valor
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_1fr_1.2fr_1fr_1.5fr] gap-3 px-5 py-3 text-[10px] uppercase tracking-wider text-muted-foreground border-b border-white/[0.06]">
          <div>Transportadora</div>
          <div>Valor</div>
          <div>Prazo</div>
          <div>Consultado em</div>
          <div>Status</div>
          <div className="text-right">Ação</div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {results.map((r, i) => (
            <ResultRow
              key={r.carrierId}
              r={r}
              index={i}
              selected={selected === r.carrierId}
              onSelect={() => r.status === "success" && onSelect(r.carrierId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  r, index, selected, onSelect,
}: {
  r: CarrierQuoteResult; index: number; selected: boolean; onSelect: () => void;
}) {
  const dateLabel = new Date(r.consultadoEm).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
  return (
    <div
      className={cn(
        "grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1.2fr_1fr_1.5fr] gap-3 px-5 py-4 items-center transition animate-in fade-in slide-in-from-bottom-2",
        selected ? "bg-primary/10 ring-1 ring-inset ring-primary/40" : "hover:bg-white/[0.02]",
      )}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="col-span-2 md:col-span-1">
        <div className="text-sm font-bold truncate">{r.carrierNome}</div>
        {r.mensagem && r.status !== "success" && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.mensagem}</div>
        )}
      </div>
      <div className="text-sm font-bold text-gradient-green">
        {r.status === "success" && r.valor !== undefined ? BRL(r.valor) : <span className="text-muted-foreground font-normal">—</span>}
      </div>
      <div className="text-sm">
        {r.status === "success" && r.prazoDias !== undefined
          ? <span className="font-semibold">{r.prazoDias} {r.prazoDias === 1 ? "dia" : "dias"}</span>
          : <span className="text-muted-foreground">—</span>}
      </div>
      <div className="text-[11px] text-muted-foreground">{dateLabel}</div>
      <StatusBadge status={r.status} />
      <div className="col-span-2 md:col-span-1 md:text-right">
        <button
          disabled={r.status !== "success"}
          onClick={onSelect}
          className={cn(
            "rounded-xl border px-4 py-2 text-xs font-semibold transition",
            r.status !== "success"
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
