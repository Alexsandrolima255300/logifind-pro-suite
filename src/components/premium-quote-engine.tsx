import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Building2, CheckCircle2, Loader2, MapPin, Package, Plus, RefreshCw, Search, Scale, Trash2, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import type { CarrierQuoteResult, FreightRequest, VolumeItem } from "@/lib/carriers/types";
import { calculateCubagem, runQuoteEngine } from "@/lib/carriers";
import { lookupCnpj, type CnpjCompany } from "@/lib/cnpj.functions";

const ORANGE = "text-primary";

function money(value?: number) {
  return value == null || Number.isNaN(value) ? "—" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CnpjField({ value, onChange, onCompany }: { value: string; onChange: (v: string) => void; onCompany: (c: CnpjCompany) => void }) {
  const [loading, setLoading] = useState(false);
  const lookup = async () => {
    if (value.replace(/\D/g, "").length !== 14) return;
    setLoading(true);
    try {
      const result = await lookupCnpj({ data: { cnpj: value } });
      if (!result.ok) toast.error(result.error);
      else { onCompany(result.company); toast.success(`${result.company.razaoSocial} localizada.`); }
    } finally { setLoading(false); }
  };
  return (
    <div className="relative">
      <input value={value} onChange={(e) => onChange(e.target.value)} onBlur={lookup} placeholder="00.000.000/0000-00" inputMode="numeric" className="lf-input pr-10" />
      <button type="button" onClick={lookup} disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
      </button>
    </div>
  );
}

function AddressCard({ title, icon: Icon, cnpj, setCnpj, company, setCompany, cep, setCep, city, setCity, uf, setUf, street, setStreet, number, setNumber, neighborhood, setNeighborhood }: any) {
  const [loadingCep, setLoadingCep] = useState(false);
  const findCep = async () => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await response.json();
      if (data.erro) toast.error("CEP não encontrado.");
      else { setCity(data.localidade ?? ""); setUf(data.uf ?? ""); setStreet(data.logradouro ?? ""); setNeighborhood(data.bairro ?? ""); toast.success(`${data.localidade}/${data.uf} localizada.`); }
    } catch { toast.error("Não foi possível consultar o CEP agora."); }
    finally { setLoadingCep(false); }
  };
  const applyCompany = (data: CnpjCompany) => {
    setCompany(data.razaoSocial || data.nomeFantasia || "");
    if (data.cep) setCep(data.cep);
    if (data.municipio) setCity(data.municipio);
    if (data.uf) setUf(data.uf);
    if (data.logradouro) setStreet(data.logradouro);
    if (data.numero) setNumber(data.numero);
    if (data.bairro) setNeighborhood(data.bairro);
  };
  return (
    <section className="lf-card p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><div className="lf-icon"><Icon className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">{title}</h2><p className="text-xs text-muted-foreground">CNPJ e endereço preenchidos automaticamente.</p></div></div>
        <span className="lf-pill"><CheckCircle2 className="h-3.5 w-3.5" /> Automação</span>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_1.5fr]">
        <label className="lf-label">CNPJ<CnpjField value={cnpj} onChange={setCnpj} onCompany={applyCompany} /></label>
        <label className="lf-label">Empresa<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Razão social / nome fantasia" className="lf-input" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-[180px_1fr_90px]">
        <label className="lf-label">CEP<div className="relative"><input value={cep} onChange={(e) => setCep(e.target.value)} onBlur={findCep} placeholder="00000-000" className="lf-input pr-9" />{loadingCep && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}</div></label>
        <label className="lf-label">Logradouro<input value={street} onChange={(e) => setStreet(e.target.value)} className="lf-input" /></label>
        <label className="lf-label">Número<input value={number} onChange={(e) => setNumber(e.target.value)} className="lf-input" /></label>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_110px_1fr]">
        <label className="lf-label">Bairro<input value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} className="lf-input" /></label>
        <label className="lf-label">UF<input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase())} maxLength={2} className="lf-input" /></label>
        <label className="lf-label">Cidade<input value={city} onChange={(e) => setCity(e.target.value)} className="lf-input" /></label>
      </div>
    </section>
  );
}

