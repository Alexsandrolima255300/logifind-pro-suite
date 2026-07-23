import { useCallback, useMemo, useState } from "react";
import {
  Scale, Box, Layers, DollarSign, Truck, Zap, Sparkles,
  Ruler, Clock, TrendingDown, CheckCircle2, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRL, type UF } from "@/lib/mock/data";
import { quote, rank, calcVolume, isAprovado, limiteAprovacao } from "@/lib/freight-engine";
import { CompanyBlock } from "@/components/cnpj-lookup";
import type { CnpjCompany } from "@/lib/cnpj";

const tiposCarga = ["Carga Seca", "Refrigerada", "Frágil", "Perigosa", "Eletrônicos", "Alimentos", "Química"];
const CNPJ_REMETENTE_PADRAO = "39860057000104";

export function QuoteEngine() {
  const [origemUf, setOrigemUf] = useState<UF>("SP");
  const [destinoUf, setDestinoUf] = useState<UF>("SP");
  const [destinoCidade, setDestinoCidade] = useState("");

  const [pesoReal, setPesoReal] = useState("");
  const [altura, setAltura] = useState("");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [volumes, setVolumes] = useState("");
  const [valorNF, setValorNF] = useState("");
  const [tipoCarga, setTipoCarga] = useState("Carga Seca");

  const [selectedCarrier, setSelectedCarrier] = useState<string | null>(null);

  const handleRemetente = useCallback((c: CnpjCompany) => {
    if (c.uf) setOrigemUf(c.uf as UF);
  }, []);

  const handleDestinatario = useCallback((c: CnpjCompany) => {
    if (c.uf) setDestinoUf(c.uf as UF);
    if (c.cidade) setDestinoCidade(c.cidade);
  }, []);

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
              {quotes.length} transportadora(s) atendem <span className="text-foreground font-medium">{destinoCidade || "destino"}/{destinoUf}</span>
            </div>
          </div>

          <div className="space-y-2">
            {quotes.map((q, i) => {
              const aprovado = isAprovado(q, input.valorNF);
              const isSelected = selectedCarrier === q.carrier.id;
              return (
                <div
                  key={q.carrier.id}
                  onClick={() => setSelectedCarrier(q.carrier.id)}
                  className={cn(
                    "glass rounded-2xl p-4 md:p-5 transition cursor-pointer animate-in fade-in slide-in-from-bottom-4 relative",
                    isSelected
                      ? "border-primary/60 bg-primary/10 shadow-[0_0_0_1px_oklch(0.74_0.18_152/0.5),0_20px_60px_-20px_oklch(0.74_0.18_152/0.5)] ring-1 ring-primary/40"
                      : "hover:border-primary/30",
                  )}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {isSelected && (
                    <div className="absolute -top-2 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
                      <CheckCircle2 className="h-3 w-3" strokeWidth={3} /> Selecionada
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition",
                        isSelected
                          ? "bg-gradient-to-br from-primary to-emerald-600 border-primary text-black"
                          : "bg-gradient-to-br from-primary/30 to-emerald-700/30 border-primary/20 text-primary",
                      )}>
                        <Truck className="h-6 w-6" strokeWidth={2} />
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
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedCarrier(q.carrier.id); }}
                      className={cn(
                        "rounded-xl border px-4 py-2 text-xs font-semibold transition",
                        isSelected
                          ? "bg-primary text-black border-primary hover:brightness-110"
                          : "bg-primary/15 border-primary/30 text-primary hover:bg-primary/20",
                      )}
                    >
                      {isSelected ? "Selecionada" : "Selecionar"}
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
      highlight ? "border-primary/30 bg-primary/5" : "border-white/[0.06]",
    )}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-bold truncate">{carrier}</div>
      {valor !== undefined && <div className="mt-1 text-lg font-bold text-gradient-green">{BRL(valor)}</div>}
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
