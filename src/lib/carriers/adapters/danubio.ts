import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "../types";
import { findDanubioCity } from "../danubio-cities";

// Danúbio Transportes — regra própria de cálculo.
//   Frete peso  = peso × R$ 0,70
//   Frete NF    = valor NF × 1,5%
//   Frete final = max(frete peso, frete NF, R$ 100,00)
// Só cota se a cidade de destino estiver na lista de atendimento.

export const DANUBIO_VALOR_KG = 0.70;
export const DANUBIO_PERCENTUAL_NF = 0.015;
export const DANUBIO_FRETE_MINIMO = 100;

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const round2 = (n: number) => Math.round(n * 100) / 100;

export type DanubioBreakdown = {
  fretePeso: number;
  freteNF: number;
  freteMinimo: number;
  freteFinal: number;
  regra: string;
};

// Função reutilizável — única fonte do cálculo Danúbio.
export function calcularFreteDanubio(pesoKg: number, valorNF: number): DanubioBreakdown {
  const fretePeso = round2(pesoKg * DANUBIO_VALOR_KG);
  const freteNF = round2(valorNF * DANUBIO_PERCENTUAL_NF);
  const freteFinal = round2(Math.max(fretePeso, freteNF, DANUBIO_FRETE_MINIMO));
  const regra =
    freteFinal === DANUBIO_FRETE_MINIMO && fretePeso < DANUBIO_FRETE_MINIMO && freteNF < DANUBIO_FRETE_MINIMO
      ? "Frete mínimo"
      : fretePeso >= freteNF
        ? "Frete por peso"
        : "1,5% da NF-e";
  return { fretePeso, freteNF, freteMinimo: DANUBIO_FRETE_MINIMO, freteFinal, regra };
}

export const danubioAdapter: CarrierAdapter = {
  id: "danubio",
  nome: "Danúbio Transportes",

  isConfigured() {
    return true;
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    const cidade = findDanubioCity(req.cidadeDestino, req.ufDestino);

    if (!cidade) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        consultadoEm,
        mensagem: "A Danúbio não atende esta cidade.",
      };
    }

    const b = calcularFreteDanubio(req.pesoKg, req.valorNF);

    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "success",
      valor: b.freteFinal,
      prazoDias: cidade.prazo,
      consultadoEm,
      mensagem: "Regra própria Danúbio",
      detalhes: [
        `Destino: ${cidade.cidade}/${cidade.estado}`,
        `Peso: ${req.pesoKg.toLocaleString("pt-BR")} kg · NF-e: ${BRL(req.valorNF)}`,
        `Frete peso: ${BRL(b.fretePeso)} · Frete NF-e (1,5%): ${BRL(b.freteNF)} · Mínimo: ${BRL(b.freteMinimo)}`,
        `Frete final: ${BRL(b.freteFinal)} (${b.regra}) · Regra própria Danúbio`,
      ],
    };
  },
};
