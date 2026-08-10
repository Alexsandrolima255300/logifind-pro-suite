import { supabase } from "@/integrations/supabase/client";

export type CarrierSettings = {
  carrier_id: string;
  nome: string;
  valor_por_kg: number;
  percentual_nf: number;
  frete_minimo: number;
  ad_valorem: number;
  gris: number;
  fator_cubagem: number;
  prazo_padrao: number | null;
  ativo: boolean;
  observacoes: string | null;
};

const DEFAULTS: Omit<CarrierSettings, "carrier_id" | "nome"> = {
  valor_por_kg: 0,
  percentual_nf: 1.5,
  frete_minimo: 0,
  ad_valorem: 0,
  gris: 0,
  fator_cubagem: 300,
  prazo_padrao: null,
  ativo: true,
  observacoes: null,
};

export async function getCarrierSettings(carrierId: string, nome = ""): Promise<CarrierSettings> {
  const { data, error } = await supabase
    .from("carrier_settings")
    .select("*")
    .eq("carrier_id", carrierId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (data) return data as CarrierSettings;
  return { carrier_id: carrierId, nome, ...DEFAULTS };
}

export async function saveCarrierSettings(s: CarrierSettings): Promise<void> {
  const { error } = await supabase
    .from("carrier_settings")
    .upsert(s, { onConflict: "carrier_id" });
  if (error) throw new Error(error.message);
}
