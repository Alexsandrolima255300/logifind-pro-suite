import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

// Adapter Braspress — pronto para integração oficial.
// Credenciais esperadas:
//   VITE_BRASPRESS_USER
//   VITE_BRASPRESS_TOKEN
//   VITE_BRASPRESS_CNPJ_PAGADOR

const env = (k: string): string | undefined =>
  (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string> }).env?.[k]) ||
  undefined;

export const braspressAdapter: CarrierAdapter = {
  id: "braspress",
  nome: "Braspress",

  isConfigured() {
    return Boolean(env("VITE_BRASPRESS_USER") && env("VITE_BRASPRESS_TOKEN"));
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    if (!this.isConfigured()) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        consultadoEm,
        mensagem: "Integração não configurada — cadastre credenciais Braspress",
      };
    }

    try {
      // TODO: chamada real à API Braspress
      // POST https://api.braspress.com/v1/cotacao/calcular/json
      // Basic Auth: base64(user:token)
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
