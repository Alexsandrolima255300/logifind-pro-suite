import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

// Adapter Rodonaves — estrutura pronta para integração oficial.
// Credenciais esperadas (via variáveis de ambiente ou secret store):
//   VITE_RODONAVES_CLIENT_ID
//   VITE_RODONAVES_CLIENT_SECRET
// Enquanto ausentes, `isConfigured()` retorna false e o serviço reporta
// status "unavailable" — sem valores simulados.

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
    if (!this.isConfigured()) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        consultadoEm,
        mensagem: "Integração não configurada — cadastre credenciais Rodonaves",
      };
    }

    try {
      // TODO: chamada real à API oficial Rodonaves.
      // const token = await getRodonavesToken();
      // const res = await fetch("https://01wapi.rte.com.br/api/v1/simulate-quotation", {
      //   method: "POST",
      //   headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      //   body: JSON.stringify(mapRequest(req)),
      // });
      // ...
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
