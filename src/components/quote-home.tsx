import { useMemo, useState } from "react";
import {
  MapPin,
  Package as PackageIcon,
  Scale,
  Box,
  Layers,
  DollarSign,
  Truck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingDown,
  Percent,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const estados = ["SP", "RJ", "MG", "PR", "SC", "RS", "BA", "PE", "CE", "GO", "DF", "ES", "MT", "MS"];
const tiposCarga = ["Carga Seca", "Refrigerada", "Frágil", "Perigosa", "Eletrônicos", "Alimentos", "Química"];

const cidadesPorEstado: Record<string, string[]> = {
  SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto"],
  RJ: ["Rio de Janeiro", "Niterói", "Petrópolis"],
  MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"],
  PR: ["Curitiba", "Londrina", "Maringá"],
  SC: ["Florianópolis", "Joinville", "Blumenau"],
  RS: ["Porto Alegre", "Caxias do Sul"],
  BA: ["Salvador", "Feira de Santana"],
  PE: ["Recife", "Olinda"],
  CE: ["Fortaleza"],
  GO: ["Goiânia"],
  DF: ["Brasília"],
  ES: ["Vitória"],
  MT: ["Cuiabá"],
  MS: ["Campo Grande"],
};

type Quote = {
  transportadora: string;
  prazo: number;
  valor: number;
  custoKg: number;
  percentual: number;
  aprovado: boolean;
};

function calcQuote(input: {
  pesoBruto: number;
  pesoCubado: number;
  volumes: number;
  valorNF: number;
}): Quote | null {
  const { pesoBruto, pesoCubado, volumes, valorNF } = input;
  if (!pesoBruto || !valorNF) return null;
  const pesoTaxado = Math.max(pesoBruto, pesoCubado || 0);
  const base = pesoTaxado * 2.85 + volumes * 4.2 + valorNF * 0.008;
  const valor = Math.round(base * 100) / 100;
  const custoKg = Math.round((valor / pesoTaxado) * 100) / 100;
  const percentual = Math.round((valor / valorNF) * 10000) / 100;
  const prazo = Math.max(1, Math.round(pesoTaxado / 200) + 2);
  return {
    transportadora: "Rodonaves Transportes",
    prazo,
    valor,
    custoKg,
    percentual,
    aprovado: percentual <= 4.5,
  };
}

const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function QuoteHome() {
  const [origemEstado, setOrigemEstado] = useState("SP");
  const [origemCidade, setOrigemCidade] = useState("São Paulo");
  const [destinoEstado, setDestinoEstado] = useState("PR");
  const [destinoCidade, setDestinoCidade] = useState("Curitiba");
  const [pesoBruto, setPesoBruto] = useState("450");
  const [pesoCubado, setPesoCubado] = useState("380");
  const [volumes, setVolumes] = useState("12");
  const [valorNF, setValorNF] = useState("38000");
  const [tipoCarga, setTipoCarga] = useState("Carga Seca");

  const quote = useMemo(
    () =>
      calcQuote({
        pesoBruto: parseFloat(pesoBruto) || 0,
        pesoCubado: parseFloat(pesoCubado) || 0,
        volumes: parseInt(volumes) || 0,
        valorNF: parseFloat(valorNF) || 0,
      }),
    [pesoBruto, pesoCubado, volumes, valorNF],
  );

  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 pt-2 md:pt-6">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/90">
          <Sparkles className="h-3 w-3" />
          Cotação em tempo real
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Encontre o <span className="text-gradient-green">melhor frete</span> em segundos
        </h1>
        <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Preencha os dados da carga e compare cotações das principais transportadoras do Brasil.
        </p>
      </div>

      {/* Quote card */}
      <div className="glass-strong rounded-3xl p-5 md:p-8 shadow-[0_40px_100px_-40px_oklch(0_0_0/0.8)] animate-in fade-in zoom-in-95 duration-700">
        {/* Origem / Destino */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <RouteBlock
            title="Origem"
            estado={origemEstado}
            cidade={origemCidade}
            onEstadoChange={(e) => {
              setOrigemEstado(e);
              setOrigemCidade(cidadesPorEstado[e]?.[0] ?? "");
            }}
            onCidadeChange={setOrigemCidade}
            accent="from-primary to-emerald-600"
          />
          <RouteBlock
            title="Destino"
            estado={destinoEstado}
            cidade={destinoCidade}
            onEstadoChange={(e) => {
              setDestinoEstado(e);
              setDestinoCidade(cidadesPorEstado[e]?.[0] ?? "");
            }}
            onCidadeChange={setDestinoCidade}
            accent="from-cyan-400 to-teal-600"
          />
        </div>

        <div className="my-6 md:my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Dados da Carga</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Carga */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Field
            icon={Scale}
            label="Peso Bruto"
            value={pesoBruto}
            onChange={setPesoBruto}
            suffix="kg"
            type="number"
          />
          <Field
            icon={Box}
            label="Peso Cubado"
            value={pesoCubado}
            onChange={setPesoCubado}
            suffix="kg"
            type="number"
          />
          <Field
            icon={Layers}
            label="Volumes"
            value={volumes}
            onChange={setVolumes}
            suffix="un"
            type="number"
          />
          <Field
            icon={DollarSign}
            label="Valor da NF-e"
            value={valorNF}
            onChange={setValorNF}
            prefix="R$"
            type="number"
          />
        </div>

        <div className="mt-4 md:mt-5">
          <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-1.5 mb-2">
            <PackageIcon className="h-3 w-3" /> Tipo de Carga
          </label>
          <div className="flex flex-wrap gap-2">
            {tiposCarga.map((t) => (
              <button
                key={t}
                onClick={() => setTipoCarga(t)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300",
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

        {/* CTA */}
        <button className="group mt-6 md:mt-8 relative w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-600 py-4 md:py-5 text-base md:text-lg font-bold tracking-tight text-black shadow-[0_20px_60px_-20px_oklch(0.74_0.18_152/0.8)] hover:shadow-[0_28px_80px_-20px_oklch(0.74_0.18_152/1)] hover:brightness-110 transition-all duration-300 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Zap className="h-5 w-5" strokeWidth={2.5} />
          COTAR FRETE
        </button>
      </div>

      {/* Result */}
      {quote && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="glass rounded-3xl overflow-hidden">
            {/* Result header */}
            <div className="p-5 md:p-6 border-b border-white/[0.05] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-700 shadow-[0_0_30px_-8px_oklch(0.74_0.18_152/0.7)]">
                  <Truck className="h-7 w-7 text-black" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-semibold">
                    Melhor Transportadora
                  </div>
                  <div className="text-xl md:text-2xl font-bold tracking-tight truncate">
                    {quote.transportadora}
                  </div>
                </div>
              </div>
              <StatusBadge aprovado={quote.aprovado} />
            </div>

            {/* Result metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.05]">
              <Metric icon={Clock} label="Prazo" value={`${quote.prazo} dias`} sub="úteis" />
              <Metric
                icon={DollarSign}
                label="Valor do Frete"
                value={brl(quote.valor)}
                sub="total"
                highlight
              />
              <Metric
                icon={TrendingDown}
                label="Custo por Kg"
                value={brl(quote.custoKg)}
                sub="peso taxado"
              />
              <Metric
                icon={Percent}
                label="% sobre NF-e"
                value={`${quote.percentual.toFixed(2)}%`}
                sub={quote.aprovado ? "dentro do limite" : "acima do limite"}
                warn={!quote.aprovado}
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground justify-center">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Atualizado em tempo real · consultando 12 transportadoras
          </div>
        </div>
      )}
    </div>
  );
}

function RouteBlock({
  title,
  estado,
  cidade,
  onEstadoChange,
  onCidadeChange,
  accent,
}: {
  title: string;
  estado: string;
  cidade: string;
  onEstadoChange: (v: string) => void;
  onCidadeChange: (v: string) => void;
  accent: string;
}) {
  const cidades = cidadesPorEstado[estado] ?? [];
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-[0_0_16px_-4px_currentColor]",
            accent,
          )}
        >
          <MapPin className="h-4 w-4 text-black" strokeWidth={2.5} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
          {title}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1.5">
            Cidade
          </label>
          <select
            value={cidade}
            onChange={(e) => onCidadeChange(e.target.value)}
            className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition appearance-none cursor-pointer"
          >
            {cidades.map((c) => (
              <option key={c} value={c} className="bg-neutral-900">
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1.5">
            UF
          </label>
          <select
            value={estado}
            onChange={(e) => onEstadoChange(e.target.value)}
            className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-semibold text-primary focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition appearance-none cursor-pointer"
          >
            {estados.map((e) => (
              <option key={e} value={e} className="bg-neutral-900 text-foreground">
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  prefix,
  suffix,
  type = "text",
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
        <Icon className="h-3 w-3" strokeWidth={2} />
        <span className="truncate">{label}</span>
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-semibold focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition",
            prefix ? "pl-9" : "pl-3",
            suffix ? "pr-10" : "pr-3",
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  highlight,
  warn,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="p-5 md:p-6 relative overflow-hidden">
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />
      )}
      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {label}
        </div>
        <div
          className={cn(
            "text-xl md:text-2xl font-bold tracking-tight",
            highlight && "text-gradient-green",
            warn && "text-yellow-400",
          )}
        >
          {value}
        </div>
        {sub && <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ aprovado }: { aprovado: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-lg",
        aprovado
          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_-8px_oklch(0.74_0.18_152/0.6)]"
          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400 shadow-[0_0_24px_-8px_oklch(0.8_0.16_85/0.5)]",
      )}
    >
      {aprovado ? (
        <>
          <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
          Aprovado
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" strokeWidth={2.5} />
          Acima do limite
        </>
      )}
    </div>
  );
}
