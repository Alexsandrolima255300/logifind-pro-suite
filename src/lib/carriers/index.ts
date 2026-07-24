import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "./types";
import { rodonavesAdapter } from "./adapters/rodonaves";
import { braspressAdapter } from "./adapters/braspress";
import { alfaAdapter } from "./adapters/alfa";

export const ADAPTERS: CarrierAdapter[] = [
  rodonavesAdapter,
  braspressAdapter,
  alfaAdapter,
];

// Executa todos os adapters em paralelo. Falha isolada de uma transportadora
// nunca derruba as demais — Promise.allSettled + fallback para status "error".
export async function quoteAll(req: FreightRequest): Promise<CarrierQuoteResult[]> {
  const settled = await Promise.allSettled(ADAPTERS.map((a) => a.quote(req)));
  const results = settled.map((s, i) => {
    if (s.status === "fulfilled") return s.value;
    const a = ADAPTERS[i];
    return {
      carrierId: a.id,
      carrierNome: a.nome,
      status: "error" as const,
      consultadoEm: new Date().toISOString(),
      mensagem: s.reason instanceof Error ? s.reason.message : "Falha inesperada",
    };
  });

  // Ordena: sucesso (por menor valor) primeiro, depois erro, depois indisponível.
  return results.sort((a, b) => {
    const rank = (s: QuoteStatus) => (s === "success" ? 0 : s === "error" ? 1 : 2);
    const ra = rank(a.status);
    const rb = rank(b.status);
    if (ra !== rb) return ra - rb;
    if (a.status === "success" && b.status === "success") {
      return (a.valor ?? Infinity) - (b.valor ?? Infinity);
    }
    return 0;
  });
}

type QuoteStatus = CarrierQuoteResult["status"];

export type { CarrierQuoteResult, FreightRequest } from "./types";
export { validateFreightRequest } from "./types";
