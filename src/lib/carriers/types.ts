// Camada de integração de cotações e rastreamento — contrato único LogiFinder.

export type VolumeItem = {
  id?: string;
  tipo: string; // e.g. "Caixa P", "Caixa M", "Pallet", "Caixote", "Personalizado"
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  quantidade: number;
  pesoUnitarioKg?: number;
};

export type FreightRequest = {
  // Remetente
  cepOrigem: string;
  cidadeOrigem?: string;
  ufOrigem?: string;
  enderecoOrigem?: string;
  numeroOrigem?: string;
  bairroOrigem?: string;
  complementoOrigem?: string;
  cnpjRemetente?: string;

  // Destinatário
  cepDestino: string;
  cidadeDestino?: string;
  ufDestino?: string;
  enderecoDestino?: string;
  numeroDestino?: string;
  bairroDestino?: string;
  complementoDestino?: string;
  cpfCnpjDestinatario?: string;
  tipoCliente?: "PJ" | "PF";

  // Carga
  valorNF: number;
  pesoKg: number;
  volumes: number;
  alturaCm?: number;
  larguraCm?: number;
  comprimentoCm?: number;
  cubagemM3?: number;
  itensVolume?: VolumeItem[];

  // Contato
  nomeContato?: string;
  telefoneContato?: string;
  emailContato?: string;

  // Modo
  modo?: "simulation" | "quotation";
};

export type QuoteStatus = "success" | "error" | "unavailable";

export type CarrierQuoteResult = {
  carrierId: string;
  carrierNome: string;
  status: QuoteStatus;
  atende: boolean;
  valor?: number;
  desconto?: number;
  prazoDias?: number;
  protocolo?: string;
  cte?: string;
  tipoCalculo?: string; // e.g. "API Oficial Rodonaves", "Regra Própria (Peso/NF-e)", "Tabela Local"
  consultadoEm: string; // ISO datetime
  mensagem?: string;    // Detalhes, regras ou erros amigáveis
  apiResponse?: Record<string, unknown>;
};

export interface CarrierAdapter {
  id: string;
  nome: string;
  isConfigured(): boolean;
  checkCoverage?(cidade: string, uf: string): Promise<CoverageCheckResult>;
  quote(req: FreightRequest): Promise<CarrierQuoteResult>;
}

export type CoverageCheckResult = {
  atende: boolean;
  prazoPj?: number;
  prazoPf?: number;
  km?: number;
  frequencia?: number;
  diasOperacao?: string[];
  origemInformada?: string;
  mensagem?: string;
};

export type ProcedaCode = {
  codigo: number;
  descricao: string;
  categoria: "Informação" | "Sucesso" | "Alerta" | "Erro" | "Crítico";
  status: string;
};

export type TrackingEvent = {
  dataHora: string;
  codigo: number;
  descricao: string;
  local?: string;
  categoria?: string;
  status?: string;
};

export type TrackingResult = {
  carrierId: string;
  carrierNome: string;
  status: "found" | "not_found" | "error";
  protocolo?: string;
  numeroCte?: string;
  numeroNotaFiscal?: string;
  remetente?: string;
  destinatario?: string;
  unidadeDestino?: string;
  recebedor?: string;
  dataEmissao?: string;
  prazoEstimadoDias?: number;
  eventos: TrackingEvent[];
  comprovanteUrl?: string;
  mensagem?: string;
};

// Validations
export function validateFreightRequest(req: Partial<FreightRequest>): string[] {
  const errors: string[] = [];
  const cleanZip = (v?: string) => (v ?? "").replace(/\D/g, "");

  if (cleanZip(req.cepOrigem).length !== 8) errors.push("CEP de origem deve ter 8 dígitos");
  if (cleanZip(req.cepDestino).length !== 8) errors.push("CEP de destino deve ter 8 dígitos");
  if (!req.pesoKg || req.pesoKg <= 0) errors.push("Peso total da carga é obrigatório");
  if (!req.valorNF || req.valorNF <= 0) errors.push("Valor da NF-e é obrigatório");
  if (!req.volumes || req.volumes <= 0) errors.push("Quantidade de volumes é obrigatória");
  
  if (req.cnpjRemetente) {
    const cleanCnpj = req.cnpjRemetente.replace(/\D/g, "");
    if (cleanCnpj.length !== 14) errors.push("CNPJ do remetente deve conter 14 dígitos");
  }

  if (req.cpfCnpjDestinatario) {
    const cleanDoc = req.cpfCnpjDestinatario.replace(/\D/g, "");
    if (cleanDoc.length !== 11 && cleanDoc.length !== 14) {
      errors.push("CPF (11 dígitos) ou CNPJ (14 dígitos) do destinatário inválido");
    }
  }

  return errors;
}

// Utility to calculate volume cubage
export function calculateCubagem(items?: VolumeItem[], defaultHeight = 0, defaultWidth = 0, defaultLength = 0, defaultQty = 1): number {
  if (items && items.length > 0) {
    const totalCm3 = items.reduce((acc, item) => {
      const vol = (item.alturaCm || 0) * (item.larguraCm || 0) * (item.comprimentoCm || 0) * (item.quantidade || 1);
      return acc + vol;
    }, 0);
    return Math.round((totalCm3 / 1_000_000) * 1000) / 1000; // m³ rounded to 3 decimals
  }

  const vol = (defaultHeight || 0) * (defaultWidth || 0) * (defaultLength || 0) * (defaultQty || 1);
  return Math.round((vol / 1_000_000) * 1000) / 1000;
}
