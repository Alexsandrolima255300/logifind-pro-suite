import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";
import { findCoverage } from "../coverage";

// Adapter Rodonaves — cobertura validada na base de atendimento importada
// (tabela carrier_coverage). O valor do frete depende da integração tarifária
// oficial; enquanto ela não existir, o sistema NUNCA inventa valores.

const env = (k: string): string | undefined =>
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.[k]) ||
  undefined;

export const rodonavesAdapter: CarrierAdapter = {
  id: "rodonaves",
  nome: "Rodonaves (RTE)",

  isConfigured() {
    return Boolean(env("VITE_RODONAVES_CLIENT_ID") && env("VITE_RODONAVES_CLIENT_SECRET"));
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();

    let cobertura: Awaited<ReturnType<typeof findCoverage>> = null;
    try {
      cobertura = await findCoverage(this.id, req.cidadeDestino, req.ufDestino);
    } catch (e) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "error",
        consultadoEm,
        mensagem: e instanceof Error ? e.message : "Falha ao consultar a base de atendimento.",
      };
    }

    if (!cobertura) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        consultadoEm,
        mensagem: "A Rodonaves não atende esta cidade.",
      };
    }

    const detalhes = [
      `Cidade atendida: ${cobertura.municipio_destino}/${cobertura.uf}`,
      cobertura.municipio_origem ? `Origem: ${cobertura.municipio_origem}` : "",
      cobertura.codigo_destino ? `Código do destino: ${cobertura.codigo_destino}` : "",
      cobertura.km !== null ? `Quilometragem: ${cobertura.km} km` : "",
      cobertura.prazo_pj !== null ? `Prazo PJ: ${cobertura.prazo_pj} dia(s)` : "",
      cobertura.prazo_pf !== null ? `Prazo PF: ${cobertura.prazo_pf} dia(s)` : "",
      cobertura.frequencia ? `Frequência: ${cobertura.frequencia}` : "",
      cobertura.dias_semana ? `Dias: ${cobertura.dias_semana}` : "",
    ].filter(Boolean);

    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "unavailable",
      consultadoEm,
      prazoDias: cobertura.prazo_pj ?? cobertura.prazo_pf ?? undefined,
      mensagem: "Cidade atendida — valor pendente da integração tarifária Rodonaves.",
      detalhes,
    };
  },
};
