// Camada de integração de cotações — contrato único.
// Cada transportadora implementa `CarrierAdapter`. O sistema NUNCA gera
// valores fictícios: quando a API não está configurada, o adapter devolve
// status "unavailable" para que a UI mostre "Indisponível".

export type FreightRequest = {
  cepOrigem: string;
  cepDestino: string;
  pesoKg: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  valorNF: number;
  volumes: number;
  cnpjRemetente?: string;
  cnpjDestinatario?: string;
};

export type QuoteStatus = "success" | "error" | "unavailable";

export type CarrierQuoteResult = {
  carrierId: string;
  carrierNome: string;
  status: QuoteStatus;
  valor?: number;
  prazoDias?: number;
  consultadoEm: string; // ISO datetime
  mensagem?: string;    // erro ou motivo de indisponibilidade
};

export interface CarrierAdapter {
  id: string;
  nome: string;
  isConfigured(): boolean;
  quote(req: FreightRequest): Promise<CarrierQuoteResult>;
}

export function validateFreightRequest(req: Partial<FreightRequest>): string[] {
  const errors: string[] = [];
  const cep = (v?: string) => (v ?? "").replace(/\D/g, "").length === 8;
  if (!cep(req.cepOrigem)) errors.push("CEP de origem inválido");
  if (!cep(req.cepDestino)) errors.push("CEP de destino inválido");
  if (!req.pesoKg || req.pesoKg <= 0) errors.push("Peso obrigatório");
  if (!req.alturaCm || req.alturaCm <= 0) errors.push("Altura obrigatória");
  if (!req.larguraCm || req.larguraCm <= 0) errors.push("Largura obrigatória");
  if (!req.comprimentoCm || req.comprimentoCm <= 0) errors.push("Comprimento obrigatório");
  if (!req.valorNF || req.valorNF <= 0) errors.push("Valor da NF-e obrigatório");
  if (!req.volumes || req.volumes <= 0) errors.push("Quantidade de volumes obrigatória");
  return errors;
}
