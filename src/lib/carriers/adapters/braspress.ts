import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

export const braspressAdapter: CarrierAdapter = {
  id: "braspress",
  nome: "Braspress",

  isConfigured() {
    return false; // Integração oficial via API pendente
  },

  async checkCoverage(cidade: string) {
    if (!cidade) return { atende: false };
    return { atende: true, mensagem: "Braspress atende principais polos comerciais" };
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "unavailable",
      atende: true,
      consultadoEm,
      tipoCalculo: "API Oficial",
      mensagem: "Integração não configurada — cadastre credenciais Braspress",
    };
  },
};