export function PremiumQuoteEngine() {
  const [origin, setOrigin] = useState({ cnpj: "", company: "", cep: "01001-000", city: "São Paulo", uf: "SP", street: "Praça da Sé", number: "100", neighborhood: "Sé" });
  const [destination, setDestination] = useState({ cnpj: "", company: "", cep: "", city: "", uf: "", street: "", number: "", neighborhood: "" });
  const [value, setValue] = useState(0);
  const [weight, setWeight] = useState(0);
  const [carriers, setCarriers] = useState(["rodonaves", "danubio", "braspress", "alfa"]);
  const [volumes, setVolumes] = useState<VolumeItem[]>([{ id: "1", tipo: "Caixa", alturaCm: 20, larguraCm: 30, comprimentoCm: 40, quantidade: 1, pesoUnitarioKg: 0 }]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CarrierQuoteResult[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const cubagem = useMemo(() => calculateCubagem(volumes), [volumes]);
  const volumeCount = useMemo(() => volumes.reduce((sum, v) => sum + Number(v.quantidade || 0), 0), [volumes]);
  const validResults = results?.filter((r) => r.atende && r.status === "success" && r.valor != null) ?? [];
  const cheapest = validResults.length ? Math.min(...validResults.map((r) => r.valor!)) : undefined;

  const updateVolume = (id: string, field: keyof VolumeItem, value: string) => setVolumes((current) => current.map((v) => v.id === id ? { ...v, [field]: field === "tipo" ? value : Number(value) } : v));
  const addVolume = () => setVolumes((current) => [...current, { id: crypto.randomUUID(), tipo: "Caixa", alturaCm: 20, larguraCm: 30, comprimentoCm: 40, quantidade: 1, pesoUnitarioKg: 0 }]);
  const removeVolume = (id: string) => setVolumes((current) => current.length > 1 ? current.filter((v) => v.id !== id) : current);

  const calculate = async () => {
    setLoading(true); setErrors([]); setResults(null);
    const request: FreightRequest = {
      cepOrigem: origin.cep, cidadeOrigem: origin.city, ufOrigem: origin.uf, enderecoOrigem: origin.street, numeroOrigem: origin.number, bairroOrigem: origin.neighborhood, complementoOrigem: "", cnpjRemetente: origin.cnpj,
      cepDestino: destination.cep, cidadeDestino: destination.city, ufDestino: destination.uf, enderecoDestino: destination.street, numeroDestino: destination.number, bairroDestino: destination.neighborhood, complementoDestino: "", cpfCnpjDestinatario: destination.cnpj, tipoCliente: "PJ",
      valorNF: Number(value), pesoKg: Number(weight), volumes: volumeCount || 1, cubagemM3: cubagem, itensVolume: volumes,
      nomeContato: destination.company, telefoneContato: "", emailContato: "", modo: "quotation",
    };
    try {
      const response = await runQuoteEngine(request, carriers);
      setErrors(response.errors ?? []); setResults(response.quotes ?? []);
      if (response.errors?.length) toast.error("Revise os dados da cotação."); else toast.success("Cotação calculada com sucesso.");
    } catch { toast.error("Não foi possível calcular a cotação."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-7">
      <div className="lf-hero">
        <div><div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.18em]"><Truck className="h-4 w-4" /> Motor LogiFinder</div><h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight">Nova cotação</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Preencha origem, destino e carga. O LogiFinder identifica o endereço pelo CEP, consulta o CNPJ no servidor e compara as transportadoras configuradas.</p></div>
        <Link to="/" className="lf-secondary"><ArrowRight className="h-4 w-4 rotate-180" /> Início</Link>
      </div>

      {errors.length > 0 && <div className="lf-alert"><AlertTriangle className="h-5 w-5" /><div><b>Revise os dados</b><ul className="mt-1 list-disc pl-5 text-sm">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul></div></div>}

      <div className="grid gap-5 xl:grid-cols-2">
        <AddressCard title="Remetente" icon={Building2} {...origin} cnpj={origin.cnpj} setCnpj={(v: string) => setOrigin((o) => ({ ...o, cnpj: v }))} company={origin.company} setCompany={(v: string) => setOrigin((o) => ({ ...o, company: v }))} cep={origin.cep} setCep={(v: string) => setOrigin((o) => ({ ...o, cep: v }))} city={origin.city} setCity={(v: string) => setOrigin((o) => ({ ...o, city: v }))} uf={origin.uf} setUf={(v: string) => setOrigin((o) => ({ ...o, uf: v }))} street={origin.street} setStreet={(v: string) => setOrigin((o) => ({ ...o, street: v }))} number={origin.number} setNumber={(v: string) => setOrigin((o) => ({ ...o, number: v }))} neighborhood={origin.neighborhood} setNeighborhood={(v: string) => setOrigin((o) => ({ ...o, neighborhood: v }))} />
        <AddressCard title="Destinatário" icon={MapPin} {...destination} cnpj={destination.cnpj} setCnpj={(v: string) => setDestination((o) => ({ ...o, cnpj: v }))} company={destination.company} setCompany={(v: string) => setDestination((o) => ({ ...o, company: v }))} cep={destination.cep} setCep={(v: string) => setDestination((o) => ({ ...o, cep: v }))} city={destination.city} setCity={(v: string) => setDestination((o) => ({ ...o, city: v }))} uf={destination.uf} setUf={(v: string) => setDestination((o) => ({ ...o, uf: v }))} street={destination.street} setStreet={(v: string) => setDestination((o) => ({ ...o, street: v }))} number={destination.number} setNumber={(v: string) => setDestination((o) => ({ ...o, number: v }))} neighborhood={destination.neighborhood} setNeighborhood={(v: string) => setDestination((o) => ({ ...o, neighborhood: v }))} />
      </div>

      <section className="lf-card p-5 md:p-6 space-y-5">
        <div className="flex items-center gap-3"><div className="lf-icon"><Package className="h-5 w-5" /></div><div><h2 className="text-lg font-bold">Carga</h2><p className="text-xs text-muted-foreground">Cubagem e peso são recalculados em tempo real.</p></div></div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="lf-label">Valor da NF-e<input type="number" min="0" value={value || ""} onChange={(e) => setValue(Number(e.target.value))} className="lf-input" placeholder="R$ 0,00" /></label>
          <label className="lf-label">Peso real (kg)<input type="number" min="0" value={weight || ""} onChange={(e) => setWeight(Number(e.target.value))} className="lf-input" placeholder="0,00" /></label>
          <div className="grid grid-cols-2 gap-3"><div className="lf-stat"><span>Volumes</span><strong>{volumeCount}</strong></div><div className="lf-stat"><span>Cubagem</span><strong>{cubagem.toFixed(4)} m³</strong></div></div>
        </div>
        <div className="space-y-3">
          {volumes.map((v) => <div key={v.id} className="grid gap-2 rounded-xl border border-white/8 bg-black/20 p-3 sm:grid-cols-[1.2fr_repeat(4,1fr)_auto]">
            <input value={v.tipo} onChange={(e) => updateVolume(v.id!, "tipo", e.target.value)} className="lf-input" placeholder="Tipo" />
            <input type="number" value={v.alturaCm} onChange={(e) => updateVolume(v.id!, "alturaCm", e.target.value)} className="lf-input" placeholder="Altura cm" />
            <input type="number" value={v.larguraCm} onChange={(e) => updateVolume(v.id!, "larguraCm", e.target.value)} className="lf-input" placeholder="Largura cm" />
            <input type="number" value={v.comprimentoCm} onChange={(e) => updateVolume(v.id!, "comprimentoCm", e.target.value)} className="lf-input" placeholder="Comprimento cm" />
            <input type="number" value={v.quantidade} onChange={(e) => updateVolume(v.id!, "quantidade", e.target.value)} className="lf-input" placeholder="Qtd" />
            <button type="button" onClick={() => removeVolume(v.id!)} className="lf-icon-button text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></button>
          </div>)}
          <button type="button" onClick={addVolume} className="lf-secondary"><Plus className="h-4 w-4" /> Adicionar volume</button>
        </div>
      </section>

      <section className="lf-card p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold">Transportadoras participantes</h2><p className="text-xs text-muted-foreground">Somente as selecionadas serão enviadas ao motor de cotação.</p></div><div className="flex flex-wrap gap-2">{["rodonaves", "danubio", "braspress", "alfa"].map((id) => <button key={id} type="button" onClick={() => setCarriers((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id])} className={carriers.includes(id) ? "lf-carrier active" : "lf-carrier"}>{id}</button>)}</div></div>
        <button type="button" onClick={calculate} disabled={loading} className="lf-primary mt-6 w-full md:w-auto">{loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Calculando...</> : <><Zap className="h-4 w-4" /> Calcular frete</>}</button>
      </section>

      {results && <section className="space-y-4"><div className="flex items-end justify-between"><div><div className="text-xs font-bold uppercase tracking-widest text-primary">Resultado</div><h2 className="mt-1 text-2xl font-black">Comparação de fretes</h2></div><button type="button" onClick={calculate} className="lf-secondary"><RefreshCw className="h-4 w-4" /> Recalcular</button></div><div className="grid gap-4 md:grid-cols-2">{results.map((q) => <div key={q.carrierId} className="lf-card p-5"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="lf-icon text-sm font-black">{q.carrierNome.slice(0, 2).toUpperCase()}</div><div><h3 className="font-bold">{q.carrierNome}</h3><p className="text-xs text-muted-foreground">{q.tipoCalculo ?? "Cálculo automático"}</p></div></div>{q.atende ? <span className="lf-pill success"><CheckCircle2 className="h-3.5 w-3.5" /> Atende</span> : <span className="lf-pill">Não atende</span>}</div>{q.atende && q.status === "success" && <div className="mt-5 grid grid-cols-2 gap-4"><div><span className="text-xs text-muted-foreground">Frete</span><p className={`text-2xl font-black ${q.valor === cheapest ? "text-primary" : ""}`}>{money(q.valor)}</p></div><div><span className="text-xs text-muted-foreground">Prazo</span><p className="text-xl font-bold">{q.prazoDias ? `${q.prazoDias} dias` : "Sob consulta"}</p></div></div>}{q.mensagem && <p className="mt-4 rounded-xl bg-black/20 p-3 text-xs text-muted-foreground">{q.mensagem}</p>}</div>)}</div></section>}
    </div>
  );
}
