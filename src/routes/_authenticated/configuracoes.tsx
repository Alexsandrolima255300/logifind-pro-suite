import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import {
  Truck,
  ShieldCheck,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings,
  Database,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import {
  getRodonavesQuotationToken,
  rodonavesAdapter,
  DANUBIO_CIDADES_INICIAIS,
  importRodonavesSpreadsheet,
} from "@/lib/carriers";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: () => <ConfiguracoesPage />,
});

function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<"rodonaves" | "danubio" | "geral">("rodonaves");

  // Estados Rodonaves
  const [testingAuth, setTestingAuth] = useState(false);
  const [authStatus, setAuthStatus] = useState<{ success?: boolean; message?: string; timestamp?: string } | null>(null);

  const [testingQuote, setTestingQuote] = useState(false);
  const [quoteTestStatus, setQuoteTestStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState<{
    totalRows?: number;
    insertedCount?: number;
    errorLines?: string[];
  } | null>(null);

  // Estados Danúbio
  const [valorPorKg, setValorPorKg] = useState(0.7);
  const [percentualNf, setPercentualNf] = useState(0.015);
  const [freteMinimo, setFreteMinimo] = useState(100);
  const [danubioCities, setDanubioCities] = useState<string[]>(DANUBIO_CIDADES_INICIAIS);
  const [newCityName, setNewCityName] = useState("");

  // Testar Autenticação Rodonaves
  const handleTestRodonavesAuth = async () => {
    setTestingAuth(true);
    setAuthStatus(null);
    try {
      const token = await getRodonavesQuotationToken();
      if (token) {
        setAuthStatus({
          success: true,
          message: `✓ Conexão e Autenticação bem-sucedidas! Token JWT obtido com sucesso.`,
          timestamp: new Date().toLocaleTimeString("pt-BR"),
        });
        toast.success("Autenticação Rodonaves confirmada!");
      }
    } catch (err) {
      setAuthStatus({
        success: false,
        message: err instanceof Error ? err.message : "✕ Falha ao conectar na API Rodonaves.",
        timestamp: new Date().toLocaleTimeString("pt-BR"),
      });
      toast.error("Falha na autenticação Rodonaves.");
    } finally {
      setTestingAuth(false);
    }
  };

  // Testar Cotação Rodonaves
  const handleTestRodonavesQuote = async () => {
    setTestingQuote(true);
    setQuoteTestStatus(null);
    try {
      const res = await rodonavesAdapter.quote({
        cepOrigem: "01001000",
        cepDestino: "13010001",
        cidadeOrigem: "São Paulo",
        ufOrigem: "SP",
        cidadeDestino: "Campinas",
        ufDestino: "SP",
        pesoKg: 10,
        valorNF: 1000,
        volumes: 1,
        modo: "simulation",
      });

      if (res.status === "success") {
        setQuoteTestStatus({
          success: true,
          message: `✓ Cotação de teste bem-sucedida: Valor R$ ${res.valor?.toFixed(2)} | Prazo: ${res.prazoDias} dias | Protocolo: ${res.protocolo}`,
        });
        toast.success("Cotação de teste concluída!");
      } else {
        setQuoteTestStatus({
          success: false,
          message: `✕ Resposta: ${res.mensagem || "Erro na cotação de teste"}`,
        });
      }
    } catch (err) {
      setQuoteTestStatus({
        success: false,
        message: err instanceof Error ? err.message : "✕ Erro durante o teste de cotação.",
      });
    } finally {
      setTestingQuote(false);
    }
  };

  // Upload da Planilha Rodonaves
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setUploading(true);
    setImportResults(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const stats = await importRodonavesSpreadsheet(arrayBuffer);
      setImportResults(stats);
      if (stats.insertedCount > 0) {
        toast.success(`Importação concluída! ${stats.insertedCount} cidades importadas/atualizadas.`);
      } else {
        toast.warning("Nenhum registro foi importado. Verifique o formato das colunas.");
      }
    } catch (err) {
      toast.error(`Falha no upload: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  };

  // Manipular Cidades Danúbio
  const handleAddDanubioCity = () => {
    if (!newCityName.trim()) return;
    const clean = newCityName.trim().toLowerCase();
    if (danubioCities.includes(clean)) {
      toast.error("Cidade já cadastrada.");
      return;
    }
    setDanubioCities((prev) => [...prev, clean]);
    setNewCityName("");
    toast.success(`Cidade "${clean}" adicionada.`);
  };

  const handleRemoveDanubioCity = (city: string) => {
    setDanubioCities((prev) => prev.filter((c) => c !== city));
    toast.info(`Cidade "${city}" removida.`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 text-slate-100">
      {/* Cabeçalho */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" /> Configurações de Transportadoras
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          Gerencie credenciais, regras de cálculo, tabelas de cobertura e testes de API para Rodonaves e Danúbio.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab("rodonaves")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "rodonaves"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Truck className="h-4 w-4" /> Rodonaves (RTE)
          </span>
        </button>
        <button
          onClick={() => setActiveTab("danubio")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "danubio"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Danúbio Transportes
          </span>
        </button>
      </div>

      {/* Conteúdo Tab Rodonaves */}
      {activeTab === "rodonaves" && (
        <div className="space-y-6">
          {/* Card de Teste e Status da API */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5 shadow-sm">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="h-5 w-5 text-amber-400" /> Conexão e Autenticação Rodonaves API
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              As credenciais da Rodonaves são gerenciadas via variáveis de ambiente seguras no backend (Supabase Secrets):
              <br />
              <code className="text-amber-300 font-mono text-[11px]">
                RODONAVES_QUOTATION_USERNAME | RODONAVES_QUOTATION_PASSWORD
              </code>
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleTestRodonavesAuth}
                disabled={testingAuth}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${testingAuth ? "animate-spin" : ""}`} /> Testar Autenticação / Token
              </button>
              <button
                onClick={handleTestRodonavesQuote}
                disabled={testingQuote}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-all disabled:opacity-50"
              >
                <Zap className="h-4 w-4 text-amber-400" /> Testar Cotação (Simulação)
              </button>
            </div>

            {authStatus && (
              <div
                className={`p-4 rounded-lg border text-xs font-mono space-y-1 ${
                  authStatus.success
                    ? "border-emerald-800/80 bg-emerald-950/30 text-emerald-300"
                    : "border-red-800/80 bg-red-950/30 text-red-300"
                }`}
              >
                <p className="font-bold flex items-center gap-1.5">
                  {authStatus.success ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                  {authStatus.message}
                </p>
                {authStatus.timestamp && <p className="text-slate-400">Última checagem: {authStatus.timestamp}</p>}
              </div>
            )}

            {quoteTestStatus && (
              <div
                className={`p-4 rounded-lg border text-xs font-mono ${
                  quoteTestStatus.success
                    ? "border-emerald-800/80 bg-emerald-950/30 text-emerald-300"
                    : "border-red-800/80 bg-red-950/30 text-red-300"
                }`}
              >
                <p className="font-bold">{quoteTestStatus.message}</p>
              </div>
            )}
          </div>

          {/* Card Importador de Planilha Rodonaves */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileSpreadsheet className="h-5 w-5 text-emerald-400" /> Importar Planilha de Cidades Atendidas (Cidades Atendidas - RTE.xlsx)
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Faça o upload da planilha oficial para alimentar a tabela <code className="text-emerald-300 font-mono">transportadora_cidades</code> no Supabase com prazos PJ/PF, distância em KM, frequência e dias de operação.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-all">
                <Upload className="h-4 w-4" /> {uploading ? "Processando Planilha..." : "Selecionar Arquivo .XLSX / .CSV"}
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} disabled={uploading} className="hidden" />
              </label>
            </div>

            {importResults && (
              <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-200">
                  <span>Total de Linhas Processadas: <strong>{importResults.totalRows}</strong></span>
                  <span className="text-emerald-400">Registros Inseridos/Atualizados: <strong>{importResults.insertedCount}</strong></span>
                </div>

                {importResults.errorLines && importResults.errorLines.length > 0 && (
                  <div className="text-red-400 space-y-1 pt-1">
                    <span className="font-bold block">Alertas / Erros de Linhas:</span>
                    <ul className="max-h-36 overflow-y-auto list-disc list-inside space-y-1">
                      {importResults.errorLines.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Tab Danúbio */}
      {activeTab === "danubio" && (
        <div className="space-y-6">
          {/* Card Regras de Cálculo Danúbio */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
              <Zap className="h-5 w-5 text-sky-400" /> Regra de Cálculo Determinística Danúbio
            </h3>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-1.5">
              <p className="font-bold text-sky-400">Fórmula de Frete Implementada:</p>
              <p>frete_peso = peso × R$ {valorPorKg.toFixed(2)}</p>
              <p>frete_percentual = valor_nf × {(percentualNf * 100).toFixed(1)}%</p>
              <p className="text-emerald-400 font-bold">frete_danubio = MAX(frete_peso, frete_percentual, R$ {freteMinimo.toFixed(2)})</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Valor por KG (R$)</label>
                <input
                  type="number"
                  step="0.05"
                  value={valorPorKg}
                  onChange={(e) => setValorPorKg(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Percentual NF-e (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={percentualNf * 100}
                  onChange={(e) => setPercentualNf(Number(e.target.value) / 100)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium mb-1 block">Frete Mínimo (R$)</label>
                <input
                  type="number"
                  step="5"
                  value={freteMinimo}
                  onChange={(e) => setFreteMinimo(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card Cidades Atendidas Danúbio */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
              <Database className="h-5 w-5 text-sky-400" /> Cidades com Cobertura Informada ({danubioCities.length})
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDanubioCity()}
                placeholder="Nome da cidade (ex: Jundiaí)..."
                className="w-full max-w-xs rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAddDanubioCity}
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition-all"
              >
                <Plus className="h-4 w-4" /> Adicionar Cidade
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 max-h-64 overflow-y-auto">
              {danubioCities.map((city, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-200 capitalize font-medium"
                >
                  {city}
                  <button onClick={() => handleRemoveDanubioCity(city)} className="text-slate-400 hover:text-red-400">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
