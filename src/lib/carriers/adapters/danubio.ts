import type { CarrierAdapter, CarrierQuoteResult, CoverageCheckResult, FreightRequest } from "../types";
import { supabase } from "@/lib/supabaseClient";

// Adapter Danúbio — cálculo determinístico e regras próprias.
// FÓRMULA OFICIAL LOGIFINDER:
//   frete_peso = peso * 0,70
//   frete_percentual = valor_nf * 0,015
//   frete_danubio = MAX(peso * 0.70, valor_nf * 0.015, 100)
//
// TESTES OBRIGATÓRIOS:
//   200kg, R$5.000 -> R$140 (peso)
//   80kg, R$10.000 -> R$150 (percentual NF-e)
//   50kg, R$2.000 -> R$100 (frete mínimo)

export const DANUBIO_CIDADES_INICIAIS = [
  "campinas",
  "hortolândia",
  "indaiatuba",
  "sumaré",
  "vinhedo",
  "valinhos",
  "americana",
  "santa bárbara d'oeste",
  "sorocaba",
  "leme",
  "limeira",
  "piracicaba",
  "são carlos",
  "rio claro",
  "porto ferreira",
  "ribeirão preto",
  "bragança paulista",
  "araras",
  "são paulo",
  "barueri",
  "diadema",
  "guarulhos",
  "mauá",
  "osasco",
  "são caetano do sul",
  "santo andré",
  "embu das artes",
  "itapecerica da serra",
];

export function calculateDanubioFreight(pesoKg: number, valorNF: number): {
  valor: number;
  fretePeso: number;
  fretePercentual: number;
  minimo: number;
  regra: string;
} {
  const VALOR_POR_KG = 0.70;
  const PERCENTUAL_NF = 0.015;
  const FRETE_MINIMO = 100.0;

  const fretePeso = Math.round(pesoKg * VALOR_POR_KG * 100) / 100;
  const fretePercentual = Math.round(valorNF * PERCENTUAL_NF * 100) / 100;
  const valor = Math.max(fretePeso, fretePercentual, FRETE_MINIMO);

  const BRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  let regra = "";
  if (valor === fretePeso) {
    regra = `Calculado pelo peso (${pesoKg}kg × R$ 0,70 = ${BRL(fretePeso)})`;
  } else if (valor === fretePercentual) {
    regra = `Calculado pelo percentual da NF-e (${BRL(valorNF)} × 1,5% = ${BRL(fretePercentual)})`;
  } else {
    regra = `Aplicado valor do frete mínimo (${BRL(FRETE_MINIMO)})`;
  }

  return { valor, fretePeso, fretePercentual, minimo: FRETE_MINIMO, regra };
}

export const danubioAdapter: CarrierAdapter = {
  id: "danubio",
  nome: "Danúbio",

  isConfigured() {
    return true; // Cálculo local por regra própria cadastrada
  },

  async checkCoverage(cidade: string, uf?: string): Promise<CoverageCheckResult> {
    const nomeNorm = (cidade || "").toLowerCase().trim();
    if (!nomeNorm) return { atende: false, mensagem: "Cidade de destino não informada" };

    // 1. Tenta verificar via Supabase database
    try {
      const { data, error } = await supabase
        .from("transportadora_cidades")
        .select("prazo_pj, prazo_pf, km_total, frequencia, segunda, terca, quarta, quinta, sexta, sabado, domingo")
        .eq("municipio_destino", cidade)
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0];
        const dias: string[] = [];
        if (row.segunda) dias.push("segunda");
        if (row.terca) dias.push("terca");
        if (row.quarta) dias.push("quarta");
        if (row.quinta) dias.push("quinta");
        if (row.sexta) dias.push("sexta");
        if (row.sabado) dias.push("sabado");
        if (row.domingo) dias.push("domingo");

        return {
          atende: true,
          prazoPj: row.prazo_pj || 2,
          prazoPf: row.prazo_pf || 3,
          km: row.km_total || undefined,
          frequencia: row.frequencia || undefined,
          diasOperacao: dias,
          mensagem: "Destino atendido pela malha Danúbio (base de dados)",
        };
      }
    } catch {
      // Fallback para lista em memória
    }

    // 2. Fallback para lista cadastrada inicialmente
    const covered = DANUBIO_CIDADES_INICIAIS.some((c) => c === nomeNorm || nomeNorm.includes(c));
    if (covered) {
      return {
        atende: true,
        prazoPj: 2,
        prazoPf: 3,
        diasOperacao: ["segunda", "terca", "quarta", "quinta", "sexta"],
        mensagem: "Destino atendido pela malha Danúbio (lista informada)",
      };
    }

    return {
      atende: false,
      mensagem: `A transportadora Danúbio não possui cobertura cadastrada para ${cidade}${uf ? "/" + uf : ""}`,
    };
  },

  async quote(req: FreightRequest): Promise<CarrierQuoteResult> {
    const consultadoEm = new Date().toISOString();
    const cidadeDestino = req.cidadeDestino || "";
    const ufDestino = req.ufDestino || "";

    // 1. Validar cobertura antes de calcular
    const coverage = await this.checkCoverage(cidadeDestino, ufDestino);
    if (!coverage.atende) {
      return {
        carrierId: this.id,
        carrierNome: this.nome,
        status: "unavailable",
        atende: false,
        consultadoEm,
        tipoCalculo: "Regra Própria (Peso/NF-e)",
        mensagem: `Danúbio: ✕ Destino não atendido (${cidadeDestino || "Cidade de destino"}${ufDestino ? "/" + ufDestino : ""})`,
      };
    }

    // 2. Executar cálculo de frete oficial Danúbio
    const calc = calculateDanubioFreight(req.pesoKg, req.valorNF);
    const prazoDias = req.tipoCliente === "PF" ? (coverage.prazoPf || 3) : (coverage.prazoPj || 2);

    return {
      carrierId: this.id,
      carrierNome: this.nome,
      status: "success",
      atende: true,
      valor: calc.valor,
      desconto: 0,
      prazoDias,
      protocolo: `DAN-${Date.now().toString().slice(-6)}`,
      tipoCalculo: "Regra Própria (Peso/NF-e)",
      consultadoEm,
      mensagem: `${calc.regra}. Prazo estimado: ${prazoDias} dias úteis.`,
      apiResponse: {
        fretePeso: calc.fretePeso,
        fretePercentual: calc.fretePercentual,
        minimo: calc.minimo,
        cidade: cidadeDestino,
        uf: ufDestino,
      },
    };
  },
};
