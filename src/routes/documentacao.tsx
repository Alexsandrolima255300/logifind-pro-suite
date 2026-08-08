import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app-layout";
import { BookOpen, ShieldCheck, Truck, Zap, Code2, Database, Terminal, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/documentacao")({
  component: () => (
    <AppLayout>
      <DocumentacaoPage />
    </AppLayout>
  ),
});

function DocumentacaoPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6 text-slate-100">
      {/* Header */}
      <div className="border-b border-slate-800 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-blue-500" /> Documentação Técnica da Integração
        </h1>
        <p className="mt-1 text-slate-400 text-sm">
          Guia completo da arquitetura de integração de frete para Rodonaves (RTE) e Danúbio Transportes no LogiFinder.
        </p>
      </div>

      {/* Seção Segurança */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-400" /> 1. Arquitetura de Segurança & Credenciais
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Nenhuma senha ou token sensível é armazenado no código-fonte, no repositório GitHub ou exposto ao navegador do usuário.
          Todas as chamadas à API da Rodonaves trafegam pelo backend (Supabase Edge Functions / Server Context) utilizando Supabase Secrets:
        </p>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
          <p>RODONAVES_QUOTATION_USERNAME | RODONAVES_QUOTATION_PASSWORD</p>
          <p>RODONAVES_TRACKING_USERNAME  | RODONAVES_TRACKING_PASSWORD</p>
          <p>RODONAVES_CITY_USERNAME      | RODONAVES_CITY_PASSWORD</p>
        </div>
      </div>

      {/* Seção Rodonaves */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Truck className="h-5 w-5 text-amber-400" /> 2. Integração Oficial Rodonaves (RTE)
        </h2>
        
        <div className="space-y-3 text-sm text-slate-300">
          <div>
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Autenticação por Token JWT:
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Obtido via POST ao gateway <code className="text-amber-300">https://quotation-apigateway.rte.com.br/token</code> com <code className="text-amber-300">application/x-www-form-urlencoded</code>. Token armazenado em cache temporário em memória backend.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Descoberta Automática de CityId:
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              API <code className="text-amber-300">GET /api/v1/busca-cidade?name=...</code> resolve automaticamente o ID numérico do município a partir do nome e UF da consulta.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Cotação e Simulação:
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Endpoints <code className="text-amber-300">/gera-cotacao</code> e <code className="text-amber-300">/simula-cotacao</code> aceitam a matriz de volumes com dimensões e cubagem, retornando o valor do frete, prazo em dias e protocolo.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-200 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-400" /> Rastreamento & Códigos Proceda:
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mapeamento de 17 códigos Proceda (0=Em trânsito, 1=Entregue, 23=Extravio, 78=Avaria, etc.) alimentando a timeline e visualização de comprovantes.
            </p>
          </div>
        </div>
      </div>

      {/* Seção Danúbio */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Zap className="h-5 w-5 text-sky-400" /> 3. Integração Danúbio Transportes (Regra Própria)
        </h2>

        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 space-y-2">
          <p className="text-sky-400 font-bold">Fórmula de Cálculo Determinístico:</p>
          <p className="text-slate-200">frete_danubio = MAX(peso × R$ 0,70, valor_nfe × 1,5%, R$ 100,00)</p>
          
          <div className="border-t border-slate-800 pt-2 text-slate-400 space-y-1">
            <p>• Exemplo 1 (200kg, NF R$5.000): MAX(140, 75, 100) = R$ 140,00</p>
            <p>• Exemplo 2 (80kg, NF R$10.000): MAX(56, 150, 100) = R$ 150,00</p>
            <p>• Exemplo 3 (50kg, NF R$2.000): MAX(35, 30, 100) = R$ 100,00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
