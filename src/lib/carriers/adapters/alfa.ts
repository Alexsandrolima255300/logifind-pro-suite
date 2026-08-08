import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

export const alfaAdapter: CarrierAdapter = {
  id: "alfa",
  nome: "Alfa Transportes",

  isConfigured() {
    return false; // Integração oficial via API pendente
  },

  async checkCoverage() {
    return { atende: false, mensagem: "Alfa Transportes sem cobertura cadastrada para esta rota" };
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "unavailable",
      atende: false,
      consultadoEm,
      tipoCalculo: "API Oficial",
      mensagem: "Alfa Transportes: ✕ Não atende este destino",
    };
  },
};
