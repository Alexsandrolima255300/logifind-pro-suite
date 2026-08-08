import { useState } from "react";
import type { CarrierQuoteResult } from "@/lib/carriers/types";
import { CheckCircle2, XCircle, AlertTriangle, Clock, Info, ChevronDown, ChevronUp, FileText, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type CarrierResultCardProps = {
  quote: CarrierQuoteResult;
  isCheapest?: boolean;
  isFastest?: boolean;
};

export function CarrierResultCard({ quote, isCheapest, isFastest }: CarrierResultCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return "—";
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
          !quote.atende
            ? "border-slate-800 bg-slate-900/40 opacity-75"
            : quote.status === "error"
            ? "border-red-900/50 bg-red-950/20"
            : isCheapest
            ? "border-emerald-500/50 bg-emerald-950/20 ring-1 ring-emerald-500/30"
            : "border-slate-700/60 bg-slate-800/40"
        }`}
      >
        {/* Badges de Destaque */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {isCheapest && quote.atende && quote.status === "success" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
              <Zap className="h-3 w-3" /> Melhor Preço
            </span>
          )}
          {isFastest && quote.atende && quote.status === "success" && !isCheapest && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400 border border-blue-500/30">
              <Clock className="h-3 w-3" /> Mais Rápido
            </span>
          )}
        </div>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg font-bold text-lg ${
              quote.carrierId === "rodonaves"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : quote.carrierId === "danubio"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : quote.carrierId === "braspress"
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
            }`}
          >
            {quote.carrierNome.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-lg">{quote.carrierNome}</h3>
            <span className="text-xs text-slate-400 font-mono">{quote.tipoCalculo || "Cálculo Automático"}</span>
          </div>
        </div>

        {/* Status de Cobertura */}
        <div className="mt-4 flex items-center gap-2">
          {quote.atende && quote.status === "success" ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400 text-sm">
              <CheckCircle2 className="h-4 w-4" /> ✓ Atende o destino
            </span>
          ) : quote.atende && quote.status === "unavailable" ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-400 text-sm">
              <AlertTriangle className="h-4 w-4" /> Integração Indisponível
            </span>
          ) : quote.status === "error" ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4" /> Falha na consulta
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-400 text-sm">
              <XCircle className="h-4 w-4" /> ✕ Não atende este destino
            </span>
          )}
        </div>

        {/* Valores e Prazo */}
        {quote.atende && quote.status === "success" && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-700/50 pt-4">
            <div>
              <span className="text-xs text-slate-400">Valor do Frete</span>
              <p className="text-2xl font-extrabold text-emerald-400">{formatCurrency(quote.valor)}</p>
              {quote.desconto && quote.desconto > 0 ? (
                <span className="text-xs text-emerald-500 font-medium">Desconto: {formatCurrency(quote.desconto)}</span>
              ) : null}
            </div>
            <div>
              <span className="text-xs text-slate-400">Prazo Estimado</span>
              <p className="text-lg font-bold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <Clock className="h-4 w-4 text-blue-400" />
                {quote.prazoDias ? `${quote.prazoDias} dia${quote.prazoDias > 1 ? "s" : ""}` : "Sob consulta"}
              </p>
              {quote.protocolo && <span className="text-xs text-slate-400 font-mono">Protocolo: {quote.protocolo}</span>}
            </div>
          </div>
        )}

        {/* Mensagem descritiva ou de erro amigável */}
        {quote.mensagem && (
          <p className="mt-3 text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-md border border-slate-800/80 leading-relaxed">
            {quote.mensagem}
          </p>
        )}

        {/* Botão de Detalhes */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Info className="h-3.5 w-3.5" /> Detalhes da Cotação
          </button>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-100">
              <FileText className="h-5 w-5 text-blue-400" /> Detalhes — {quote.carrierNome}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Informações completas do cálculo e resposta técnica.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-sm">
            <div className="flex justify-between border-b border-slate-800 py-1.5">
              <span className="text-slate-400">Transportadora:</span>
              <span className="font-semibold text-slate-200">{quote.carrierNome}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 py-1.5">
              <span className="text-slate-400">Status da Cobertura:</span>
              <span className={quote.atende ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                {quote.atende ? "✓ Atende destino" : "✕ Sem cobertura"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 py-1.5">
              <span className="text-slate-400">Valor Total:</span>
              <span className="font-bold text-emerald-400 text-base">{formatCurrency(quote.valor)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 py-1.5">
              <span className="text-slate-400">Prazo de Entrega:</span>
              <span className="font-semibold text-slate-200">
                {quote.prazoDias ? `${quote.prazoDias} dias úteis` : "N/A"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 py-1.5">
              <span className="text-slate-400">Tipo de Cálculo:</span>
              <span className="font-mono text-xs text-slate-300">{quote.tipoCalculo || "Automático"}</span>
            </div>
            {quote.protocolo && (
              <div className="flex justify-between border-b border-slate-800 py-1.5">
                <span className="text-slate-400">Protocolo:</span>
                <span className="font-mono text-xs text-amber-400">{quote.protocolo}</span>
              </div>
            )}
            {quote.cte && (
              <div className="flex justify-between border-b border-slate-800 py-1.5">
                <span className="text-slate-400">CT-e:</span>
                <span className="font-mono text-xs text-sky-400">{quote.cte}</span>
              </div>
            )}
            <div className="border-b border-slate-800 py-1.5">
              <span className="text-slate-400 block mb-1">Data/Hora da Consulta:</span>
              <span className="font-mono text-xs text-slate-300">
                {new Date(quote.consultadoEm).toLocaleString("pt-BR")}
              </span>
            </div>
            {quote.mensagem && (
              <div className="pt-2">
                <span className="text-slate-400 text-xs block mb-1">Observações da Operação:</span>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded border border-slate-800 leading-relaxed font-mono">
                  {quote.mensagem}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
