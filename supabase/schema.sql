-- LogiFinder Database Schema for Rodonaves and Danúbio Integration

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Transportadoras Table
CREATE TABLE IF NOT EXISTS transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  nome_completo TEXT NOT NULL,
  codigo_interno TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Transportadoras
INSERT INTO transportadoras (id, nome, nome_completo, codigo_interno)
VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Rodonaves', 'RTE Rodonaves', 'RODONAVES'),
  ('a1b2c3d4-e5f6-7890-abcd-222222222222', 'Danubio', 'Danúbio Transportes', 'DANUBIO'),
  ('a1b2c3d4-e5f6-7890-abcd-333333333333', 'Braspress', 'Braspress Transportes Urgentes', 'BRASPRESS'),
  ('a1b2c3d4-e5f6-7890-abcd-444444444444', 'Alfa', 'Expresso Alfa', 'ALFA')
ON CONFLICT (codigo_interno) DO UPDATE SET 
  nome = EXCLUDED.nome,
  nome_completo = EXCLUDED.nome_completo;

-- 2. Transportadora Cidades (Coverage Table)
CREATE TABLE IF NOT EXISTS transportadora_cidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportadora_id UUID NOT NULL REFERENCES transportadoras(id) ON DELETE CASCADE,
  municipio_origem TEXT,
  codigo_destino TEXT,
  municipio_destino TEXT NOT NULL,
  uf TEXT NOT NULL,
  km_total NUMERIC,
  prazo_pj INTEGER,
  prazo_pf INTEGER,
  frequencia INTEGER,
  segunda BOOLEAN DEFAULT true,
  terca BOOLEAN DEFAULT true,
  quarta BOOLEAN DEFAULT true,
  quinta BOOLEAN DEFAULT true,
  sexta BOOLEAN DEFAULT true,
  sabado BOOLEAN DEFAULT false,
  domingo BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for Fast Coverage Lookup
CREATE INDEX IF NOT EXISTS idx_transportadora_cidades_busca 
  ON transportadora_cidades (transportadora_id, municipio_destino, uf);

CREATE INDEX IF NOT EXISTS idx_transportadora_cidades_origem 
  ON transportadora_cidades (transportadora_id, municipio_origem);

CREATE UNIQUE INDEX IF NOT EXISTS idx_transportadora_cidades_unique 
  ON transportadora_cidades (transportadora_id, COALESCE(municipio_origem, ''), COALESCE(codigo_destino, ''), municipio_destino, uf);

-- Seed Initial Cities for Danúbio
DO $$
DECLARE
  danubio_id UUID;
BEGIN
  SELECT id INTO danubio_id FROM transportadoras WHERE codigo_interno = 'DANUBIO';
  
  INSERT INTO transportadora_cidades (transportadora_id, municipio_destino, uf, prazo_pj, prazo_pf)
  VALUES
    (danubio_id, 'Campinas', 'SP', 1, 2),
    (danubio_id, 'Hortolândia', 'SP', 1, 2),
    (danubio_id, 'Indaiatuba', 'SP', 1, 2),
    (danubio_id, 'Sumaré', 'SP', 1, 2),
    (danubio_id, 'Vinhedo', 'SP', 1, 2),
    (danubio_id, 'Valinhos', 'SP', 1, 2),
    (danubio_id, 'Americana', 'SP', 1, 2),
    (danubio_id, 'Santa Bárbara d''Oeste', 'SP', 1, 2),
    (danubio_id, 'Sorocaba', 'SP', 2, 3),
    (danubio_id, 'Leme', 'SP', 2, 3),
    (danubio_id, 'Limeira', 'SP', 1, 2),
    (danubio_id, 'Piracicaba', 'SP', 1, 2),
    (danubio_id, 'São Carlos', 'SP', 2, 3),
    (danubio_id, 'Rio Claro', 'SP', 2, 3),
    (danubio_id, 'Porto Ferreira', 'SP', 2, 3),
    (danubio_id, 'Ribeirão Preto', 'SP', 2, 3),
    (danubio_id, 'Bragança Paulista', 'SP', 2, 3),
    (danubio_id, 'Araras', 'SP', 2, 3),
    (danubio_id, 'São Paulo', 'SP', 1, 2),
    (danubio_id, 'Barueri', 'SP', 1, 2),
    (danubio_id, 'Diadema', 'SP', 1, 2),
    (danubio_id, 'Guarulhos', 'SP', 1, 2),
    (danubio_id, 'Mauá', 'SP', 1, 2),
    (danubio_id, 'Osasco', 'SP', 1, 2),
    (danubio_id, 'São Caetano do Sul', 'SP', 1, 2),
    (danubio_id, 'Santo André', 'SP', 1, 2),
    (danubio_id, 'Embu das Artes', 'SP', 1, 2),
    (danubio_id, 'Itapecerica da Serra', 'SP', 1, 2)
  ON CONFLICT DO NOTHING;
