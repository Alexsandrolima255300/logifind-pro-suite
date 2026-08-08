import type { CarrierAdapter, CarrierQuoteResult, FreightRequest } from "./types";
import { validateFreightRequest, calculateCubagem } from "./types";
import { rodonavesAdapter } from "./adapters/rodonaves";
import { danubioAdapter } from "./adapters/danubio";
import { braspressAdapter } from "./adapters/braspress";
import { alfaAdapter } from "./adapters/alfa";
import { supabase } from "@/lib/supabaseClient";

export * from "./types";
export * from "./adapters/rodonaves";
export * from "./adapters/danubio";
export * from "./adapters/braspress";
export * from "./adapters/alfa";
export * from "./importer";

export const CARRIER_ADAPTERS: Record<string, CarrierAdapter> = {
  rodonaves: rodonavesAdapter,
  danubio: danubioAdapter,
  braspress: braspressAdapter,
  alfa: alfaAdapter,
};

export async function runQuoteEngine(
  req: FreightRequest,
  selectedCarriers: string[] = ["rodonaves", "danubio", "braspress", "alfa"]
): Promise<{ quotes: CarrierQuoteResult[]; cotacaoId?: string; errors: string[] }> {
  // 1. Validar request
  const errors = validateFreightRequest(req);
  if (errors.length > 0) {
    return { quotes: [], errors };
  }

  // 2. Calcular cubagem visual/operacional
  const cubagem = req.cubagemM3 || calculateCubagem(req.itensVolume, req.alturaCm, req.larguraCm, req.comprimentoCm, req.volumes);

  // 3. Executar consultas em paralelo para as transportadoras selecionadas
  const targetAdapters = selectedCarriers.map((id) => CARRIER_ADAPTERS[id]).filter(Boolean);
  const promises = targetAdapters.map((adapter) => adapter.quote({ ...req, cubagemM3: cubagem }));
  const rawResults = await Promise.all(promises);

  // 4. Ordenar resultados: Atende e com valor primeiro (do mais barato ao mais caro), depois indisponíveis/erros
  const quotes = rawResults.sort((a, b) => {
    if (a.atende && a.status === "success" && b.atende && b.status === "success") {
      return (a.valor || 0) - (b.valor || 0);
    }
    if (a.atende && a.status === "success") return -1;
    if (b.atende && b.status === "success") return 1;
    return 0;
  });

  // 5. Persistir cotação no Supabase (silencioso em caso de erro local)
  let cotacaoId: string | undefined = undefined;
  try {
    const { data: cotacaoData } = await supabase
      .from("cotacoes")
      .insert({
        origin_zip: req.cepOrigem,
        origin_city: req.cidadeOrigem || "",
        origin_state: req.ufOrigem || "",
        destination_zip: req.cepDestino,
        destination_city: req.cidadeDestino || "",
        destination_state: req.ufDestino || "",
        invoice_value: req.valorNF,
        total_weight: req.pesoKg,
        total_packages: req.volumes,
        cubagem: cubagem,
      })
      .select("id")
      .single();

    if (cotacaoData && cotacaoData.id) {
      cotacaoId = cotacaoData.id;

      const itemsToInsert = quotes.map((q) => ({
        cotacao_id: cotacaoId,
        transportadora_id:
          q.carrierId === "rodonaves"
            ? "a1b2c3d4-e5f6-7890-abcd-111111111111"
            : q.carrierId === "danubio"
            ? "a1b2c3d4-e5f6-7890-abcd-222222222222"
            : q.carrierId === "braspress"
            ? "a1b2c3d4-e5f6-7890-abcd-333333333333"
            : "a1b2c3d4-e5f6-7890-abcd-444444444444",
        atende: q.atende,
        freight_value: q.valor || null,
        discount: q.desconto || 0,
        delivery_days: q.prazoDias || null,
        status: q.status,
        protocol: q.protocolo || null,
        cte: q.cte || null,
        calculation_type: q.tipoCalculo || "N/A",
        api_response: q.apiResponse || null,
      }));

      await supabase.from("cotacao_transportadoras").insert(itemsToInsert);
    }
  } catch {
    // Ignorar falha de banco local para permitir cotação visual no client
  }

  return { quotes, cotacaoId, errors: [] };
}
