// LogiFinder Freight Engine (Fase 1 — cálculo com dados mock).
import { CARRIERS, coverageFor, type Carrier, type CarrierId, type UF } from "./mock/data";

export type FreightInput = {
  origemUf: UF;
  destinoUf: UF;
  destinoCidade: string;
  pesoReal: number; // kg
  altura?: number; // cm
  largura?: number; // cm
  comprimento?: number; // cm
  volumes: number;
  valorNF: number;
};

export type FreightQuote = {
  carrier: Carrier;
  valor: number;
  prazo: number;
  pesoTarifavel: number;
  cubagem: number; // m³
  pesoCubado: number;
  metodo: string;
  detalhes: string[];
  adValorem: number;
  gris: number;
};

export function calcVolume(input: FreightInput): number {
  const a = (input.altura ?? 0) / 100;
  const l = (input.largura ?? 0) / 100;
  const c = (input.comprimento ?? 0) / 100;
  const q = Math.max(1, input.volumes || 1);
  return Math.max(0, a * l * c * q);
}

function danubioRule(input: FreightInput): { valor: number; metodo: string; detalhes: string[] } {
  const { pesoReal, valorNF } = input;
  const detalhes: string[] = [];
  let valor = 100;
  let metodo = "Mínimo Danúbio";
  if (pesoReal >= 100) {
    const v = pesoReal * 0.70;
    detalhes.push(`Peso ≥ 100kg × R$ 0,70 = ${brl(v)}`);
    if (v > valor) { valor = v; metodo = "Peso × R$ 0,70/kg"; }
  }
  if (pesoReal < 100 && valorNF <= 6000) {
    const v = 100;
    detalhes.push(`Peso <100kg e NF ≤ R$6.000 → R$100`);
    if (v > valor) { valor = v; metodo = "Taxa fixa <6k"; }
  }
  if (pesoReal < 100 && valorNF > 6000) {
    const v = valorNF * 0.015;
    detalhes.push(`1,5% da NF (${brl(valorNF)}) = ${brl(v)}`);
    if (v > valor) { valor = v; metodo = "1,5% NF-e"; }
  }
  if (valor < 100) valor = 100;
  return { valor, metodo, detalhes };
}

function genericRule(carrier: Carrier, input: FreightInput, pesoTarifavel: number) {
  const detalhes: string[] = [];
  const base = pesoTarifavel * carrier.valorPorKg;
  detalhes.push(`${pesoTarifavel.toFixed(1)}kg × ${brl(carrier.valorPorKg)}/kg = ${brl(base)}`);
  const adv = input.valorNF * (carrier.adValorem / 100);
  const gris = input.valorNF * (carrier.gris / 100);
  if (adv > 0) detalhes.push(`Ad Valorem (${carrier.adValorem}%): ${brl(adv)}`);
  if (gris > 0) detalhes.push(`GRIS (${carrier.gris}%): ${brl(gris)}`);
  let valor = base + adv + gris;
  if (valor < carrier.taxaMinima) {
    detalhes.push(`Mínimo: ${brl(carrier.taxaMinima)}`);
    valor = carrier.taxaMinima;
  }
  return { valor, metodo: "Tabela interna", detalhes, adv, gris };
}

export function quote(input: FreightInput): FreightQuote[] {
  const covered = new Set(coverageFor(input.destinoUf));
  const results: FreightQuote[] = [];
  const cubagem = calcVolume(input);

  for (const carrier of CARRIERS) {
    if (!covered.has(carrier.id)) continue;
    const pesoCubado = cubagem * carrier.fatorCubagem;
    const pesoTarifavel = Math.max(input.pesoReal, pesoCubado);

    let valor: number, metodo: string, detalhes: string[], adv = 0, gris = 0;
    if (carrier.id === "danubio") {
      const r = danubioRule(input);
      valor = r.valor; metodo = r.metodo; detalhes = r.detalhes;
    } else {
      const r = genericRule(carrier, input, pesoTarifavel);
      valor = r.valor; metodo = r.metodo; detalhes = r.detalhes; adv = r.adv; gris = r.gris;
    }

    // Interstate multiplier
    if (input.origemUf !== input.destinoUf) {
      valor *= 1.15;
      detalhes.push(`+15% interestadual`);
    }

    const prazo = carrier.prazoMedio + (input.origemUf === input.destinoUf ? 0 : 1);
    results.push({
      carrier, valor: round2(valor), prazo, pesoTarifavel: round2(pesoTarifavel),
      cubagem: round4(cubagem), pesoCubado: round2(pesoCubado),
      metodo, detalhes, adValorem: round2(adv), gris: round2(gris),
    });
  }
  results.sort((a, b) => a.valor - b.valor);
  return results;
}

export function rank(quotes: FreightQuote[]) {
  if (!quotes.length) return { cheapest: null, fastest: null, best: null };
  const cheapest = quotes.slice().sort((a, b) => a.valor - b.valor)[0];
  const fastest = quotes.slice().sort((a, b) => a.prazo - b.prazo)[0];
  const best = quotes.slice().sort((a, b) => a.valor * a.prazo - b.valor * b.prazo)[0];
  return { cheapest, fastest, best };
}

export function limiteAprovacao(valorNF: number) {
  return valorNF * 0.015;
}

export function isAprovado(q: FreightQuote, valorNF: number) {
  return q.valor <= limiteAprovacao(valorNF);
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const round4 = (n: number) => Math.round(n * 10000) / 10000;
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type { Carrier, CarrierId };
