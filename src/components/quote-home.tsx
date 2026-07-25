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
  Plus,
  Trash2,
  ChevronDown,
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

// Tipos de volume pré-definidos
const tiposVolumePreset = [
  {
    id: "caixa-p",
    label: "Caixa P",
    desc: "10×40×40 cm",
    icon: "📦",
    altura: 10,
    largura: 40,
    comprimento: 40,
  },
  {
    id: "caixa-m",
    label: "Caixa M",
    desc: "10×20×20 cm",
    icon: "📦",
    altura: 10,
    largura: 20,
    comprimento: 20,
  },
  {
    id: "pallet",
    label: "Pallet",
    desc: "70×70×70 cm",
    icon: "🟫",
    altura: 70,
    largura: 70,
    comprimento: 70,
  },
  {
    id: "caixote",
    label: "Caixote",
    desc: "70×70×100 cm",
    icon: "📫",
    altura: 70,
    largura: 70,
    comprimento: 100,
  },
];

type VolumeItem = {
  id: string;
  tipo: string;
  quantidade: number;
  altura: number;
  largura: number;
  comprimento: number;
  peso: number;
};

function calcPesoCubado(h: number, l: number, c: number): number {
  // Fator de cubagem padrão: 300 kg/m³ (padrão rodoviário)
  return (h * l * c) / 6000;
}

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

let nextId = 1;

