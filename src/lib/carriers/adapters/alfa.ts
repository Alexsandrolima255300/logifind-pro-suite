import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

// Adapter Alfa Transportes — pronto para integração oficial.
// Credenciais esperadas:
//   VITE_ALFA_API_KEY
//   VITE_ALFA_CNPJ_PAGADOR

const env = (k: string): string | undefined =>
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.[k]) ||
  undefined;

export const alfaAdapter: CarrierAdapter = {
  id: "alfa",
  nome: "Alfa Transportes",

  isConfigured() {
    return Boolean(env("VITE_ALFA_API_KEY"));
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    if (!this.isConfigured()) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        consultadoEm,
        mensagem: "Integração não configurada — cadastre credenciais Alfa",
      };
    }

    try {
      // TODO: chamada real à API Alfa Transportes
      throw new Error("Integração oficial pendente");
    } catch (e) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "error",
        consultadoEm,
        mensagem: e instanceof Error ? e.message : "Falha na consulta",
      };
    }
  },
};