END $$;

-- 3. Rodonaves Ocorrências (Proceda Codes Table)
CREATE TABLE IF NOT EXISTS rodonaves_ocorrencias (
  codigo INTEGER PRIMARY KEY,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL
);

INSERT INTO rodonaves_ocorrencias (codigo, descricao, categoria, status)
VALUES
  (0, 'Processo de transporte iniciado', 'Informação', 'Em trânsito'),
  (1, 'Entrega realizada normalmente', 'Sucesso', 'Entregue'),
  (2, 'Entrega fora da data programada', 'Alerta', 'Entregue com atraso'),
  (13, 'Transportadora não atende a cidade', 'Erro', 'Incompatível'),
  (20, 'Entrega prejudicada', 'Erro', 'Pendente'),
  (21, 'Estabelecimento fechado', 'Alerta', 'Reentrega necessária'),
  (23, 'Extravio', 'Crítico', 'Ocorrência grave'),
  (27, 'Roubo de carga', 'Crítico', 'Ocorrência grave'),
  (43, 'Feriado local/nacional', 'Informação', 'Retido'),
  (58, 'Quebra do veículo de transporte', 'Alerta', 'Em trânsito'),
  (60, 'Endereço de destino incorreto', 'Erro', 'Pendente'),
  (78, 'Avaria total da carga', 'Crítico', 'Ocorrência grave'),
  (79, 'Avaria parcial da carga', 'Crítico', 'Ocorrência parcial'),
  (80, 'Extravio total da carga', 'Crítico', 'Ocorrência grave'),
  (81, 'Extravio parcial da carga', 'Crítico', 'Ocorrência parcial'),
  (98, 'Chegada na unidade de destino', 'Informação', 'Em trânsito'),
  (99, 'Outras ocorrências não especificadas', 'Informação', 'Outros')
ON CONFLICT (codigo) DO UPDATE SET
  descricao = EXCLUDED.descricao,
  categoria = EXCLUDED.categoria,
  status = EXCLUDED.status;

-- 4. Cotações Table
CREATE TABLE IF NOT EXISTS cotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  origin_zip TEXT NOT NULL,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  destination_zip TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  invoice_value NUMERIC NOT NULL,
  total_weight NUMERIC NOT NULL,
  total_packages INTEGER NOT NULL,
  cubagem NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Cotação Transportadoras Table
CREATE TABLE IF NOT EXISTS cotacao_transportadoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotacao_id UUID NOT NULL REFERENCES cotacoes(id) ON DELETE CASCADE,
  transportadora_id UUID NOT NULL REFERENCES transportadoras(id),
  atende BOOLEAN NOT NULL DEFAULT true,
  freight_value NUMERIC,
  discount NUMERIC DEFAULT 0,
  delivery_days INTEGER,
  status TEXT NOT NULL, -- e.g. "success", "unavailable", "error"
  protocol TEXT,
  cte TEXT,
  calculation_type TEXT, -- e.g. "API Official", "Regra Própria (Peso/NF-e)", "Manual"
  api_response JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. API Logs Table (Sanitized Diagnostic Logging)
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  duration_ms INTEGER NOT NULL,
  error_message TEXT,
  cotacao_id UUID REFERENCES cotacoes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. API Config Table
CREATE TABLE IF NOT EXISTS api_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transportadora_codigo TEXT UNIQUE NOT NULL,
  config_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO api_config (transportadora_codigo, config_data)
VALUES
  ('DANUBIO', '{"valor_por_kg": 0.70, "percentual_nf": 0.015, "frete_minimo": 100.00}'::jsonb),
  ('RODONAVES', '{"auth_type": "DEV", "timeout_ms": 15000}'::jsonb)
ON CONFLICT (transportadora_codigo) DO NOTHING;
