CREATE TABLE public.carrier_coverage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  carrier_id text NOT NULL,
  municipio_origem text NOT NULL DEFAULT '',
  codigo_destino text NOT NULL DEFAULT '',
  municipio_destino text NOT NULL,
  municipio_destino_norm text NOT NULL,
  uf text NOT NULL,
  km numeric,
  prazo_pj integer,
  prazo_pf integer,
  frequencia text,
  dias_semana text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrier_coverage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.carrier_coverage TO anon;
GRANT ALL ON public.carrier_coverage TO service_role;

ALTER TABLE public.carrier_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coverage is readable by everyone"
  ON public.carrier_coverage FOR SELECT USING (true);
CREATE POLICY "Coverage can be inserted by app users"
  ON public.carrier_coverage FOR INSERT WITH CHECK (true);
CREATE POLICY "Coverage can be updated by app users"
  ON public.carrier_coverage FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Coverage can be deleted by app users"
  ON public.carrier_coverage FOR DELETE USING (true);

CREATE UNIQUE INDEX carrier_coverage_unique_row
  ON public.carrier_coverage (carrier_id, municipio_origem, codigo_destino, municipio_destino_norm, uf);

CREATE INDEX carrier_coverage_lookup
  ON public.carrier_coverage (carrier_id, municipio_destino_norm, uf);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_carrier_coverage_updated_at
  BEFORE UPDATE ON public.carrier_coverage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();