export function QuoteHome() {
  const [origemEstado, setOrigemEstado] = useState("SP");
  const [origemCidade, setOrigemCidade] = useState("São Paulo");
  const [destinoEstado, setDestinoEstado] = useState("PR");
  const [destinoCidade, setDestinoCidade] = useState("Curitiba");
  const [valorNF, setValorNF] = useState("38000");
  const [tipoCarga, setTipoCarga] = useState("Carga Seca");

  // Lista de volumes
  const [volumeItems, setVolumeItems] = useState<VolumeItem[]>([
    {
      id: String(nextId++),
      tipo: "caixa-p",
      quantidade: 12,
      altura: 10,
      largura: 40,
      comprimento: 40,
      peso: 450,
    },
  ]);

  // Totais calculados automaticamente
  const totais = useMemo(() => {
    const totalVolumes = volumeItems.reduce((s, v) => s + v.quantidade, 0);
    const totalPesoBruto = volumeItems.reduce((s, v) => s + v.peso * v.quantidade, 0);
    const totalPesoCubado = volumeItems.reduce(
      (s, v) => s + calcPesoCubado(v.altura, v.largura, v.comprimento) * v.quantidade,
      0,
    );
    return { totalVolumes, totalPesoBruto, totalPesoCubado };
  }, [volumeItems]);

  const quote = useMemo(
    () =>
      calcQuote({
        pesoBruto: totais.totalPesoBruto,
        pesoCubado: totais.totalPesoCubado,
        volumes: totais.totalVolumes,
        valorNF: parseFloat(valorNF) || 0,
      }),
    [totais, valorNF],
  );

  function addVolume(presetId?: string) {
    const preset = tiposVolumePreset.find((p) => p.id === presetId) ?? tiposVolumePreset[0];
    setVolumeItems((prev) => [
      ...prev,
      {
        id: String(nextId++),
        tipo: preset.id,
        quantidade: 1,
        altura: preset.altura,
        largura: preset.largura,
        comprimento: preset.comprimento,
        peso: 10,
      },
    ]);
  }

  function removeVolume(id: string) {
    setVolumeItems((prev) => prev.filter((v) => v.id !== id));
  }

  function updateVolume(id: string, field: keyof VolumeItem, value: number | string) {
    setVolumeItems((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        if (field === "tipo") {
          const preset = tiposVolumePreset.find((p) => p.id === value);
          if (preset)
            return {
              ...v,
              tipo: preset.id,
              altura: preset.altura,
              largura: preset.largura,
              comprimento: preset.comprimento,
            };
          return { ...v, tipo: String(value) };
        }
        return { ...v, [field]: typeof value === "string" ? parseFloat(value) || 0 : value };
      }),
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Hero */}
      <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 pt-2 md:pt-6">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary/90">
          <Sparkles className="h-3 w-3" />
          Cotação em tempo real
        </div>
        <h1 className="mt-4 text-3xl md:text-5xl font-bold tracking-tight">
          Encontre o <span className="text-gradient-blue">melhor frete</span> em segundos
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
            accent="from-primary to-blue-600"
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

        {/* Divisor */}
        <div className="my-6 md:my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Volumes e Dimensões</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Tipos de Volume - Atalhos */}
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2 flex items-center gap-1.5">
            <PackageIcon className="h-3 w-3" /> Adicionar volume pré-definido
          </p>
          <div className="flex flex-wrap gap-2">
            {tiposVolumePreset.map((preset) => (
              <button
                key={preset.id}
                onClick={() => addVolume(preset.id)}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/[0.06] hover:border-primary/30 transition-all duration-200"
              >
                <span className="text-base leading-none">{preset.icon}</span>
                <span className="font-semibold">{preset.label}</span>
                <span className="text-muted-foreground/60">{preset.desc}</span>
                <Plus className="h-3 w-3 text-primary ml-1" />
              </button>
            ))}
          </div>
        </div>

        {/* Lista de volumes */}
        <div className="space-y-3">
          {volumeItems.map((vol, idx) => {
            const pesoTotal = vol.peso * vol.quantidade;
            const cubado = calcPesoCubado(vol.altura, vol.largura, vol.comprimento) * vol.quantidade;
            return (
              <div
                key={vol.id}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 animate-in fade-in slide-in-from-top-2 duration-300"
              >
                {/* Header da linha */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/15 text-[11px] font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Volume</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground">
                      Cubado: <span className="text-foreground font-semibold">{cubado.toFixed(2)} kg</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Peso total: <span className="text-foreground font-semibold">{pesoTotal.toFixed(1)} kg</span>
                    </span>
                    {volumeItems.length > 1 && (
                      <button
                        onClick={() => removeVolume(vol.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Campos */}
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2 md:gap-3">
                  {/* Tipo */}
                  <div className="col-span-2 md:col-span-2">
                    <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1">
                      Tipo
                    </label>
                    <div className="relative">
                      <select
                        value={vol.tipo}
                        onChange={(e) => updateVolume(vol.id, "tipo", e.target.value)}
                        className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50 transition appearance-none cursor-pointer"
                      >
                        {tiposVolumePreset.map((p) => (
                          <option key={p.id} value={p.id} className="bg-neutral-900">
                            {p.icon} {p.label} — {p.desc}
                          </option>
                        ))}
                        <option value="personalizado" className="bg-neutral-900">
                          ✏️ Personalizado
                        </option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Quantidade */}
                  <DimField
                    label="Qtd"
                    value={vol.quantidade}
                    onChange={(v) => updateVolume(vol.id, "quantidade", v)}
                    suffix="un"
                  />

                  {/* Altura */}
                  <DimField
                    label="Altura"
                    value={vol.altura}
                    onChange={(v) => updateVolume(vol.id, "altura", v)}
                    suffix="cm"
                  />

                  {/* Largura */}
                  <DimField
                    label="Largura"
                    value={vol.largura}
                    onChange={(v) => updateVolume(vol.id, "largura", v)}
                    suffix="cm"
                  />

                  {/* Comprimento */}
                  <DimField
                    label="Compr."
                    value={vol.comprimento}
                    onChange={(v) => updateVolume(vol.id, "comprimento", v)}
                    suffix="cm"
                  />

                  {/* Peso unitário */}
                  <DimField
                    label="Peso/un"
                    value={vol.peso}
                    onChange={(v) => updateVolume(vol.id, "peso", v)}
                    suffix="kg"
                  />
                </div>
              </div>
            );
          })}

          {/* Botão adicionar volume personalizado */}
          <button
            onClick={() => addVolume()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/[0.1] py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-white/[0.02] transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Adicionar outro volume
          </button>
        </div>

        {/* Totais calculados */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <TotalCard label="Total de Volumes" value={`${totais.totalVolumes} un`} icon="📦" />
          <TotalCard label="Peso Bruto Total" value={`${totais.totalPesoBruto.toFixed(1)} kg`} icon="⚖️" />
          <TotalCard
            label="Peso Cubado Total"
            value={`${totais.totalPesoCubado.toFixed(2)} kg`}
            icon="📐"
            highlight={totais.totalPesoCubado > totais.totalPesoBruto}
          />
        </div>

        {/* Divisor */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">Dados Fiscais</span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Valor NF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <Field
            icon={DollarSign}
            label="Valor da NF-e"
            value={valorNF}
            onChange={setValorNF}
            prefix="R$"
            type="number"
          />
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
              <PackageIcon className="h-3 w-3" /> Tipo de Carga
            </label>
            <div className="relative">
              <select
                value={tipoCarga}
                onChange={(e) => setTipoCarga(e.target.value)}
                className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50 transition appearance-none cursor-pointer"
              >
                {tiposCarga.map((t) => (
                  <option key={t} value={t} className="bg-neutral-900">
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="group mt-6 md:mt-8 relative w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary via-blue-500 to-indigo-600 py-4 md:py-5 text-base md:text-lg font-bold tracking-tight text-white shadow-[0_20px_60px_-20px_oklch(0.62_0.22_255/0.8)] hover:shadow-[0_28px_80px_-20px_oklch(0.62_0.22_255/1)] hover:brightness-110 transition-all duration-300 overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
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
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-indigo-700 shadow-[0_0_30px_-8px_oklch(0.62_0.22_255/0.7)]">
                  <Truck className="h-7 w-7 text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-[0.2em] text-primary/80 font-semibold">
                    Melhor Transportadora
                  </div>
                  <div className="text-xl md:text-2xl font-bold tracking-tight truncate">{quote.transportadora}</div>
                </div>
              </div>
              <StatusBadge aprovado={quote.aprovado} />
            </div>

            {/* Result metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/[0.05]">
              <Metric icon={Clock} label="Prazo" value={`${quote.prazo} dias`} sub="úteis" />
              <Metric icon={DollarSign} label="Valor do Frete" value={brl(quote.valor)} sub="total" highlight />
              <Metric icon={TrendingDown} label="Custo por Kg" value={brl(quote.custoKg)} sub="peso taxado" />
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

// ─── Sub-componentes ────────────────────────────────────────────────────────

function DimField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix: string;
}) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] pl-3 pr-9 text-sm font-semibold focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function TotalCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-3 md:p-4 text-center transition-all duration-300",
        highlight
          ? "border-primary/30 bg-primary/10 shadow-[0_0_20px_-8px_oklch(0.62_0.22_255/0.4)]"
          : "border-white/[0.06] bg-white/[0.02]",
      )}
    >
      <div className="text-lg mb-1">{icon}</div>
      <div className={cn("text-base md:text-lg font-bold tracking-tight", highlight && "text-gradient-blue")}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
      {highlight && (
        <div className="mt-1 text-[10px] text-primary/70 font-medium">⚠️ Peso taxado será o cubado</div>
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
          <MapPin className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">{title}</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1.5">Cidade</label>
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
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground/80 block mb-1.5">UF</label>
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
      {highlight && <div className="absolute inset-0 bg-gradient-to-br from-primary/8 to-transparent pointer-events-none" />}
      <div className="relative">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          {label}
        </div>
        <div
          className={cn(
            "text-xl md:text-2xl font-bold tracking-tight",
            highlight && "text-gradient-blue",
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
          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_24px_-8px_oklch(0.62_0.22_255/0.6)]"
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
