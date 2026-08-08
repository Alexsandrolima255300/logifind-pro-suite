import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import {
  Search,
  Truck,
  Package,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { fetchRodonavesTracking, fetchRodonavesDeliveryReceipt } from "@/lib/carriers";
import type { TrackingResult } from "@/lib/carriers/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rastreamento")({
  component: () => <RastreamentoPage />,
});

function RastreamentoPage() {
  const [searchType, setSearchType] = useState<"invoiceNumber" | "protocolNumber" | "cteNumber" | "invoiceKey" | "cnpj">("invoiceNumber");
  const [searchValue, setSearchValue] = useState("10520");
  const [cnpjValue, setCnpjValue] = useState("12345678000190");

  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const [receiptData, setReceiptData] = useState<{ receiptUrl?: string; receiverName?: string; destinyUnit?: string } | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchValue.trim()) {
      toast.error("Informe o parâmetro de busca.");
      return;
    }

    setLoading(true);
    setTrackingResult(null);
    setReceiptData(null);

    const params: { cnpj?: string; invoiceNumber?: string; protocolNumber?: string; cteNumber?: string; invoiceKey?: string } = {
      cnpj: cnpjValue,
    };

    if (searchType === "invoiceNumber") params.invoiceNumber = searchValue.trim();
    if (searchType === "protocolNumber") params.protocolNumber = searchValue.trim();
    if (searchType === "cteNumber") params.cteNumber = searchValue.trim();
    if (searchType === "invoiceKey") params.invoiceKey = searchValue.trim();

    try {
      const res = await fetchRodonavesTracking(params);
      setTrackingResult(res);

      if (res.status === "found") {
        toast.success("Rastreamento localizado!");
        fetchRodonavesDeliveryReceipt(params).then((r) => setReceiptData(r));
      } else {
        toast.warning(res.mensagem || "Rastreamento não localizado.");
      }
    } catch {
      toast.error("Falha ao consultar rastreamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-6 text-slate-100">
      {/* Cabeçalho */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <Truck className="h-8 w-8 text-sky-400" /> Rastreamento Inteligente de Carga
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          Acompanhe o status, eventos de transporte (Proceda) e comprovante de entrega da Rodonaves e transportadoras parceiras.
        </p>
      </div>

      {/* Formulário de Rastreio */}
      <form onSubmit={handleSearch} className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-400 font-medium">Buscar por:</label>
          {[
            { id: "invoiceNumber", label: "Número da NF-e" },
            { id: "protocolNumber", label: "Protocolo" },
            { id: "cteNumber", label: "CT-e" },
            { id: "invoiceKey", label: "Chave da NF-e" },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSearchType(type.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                searchType === type.id ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">CNPJ do Pagador / Remetente</label>
            <input
              type="text"
              value={cnpjValue}
              onChange={(e) => setCnpjValue(e.target.value)}
              placeholder="00.000.000/0001-00"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 font-medium mb-1 block">
              {searchType === "invoiceNumber"
                ? "Número da Nota Fiscal"
                : searchType === "protocolNumber"
                ? "Número do Protocolo"
                : searchType === "cteNumber"
                ? "Número do CT-e"
                : "Chave Eletrônica da NF-e"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Digite o código para busca..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition-all disabled:opacity-50"
              >
                <Search className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Rastrear
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Resultados do Rastreio */}
      {trackingResult && (
        <div className="space-y-6">
          {/* Card Resumo do Pedido */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-sky-400" /> {trackingResult.carrierNome}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  NF-e: {trackingResult.numeroNotaFiscal || "N/A"} | CT-e: {trackingResult.numeroCte || "N/A"}
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${
                  trackingResult.status === "found"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}
              >
                {trackingResult.status === "found" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                {trackingResult.status === "found" ? "Localizado" : "Não Localizado"}
              </span>
            </div>

            {trackingResult.status === "found" && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Remetente</span>
                  <span className="font-semibold text-slate-200">{trackingResult.remetente || "Informado na NF"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Destinatário</span>
                  <span className="font-semibold text-slate-200">{trackingResult.destinatario || "Informado na NF"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Unidade Destino</span>
                  <span className="font-semibold text-sky-400">{trackingResult.unidadeDestino || "Unidade RTE"}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block mb-0.5">Recebedor</span>
                  <span className="font-semibold text-emerald-400">{receiptData?.receiverName || "Em transporte"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Timeline Interativa */}
          {trackingResult.eventos && trackingResult.eventos.length > 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
              <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2 border-b border-slate-800 pb-3">
                <Clock className="h-5 w-5 text-amber-400" /> Timeline e Ocorrências da Carga (Proceda)
              </h3>

              <div className="relative border-l-2 border-slate-700 ml-4 space-y-6 py-2">
                {trackingResult.eventos.map((evt, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 ${
                        evt.categoria === "Sucesso"
                          ? "bg-emerald-500 border-emerald-300"
                          : evt.categoria === "Crítico" || evt.categoria === "Erro"
                          ? "bg-red-500 border-red-300"
                          : evt.categoria === "Alerta"
                          ? "bg-amber-500 border-amber-300"
                          : "bg-sky-500 border-sky-300"
                      }`}
                    />

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-100 text-sm">{evt.descricao}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(evt.dataHora).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono pt-1">
                        <span>Código Proceda: <strong>{evt.codigo}</strong></span>
                        {evt.local && <span>Local: <strong>{evt.local}</strong></span>}
                        {evt.status && (
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                            {evt.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : trackingResult.status === "found" ? (
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 text-center text-slate-400">
              <p>Nenhum evento detalhado registrado até o momento.</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
