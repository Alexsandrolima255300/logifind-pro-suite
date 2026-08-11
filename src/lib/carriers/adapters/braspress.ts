import type { CarrierAdapter, CarrierQuoteResult, FreightRequest, CoverageCheckResult } from "../types";
import { findCoverage } from "../coverage";

export const braspressAdapter: CarrierAdapter = {
  id: "braspress",
  nome: "Braspress",

  isConfigured() {
    return false; // Cotação oficial via API depende de credenciais/configuração.
  },

  async checkCoverage(cidade: string, uf?: string): Promise<CoverageCheckResult> {
    if (!cidade) return { atende: false, mensagem: "Cidade de destino não informada" };
    try {
      const row = await findCoverage("braspress", cidade, uf);
      if (!row) return { atende: false, mensagem: `Braspress não atende ${cidade}${uf ? "/" + uf.toUpperCase() : ""} conforme a base cadastrada.` };
      return {
        atende: true,
        prazoPj: row.prazo_pj ?? undefined,
        prazoPf: row.prazo_pf ?? undefined,
        frequencia: row.frequencia ?? undefined,
        mensagem: `Destino atendido pela malha Braspress${row.municipio_origem ? ` com origem ${row.municipio_origem}` : ""}.`,
      };
    } catch {
      return { atende: false, mensagem: "Não foi possível consultar a base de cobertura Braspress." };
    }
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    const coverage = await this.checkCoverage!(req.cidadeDestino || "", req.ufDestino || "");
    if (!coverage.atende) {
      return { carrierId: this.id, carrierNome: this.nome, status: "unavailable", atende: false, consultadoEm, tipoCalculo: "Base de cobertura Braspress", mensagem: coverage.mensagem || "Destino não atendido pela Braspress" };
    }
    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "unavailable",
      atende: true,
      prazoDias: coverage.prazoPj ?? coverage.prazoPf,
      consultadoEm,
      tipoCalculo: "Base de cobertura + API oficial",
      mensagem: "Destino confirmado na malha Braspress. Configure a API oficial para obter o valor do frete.",
    };
  },
};
