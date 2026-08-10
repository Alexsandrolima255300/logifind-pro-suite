CREATE TABLE public.carrier_settings (
  carrier_id text PRIMARY KEY,
  nome text NOT NULL DEFAULT '',
  valor_por_kg numeric NOT NULL DEFAULT 0,
  percentual_nf numeric NOT NULL DEFAULT 0,
  frete_minimo numeric NOT NULL DEFAULT 0,
  ad_valorem numeric NOT NULL DEFAULT 0,
  gris numeric NOT NULL DEFAULT 0,
  fator_cubagem numeric NOT NULL DEFAULT 300,
  prazo_padrao integer,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrier_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrier_settings TO anon;
GRANT ALL ON public.carrier_settings TO service_role;

ALTER TABLE public.carrier_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Carrier settings readable by everyone" ON public.carrier_settings FOR SELECT USING (true);
CREATE POLICY "Carrier settings insertable by app users" ON public.carrier_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Carrier settings updatable by app users" ON public.carrier_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Carrier settings deletable by app users" ON public.carrier_settings FOR DELETE USING (true);

CREATE TRIGGER update_carrier_settings_updated_at
BEFORE UPDATE ON public.carrier_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.carrier_settings (carrier_id, nome, valor_por_kg, percentual_nf, frete_minimo, ad_valorem, gris, fator_cubagem, prazo_padrao)
VALUES
  ('rodonaves', 'Rodonaves (RTE)', 0.85, 1.5, 120, 0.30, 0.20, 300, 3),
  ('braspress', 'Braspress', 0.92, 1.5, 130, 0.30, 0.20, 300, 3),
  ('alfa', 'Alfa Transportes', 0.78, 1.5, 110, 0.25, 0.15, 300, 4),
  ('danubio', 'Danúbio Transportes', 0.70, 1.5, 100, 0.30, 0.20, 300, 3);