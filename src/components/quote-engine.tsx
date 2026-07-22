import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin, Scale, Box, Layers, DollarSign, Truck, Zap, Sparkles,
  Ruler, Clock, TrendingDown, Trophy, CheckCircle2, AlertTriangle, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ESTADOS, CIDADES_POR_UF, BRL, type UF } from "@/lib/mock/data";
import { quote, rank, calcVolume, isAprovado, limiteAprovacao } from "@/lib/freight-engine";

const tiposCarga = ["Carga Seca", "Refrigerada", "Frágil", "Perigosa", "Eletrônicos", "Alimentos", "Química"];

type CepData = { cep: string; uf: string; localidade: string; logradouro: string; bairro: string; erro?: boolean };

async function fetchCep(cep: string): Promise<CepData | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    if (!r.ok) return null;
    const data = (await r.json()) as CepData;
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}


export function QuoteEngine() {
  const [origemUf, setOrigemUf] = useState<UF>("SP");
  const [origemCidade, setOrigemCidade] = useState("São Paulo");
  const [origemCep, setOrigemCep] = useState("");
  const [origemRua, setOrigemRua] = useState("");
  const [destinoUf, setDestinoUf] = useState<UF>("PR");
  const [destinoCidade, setDestinoCidade] = useState("Curitiba");
  const [destinoCep, setDestinoCep] = useState("");
  const [destinoRua, setDestinoRua] = useState("");
  const [pesoReal, setPesoReal] = useState("450");
  const [altura, setAltura] = useState("80");
  const [largura, setLargura] = useState("100");
  const [comprimento, setComprimento] = useState("120");
  const [volumes, setVolumes] = useState("12");
  const [valorNF, setValorNF] = useState("38000");
  const [tipoCarga, setTipoCarga] = useState("Carga Seca");

  const input = useMemo(
    () => ({
      origemUf, destinoUf, destinoCidade,
      pesoReal: parseFloat(pesoReal) || 0,
      altura: parseFloat(altura) || 0,
      largura: parseFloat(largura) || 0,
      comprimento: parseFloat(comprimento) || 0,
      volumes: parseInt(volumes) || 1,
      valorNF: parseFloat(valorNF) || 0,
    }),
    [origemUf, destinoUf, destinoCidade, pesoReal, altura, largura, comprimento, volumes, valorNF],
  );

  const cubagem = calcVolume(input);
  const quotes = useMemo(() => (input.pesoReal && input.valorNF ? quote(input) : []), [input]);
  const ranks = rank(quotes);
  const limite = limiteAprovacao(input.valorNF);

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
          Cubagem, peso tarifável e cobertura por transportadora calculados automaticamente.
        </p>
      </div>

      <div className="glass-strong rounded-3xl p-5 md:p-8 shadow-[0_40px_100px_-40px_oklch(0_0_0/0.8)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <RouteBlock
            title="Origem" uf={origemUf} cidade={origemCidade}
            onUf={(u) => { setOrigemUf(u); setOrigemCidade(CIDADES_POR_UF[u]?.[0] ?? ""); }}
            onCidade={setOrigemCidade} accent="from-primary to-emerald-600"
          />
          <RouteBlock
            title="Destino" uf={destinoUf} cidade={destinoCidade}
            onUf={(u) => { setDestinoUf(u); setDestinoCidade(CIDADES_POR_UF[u]?.[0] ?? ""); }}
            onCidade={setDestinoCidade} accent="from-cyan-400 to-teal-600"
            cep={cep} onCep={setCep}
          />
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

        <button className="group mt-6 relative w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-primary via-emerald-500 to-emerald-600 py-4 md:py-5 text-base md:text-lg font-bold tracking-tight text-black shadow-[0_20px_60px_-20px_oklch(0.74_0.18_152/0.8)] hover:brightness-110 transition overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <Zap className="h-5 w-5" strokeWidth={2.5} /> COTAR FRETE
        </button>
      </div>

      {quotes.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <RankCard label="🏆 Mais Barata" carrier={ranks.cheapest?.carrier.nome ?? "—"} valor={ranks.cheapest?.valor} highlight />
            <RankCard label="⚡ Mais Rápida" carrier={ranks.fastest?.carrier.nome ?? "—"} sub={`${ranks.fastest?.prazo ?? 0} dias`} />
            <RankCard label="💰 Melhor Custo-Benefício" carrier={ranks.best?.carrier.nome ?? "—"} valor={ranks.best?.valor} />
          </div>

          <div className="glass rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Limite permitido (1,5% da NF-e)</div>
              <div className="text-xl font-bold text-gradient-green">{BRL(limite)}</div>
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {quotes.length} transportadora(s) atendem <span className="text-foreground font-medium">{destinoCidade}/{destinoUf}</span>
            </div>
          </div>

          <div className="space-y-2">
            {quotes.map((q, i) => {
              const aprovado = isAprovado(q, input.valorNF);
              return (
                <div key={q.carrier.id} className="glass rounded-2xl p-4 md:p-5 hover:border-primary/30 transition animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-emerald-700/30 border border-primary/20">
                        <Truck className="h-6 w-6 text-primary" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-base font-bold truncate">{q.carrier.nome}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{q.metodo} · peso taxado {q.pesoTarifavel}kg</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 flex-1">
                      <Metric icon={Clock} label="Prazo" value={`${q.prazo}d`} />
                      <Metric icon={DollarSign} label="Frete" value={BRL(q.valor)} highlight />
                      <Metric icon={TrendingDown} label="R$/kg" value={BRL(q.valor / q.pesoTarifavel)} />
                      <div className="hidden md:block">
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Status</div>
                        <div className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold", aprovado ? "text-primary" : "text-yellow-400")}>
                          {aprovado ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          {aprovado ? "Aprovado" : "Acima do limite"}
                        </div>
                      </div>
                    </div>
                    <button className="rounded-xl bg-primary/15 border border-primary/30 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/20 transition">
                      Selecionar
                    </button>
                  </div>
                  {q.detalhes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                      {q.detalhes.map((d, k) => <span key={k}>• {d}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {input.pesoReal > 0 && input.valorNF > 0 && quotes.length === 0 && (
        <div className="glass rounded-2xl p-6 text-center text-muted-foreground">
          Nenhuma transportadora cadastrada atende o estado de destino selecionado.
        </div>
      )}
    </div>
  );
}

function RouteBlock({
  title, uf, cidade, onUf, onCidade, accent, cep, onCep,
}: {
  title: string; uf: UF; cidade: string;
  onUf: (u: UF) => void; onCidade: (c: string) => void; accent: string;
  cep?: string; onCep?: (v: string) => void;
}) {
  const cidades = CIDADES_POR_UF[uf] ?? [];
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", accent)}>
          <MapPin className="h-4 w-4 text-black" strokeWidth={2.5} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.24em] font-semibold text-muted-foreground">{title}</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">Cidade</label>
          <select value={cidade} onChange={(e) => onCidade(e.target.value)}
            className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50 appearance-none cursor-pointer">
            {cidades.map((c) => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">UF</label>
          <select value={uf} onChange={(e) => onUf(e.target.value as UF)}
            className="w-full h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-semibold text-primary focus:outline-none focus:border-primary/50 appearance-none cursor-pointer">
            {ESTADOS.map((e) => <option key={e.uf} value={e.uf} className="bg-neutral-900 text-foreground">{e.uf}</option>)}
          </select>
        </div>
      </div>
      {onCep && (
        <div className="mt-3">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">CEP</label>
          <input value={cep ?? ""} onChange={(e) => onCep(e.target.value)} placeholder="00000-000"
            className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 text-sm font-medium focus:outline-none focus:border-primary/50" />
        </div>
      )}
    </div>
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

function Metric({
  icon: Icon, label, value, highlight,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={cn("mt-1 text-sm md:text-base font-bold", highlight && "text-gradient-green")}>{value}</div>
    </div>
  );
}

function RankCard({ label, carrier, valor, sub, highlight }: { label: string; carrier: string; valor?: number; sub?: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "glass rounded-2xl p-4 border transition",
      highlight ? "border-primary/30 shadow-[0_0_30px_-10px_oklch(0.74_0.18_152/0.6)]" : "border-white/[0.06]",
    )}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <Trophy className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="mt-2 text-base font-bold truncate">{carrier}</div>
      <div className={cn("mt-1 text-sm", highlight ? "text-gradient-green font-bold" : "text-muted-foreground")}>
        {valor !== undefined ? BRL(valor) : sub}
      </div>
    </div>
  );
}
