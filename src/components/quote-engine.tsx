import { useState, useMemo } from "react";
import {
  MapPin,
  Package as PackageIcon,
  Scale,
  Box,
  DollarSign,
  Truck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Trash2,
  Building2,
  User,
  Phone,
  Mail,
  Search,
  Sparkles,
  FileText,
  RefreshCw,
} from "lucide-react";
import type { FreightRequest, VolumeItem, CarrierQuoteResult } from "@/lib/carriers/types";
import { calculateCubagem, runQuoteEngine } from "@/lib/carriers";
import { CarrierResultCard } from "./CarrierResultCard";
import { toast } from "sonner";

const PRESET_VOLUMES = [
  { label: "Caixa P", icon: "📦", altura: 10, largura: 40, comprimento: 40 },
  { label: "Caixa M", icon: "📦", altura: 10, largura: 20, comprimento: 20 },
  { label: "Pallet", icon: "🟫", altura: 70, largura: 70, comprimento: 70 },
  { label: "Caixote", icon: "📫", altura: 70, largura: 70, comprimento: 100 },
];

export function QuoteEngine() {
  // Remetente
  const [cepOrigem, setCepOrigem] = useState("01001-000");
  const [cidadeOrigem, setCidadeOrigem] = useState("São Paulo");
  const [ufOrigem, setUfOrigem] = useState("SP");
  const [enderecoOrigem, setEnderecoOrigem] = useState("Praça da Sé");
  const [numeroOrigem, setNumeroOrigem] = useState("100");
  const [bairroOrigem, setBairroOrigem] = useState("Sé");
  const [complementoOrigem, setComplementoOrigem] = useState("");
  const [cnpjRemetente, setCnpjRemetente] = useState("12.345.678/0001-90");

  // Destinatário
  const [cepDestino, setCepDestino] = useState("13010-001");
  const [cidadeDestino, setCidadeDestino] = useState("Campinas");
  const [ufDestino, setUfDestino] = useState("SP");
  const [enderecoDestino, setEnderecoDestino] = useState("Avenida Francisco Glicério");
  const [numeroDestino, setNumeroDestino] = useState("500");
  const [bairroDestino, setBairroDestino] = useState("Centro");
  const [complementoDestino, setComplementoDestino] = useState("");
  const [cpfCnpjDestinatario, setCpfCnpjDestinatario] = useState("98.765.432/0001-10");
  const [tipoCliente, setTipoCliente] = useState<"PJ" | "PF">("PJ");

  // Mercadoria
  const [valorNF, setValorNF] = useState<number>(1500);
  const [pesoTotal, setPesoTotal] = useState<number>(45);

  // Tabela de Volumes
  const [volumesList, setVolumesList] = useState<VolumeItem[]>([
    { id: "1", tipo: "Caixa P", alturaCm: 10, larguraCm: 40, comprimentoCm: 40, quantidade: 2, pesoUnitarioKg: 22.5 },
  ]);

  // Contato
  const [nomeContato, setNomeContato] = useState("Alexsandro Lima");
  const [telefoneContato, setTelefoneContato] = useState("(11) 99999-8888");
  const [emailContato, setEmailContato] = useState("contato@logifinder.com.br");

  // Transportadoras Selecionadas
  const [selectedCarriers, setSelectedCarriers] = useState<string[]>(["rodonaves", "danubio", "braspress", "alfa"]);

  // Estados de cálculo
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState<"origem" | "destino" | null>(null);
  const [quoteResults, setQuoteResults] = useState<CarrierQuoteResult[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Autopreenchimento CEP via ViaCEP
  const lookupCep = async (cep: string, target: "origem" | "destino") => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setLoadingCep(target);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        if (target === "origem") {
          setCidadeOrigem(data.localidade || "");
          setUfOrigem(data.uf || "");
          setEnderecoOrigem(data.logradouro || "");
          setBairroOrigem(data.bairro || "");
        } else {
          setCidadeDestino(data.localidade || "");
          setUfDestino(data.uf || "");
          setEnderecoDestino(data.logradouro || "");
          setBairroDestino(data.bairro || "");
        }
        toast.success(`Endereço de ${target} localizado: ${data.localidade}/${data.uf}`);
      }
    } catch {
      // Ignorar falha de CEP
    } finally {
      setLoadingCep(null);
    }
  };

  // Totais de volumes e cubagem
  const totalVolumesQty = useMemo(() => {
    return volumesList.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
  }, [volumesList]);

  const cubagemTotalM3 = useMemo(() => {
    return calculateCubagem(volumesList);
  }, [volumesList]);

  // Manipulação da tabela de volumes
  const addPresetVolume = (preset: (typeof PRESET_VOLUMES)[0]) => {
    const newItem: VolumeItem = {
      id: Date.now().toString(),
      tipo: preset.label,
      alturaCm: preset.altura,
      larguraCm: preset.largura,
      comprimentoCm: preset.comprimento,
      quantidade: 1,
      pesoUnitarioKg: 10,
    };
    setVolumesList((prev) => [...prev, newItem]);
  };

  const addEmptyVolume = () => {
    const newItem: VolumeItem = {
      id: Date.now().toString(),
      tipo: "Personalizado",
      alturaCm: 20,
      larguraCm: 20,
      comprimentoCm: 20,
      quantidade: 1,
      pesoUnitarioKg: 5,
    };
    setVolumesList((prev) => [...prev, newItem]);
  };

  const removeVolume = (id?: string) => {
    if (volumesList.length <= 1) {
      toast.error("É necessário ter pelo menos 1 volume na cotação.");
      return;
    }
    setVolumesList((prev) => prev.filter((item) => item.id !== id));
  };

  const updateVolume = (id: string | undefined, field: keyof VolumeItem, val: string | number) => {
    setVolumesList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: val };
        }
        return item;
      })
    );
  };

  // Disparo de Cotação ou Simulação
  const handleRunQuote = async (modo: "simulation" | "quotation") => {
    setLoading(true);
    setValidationErrors([]);
    setQuoteResults(null);

    const req: FreightRequest = {
      cepOrigem,
      cidadeOrigem,
      ufOrigem,
      enderecoOrigem,
      numeroOrigem,
      bairroOrigem,
      complementoOrigem,
      cnpjRemetente,

      cepDestino,
      cidadeDestino,
      ufDestino,
      enderecoDestino,
      numeroDestino,
      bairroDestino,
      complementoDestino,
      cpfCnpjDestinatario,
      tipoCliente,

      valorNF,
      pesoKg: pesoTotal,
      volumes: totalVolumesQty || 1,
      cubagemM3: cubagemTotalM3,
      itensVolume: volumesList,

      nomeContato,
      telefoneContato,
      emailContato,

      modo,
    };

    try {
      const { quotes, errors } = await runQuoteEngine(req, selectedCarriers);
      if (errors && errors.length > 0) {
        setValidationErrors(errors);
        toast.error("Por favor, corrija os erros do formulário.");
      } else {
        setQuoteResults(quotes);
        toast.success(`Cotação concluída! ${quotes.filter((q) => q.atende).length} transportadoras atendem o destino.`);
      }
    } catch {
      toast.error("Falha ao processar cotação.");
    } finally {
      setLoading(false);
    }
  };

  // Encontrar melhor preço e prazos
  const cheapestValue = useMemo(() => {
    if (!quoteResults) return undefined;
    const valid = quoteResults.filter((q) => q.atende && q.status === "success" && q.valor !== undefined);
    if (valid.length === 0) return undefined;
    return Math.min(...valid.map((q) => q.valor!));
  }, [quoteResults]);

  const fastestValue = useMemo(() => {
    if (!quoteResults) return undefined;
    const valid = quoteResults.filter((q) => q.atende && q.status === "success" && q.prazoDias !== undefined);
    if (valid.length === 0) return undefined;
    return Math.min(...valid.map((q) => q.prazoDias!));
  }, [quoteResults]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-500" /> Nova Cotação de Frete
          </h1>
          <p className="mt-1 text-slate-400 text-sm">
            Compare valores, prazos e cobertura oficial da Rodonaves, Danúbio, Braspress e Alfa em uma única consulta.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRunQuote("simulation")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Simular Frete
          </button>
          <button
            onClick={() => handleRunQuote("quotation")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Zap className="h-4 w-4" /> {loading ? "Calculando..." : "Gerar Cotação Oficial"}
          </button>
        </div>
      </div>

      {/* Erros de Validação */}
      {validationErrors.length > 0 && (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 p-4 text-red-300">
          <h4 className="font-bold flex items-center gap-2 text-red-200">
            <AlertTriangle className="h-5 w-5 text-red-400" /> Verifique os erros antes de continuar:
          </h4>
          <ul className="mt-2 list-disc list-inside text-sm space-y-1 text-red-300">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Formulário Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Remetente */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="h-5 w-5 text-blue-400" /> Dados do Remetente (Origem)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs text-slate-400 font-medium mb-1 block">CEP Origem *</label>
              <div className="relative">
                <input
                  type="text"
                  value={cepOrigem}
                  onChange={(e) => setCepOrigem(e.target.value)}
                  onBlur={() => lookupCep(cepOrigem, "origem")}
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                {loadingCep === "origem" && (
                  <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-blue-400" />
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Cidade Origem *</label>
              <input
                type="text"
                value={cidadeOrigem}
                onChange={(e) => setCidadeOrigem(e.target.value)}
                placeholder="São Paulo"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">UF Origem *</label>
              <input
                type="text"
                value={ufOrigem}
                onChange={(e) => setUfOrigem(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SP"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Endereço de Origem</label>
              <input
                type="text"
                value={enderecoOrigem}
                onChange={(e) => setEnderecoOrigem(e.target.value)}
                placeholder="Rua, Av..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Número</label>
              <input
                type="text"
                value={numeroOrigem}
                onChange={(e) => setNumeroOrigem(e.target.value)}
                placeholder="100"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Bairro</label>
              <input
                type="text"
                value={bairroOrigem}
                onChange={(e) => setBairroOrigem(e.target.value)}
                placeholder="Centro"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">CNPJ Remetente</label>
              <input
                type="text"
                value={cnpjRemetente}
                onChange={(e) => setCnpjRemetente(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Card Destinatário */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-400" /> Dados do Destinatário (Destino)
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTipoCliente("PJ")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  tipoCliente === "PJ" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Pessoa Jurídica (PJ)
              </button>
              <button
                type="button"
                onClick={() => setTipoCliente("PF")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  tipoCliente === "PF" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Pessoa Física (PF)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs text-slate-400 font-medium mb-1 block">CEP Destino *</label>
              <div className="relative">
                <input
                  type="text"
                  value={cepDestino}
                  onChange={(e) => setCepDestino(e.target.value)}
                  onBlur={() => lookupCep(cepDestino, "destino")}
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
                {loadingCep === "destino" && (
                  <RefreshCw className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-emerald-400" />
                )}
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Cidade Destino *</label>
              <input
                type="text"
                value={cidadeDestino}
                onChange={(e) => setCidadeDestino(e.target.value)}
                placeholder="Campinas"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">UF Destino *</label>
              <input
                type="text"
                value={ufDestino}
                onChange={(e) => setUfDestino(e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SP"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-400 font-medium mb-1 block">Endereço de Destino</label>
              <input
                type="text"
                value={enderecoDestino}
                onChange={(e) => setEnderecoDestino(e.target.value)}
                placeholder="Av., Rua..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Número</label>
              <input
                type="text"
                value={numeroDestino}
                onChange={(e) => setNumeroDestino(e.target.value)}
                placeholder="500"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Bairro</label>
              <input
                type="text"
                value={bairroDestino}
                onChange={(e) => setBairroDestino(e.target.value)}
                placeholder="Centro"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">
                {tipoCliente === "PJ" ? "CNPJ Destinatário" : "CPF Destinatário"}
              </label>
              <input
                type="text"
                value={cpfCnpjDestinatario}
                onChange={(e) => setCpfCnpjDestinatario(e.target.value)}
                placeholder={tipoCliente === "PJ" ? "00.000.000/0001-00" : "000.000.000-00"}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card Dados da Carga & Volumes */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
            <Box className="h-5 w-5 text-amber-400" /> Especificação da Carga e Volumes
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Cubagem Total: <strong className="text-amber-400">{cubagemTotalM3} m³</strong>
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              Total Volumes: <strong className="text-blue-400">{totalVolumesQty}</strong>
            </span>
          </div>
        </div>

        {/* Atalhos Rápidos de Tipos de Volume */}
        <div>
          <label className="text-xs text-slate-400 font-medium mb-2 block">Atalhos de Tipos de Volume Pré-Definidos:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_VOLUMES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => addPresetVolume(preset)}
                className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/60 p-2.5 text-xs text-slate-200 hover:border-amber-500/50 hover:bg-slate-800 transition-all text-left"
              >
                <span className="text-lg">{preset.icon}</span>
                <div>
                  <span className="font-bold block">{preset.label}</span>
                  <span className="text-[10px] text-slate-400">
                    {preset.altura}×{preset.largura}×{preset.comprimento} cm
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabela de Volumes */}
        <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Tipo</th>
                <th className="p-3 w-20">Qtd</th>
                <th className="p-3 w-24">Alt (cm)</th>
                <th className="p-3 w-24">Larg (cm)</th>
                <th className="p-3 w-24">Comp (cm)</th>
                <th className="p-3 w-28">Peso Unit (kg)</th>
                <th className="p-3 w-24">Cubagem (m³)</th>
                <th className="p-3 w-12 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {volumesList.map((item) => {
                const volM3 = Math.round((item.alturaCm * item.larguraCm * item.comprimentoCm * item.quantidade) / 1000) / 1000;
                return (
                  <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3">
                      <input
                        type="text"
                        value={item.tipo}
                        onChange={(e) => updateVolume(item.id, "tipo", e.target.value)}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.quantidade}
                        onChange={(e) => updateVolume(item.id, "quantidade", Number(e.target.value))}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.alturaCm}
                        onChange={(e) => updateVolume(item.id, "alturaCm", Number(e.target.value))}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.larguraCm}
                        onChange={(e) => updateVolume(item.id, "larguraCm", Number(e.target.value))}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={1}
                        value={item.comprimentoCm}
                        onChange={(e) => updateVolume(item.id, "comprimentoCm", Number(e.target.value))}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={item.pesoUnitarioKg || ""}
                        onChange={(e) => updateVolume(item.id, "pesoUnitarioKg", Number(e.target.value))}
                        className="w-full rounded border border-slate-800 bg-slate-900 px-2 py-1 text-slate-200 focus:border-blue-500 focus:outline-none"
                      />
                    </td>
                    <td className="p-3 font-mono font-semibold text-amber-400">{volM3} m³</td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeVolume(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remover linha"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={addEmptyVolume}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Plus className="h-3.5 w-3.5" /> Adicionar Outro Volume
          </button>

          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Valor da NF-e (R$) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  min={1}
                  value={valorNF}
                  onChange={(e) => setValorNF(Number(e.target.value))}
                  placeholder="1500"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Peso Total (kg) *</label>
              <div className="relative">
                <Scale className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={pesoTotal}
                  onChange={(e) => setPesoTotal(Number(e.target.value))}
                  placeholder="45"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Seleção de Transportadoras & Contato */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
            <Truck className="h-5 w-5 text-sky-400" /> Transportadoras a Consultar
          </h3>
          <p className="text-xs text-slate-400">
            Selecione quais transportadoras farão parte da comparação de frete e cobertura:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: "rodonaves", name: "Rodonaves", tag: "API Oficial / Malha" },
              { id: "danubio", name: "Danúbio", tag: "Regra Própria" },
              { id: "braspress", name: "Braspress", tag: "API Oficial" },
              { id: "alfa", name: "Alfa Transportes", tag: "API Oficial" },
            ].map((c) => {
              const isChecked = selectedCarriers.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all ${
                    isChecked
                      ? "border-blue-500/60 bg-blue-950/20 text-white"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{c.name}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCarriers((prev) => [...prev, c.id]);
                        } else {
                          setSelectedCarriers((prev) => prev.filter((item) => item !== c.id));
                        }
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2 font-mono">{c.tag}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
            <Mail className="h-5 w-5 text-purple-400" /> Contato da Cotação
          </h3>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Nome do Contato</label>
            <input
              type="text"
              value={nomeContato}
              onChange={(e) => setNomeContato(e.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Telefone / Celular</label>
            <input
              type="text"
              value={telefoneContato}
              onChange={(e) => setTelefoneContato(e.target.value)}
              placeholder="(11) 99999-9999"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">E-mail</label>
            <input
              type="email"
              value={emailContato}
              onChange={(e) => setEmailContato(e.target.value)}
              placeholder="email@empresa.com.br"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Resultados da Cotação */}
      {quoteResults && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> Resultados da Comparação de Frete
            </h2>
            <span className="text-xs text-slate-400">
              Origem: <strong>{cidadeOrigem}/{ufOrigem}</strong> → Destino: <strong>{cidadeDestino}/{ufDestino}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quoteResults.map((q) => (
              <CarrierResultCard
                key={q.carrierId}
                quote={q}
                isCheapest={q.valor !== undefined && q.valor === cheapestValue}
                isFastest={q.prazoDias !== undefined && q.prazoDias === fastestValue}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
