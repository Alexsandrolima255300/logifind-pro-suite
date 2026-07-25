import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";

// Adapter Danúbio — cálculo interno determinístico.
// Regra:
//   - Peso ≥ 100kg: max(peso × R$0,70, 1,5% NF, R$100)
//   - Peso < 100kg e NF < R$6.000: R$100 (mínimo)
//   - Peso < 100kg e NF ≥ R$6.000: max(1,5% NF, R$100)
// Estrutura pronta para futura integração com API oficial: basta substituir
// o corpo de quote() por fetch(...) mantendo o mesmo retorno.

const VALOR_POR_KG = 0.70;
const PERCENTUAL_NF = 0.015;
const FRETE_MINIMO = 100;
const PESO_LIMITE = 100;
const NF_LIMITE = 6000;
const PRAZO_PADRAO = 3;

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const danubioAdapter: CarrierAdapter = {
  id: "danubio",
  nome: "Danúbio",

  isConfigured() {
    return true;
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    const peso = req.pesoKg;
    const nf = req.valorNF;

    const fretePercentual = nf * PERCENTUAL_NF;
    let valor: number;
    let regra: string;

    if (peso >= PESO_LIMITE) {
      const fretePeso = peso * VALOR_POR_KG;
      valor = Math.max(fretePeso, fretePercentual, FRETE_MINIMO);
      regra = `Maior valor entre peso (${BRL(fretePeso)}) e percentual (${BRL(fretePercentual)})`;
    } else if (nf < NF_LIMITE) {
      valor = FRETE_MINIMO;
      regra = `Frete mínimo ${BRL(FRETE_MINIMO)} (peso <100kg e NF <${BRL(NF_LIMITE)})`;
    } else {
      valor = Math.max(fretePercentual, FRETE_MINIMO);
      regra = `1,5% da NF-e (${BRL(fretePercentual)}) vs mínimo ${BRL(FRETE_MINIMO)}`;
    }

    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "success",
      valor: Math.round(valor * 100) / 100,
      prazoDias: PRAZO_PADRAO,
      consultadoEm,
      mensagem: regra,
    };
  },
};
