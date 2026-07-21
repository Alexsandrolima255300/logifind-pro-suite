# LogiFinder TMS — Plano de Construção

O escopo enviado equivale a um TMS empresarial completo (dezenas de módulos, IA, portal do cliente, motor de cotação multi-transportadora, importação Excel, e-mails automáticos, multiempresa). Não é viável entregar tudo em uma única rodada com qualidade. Proponho construir em fases navegáveis, começando pelo núcleo já existente (Dashboard + Cotação) e expandindo o restante do menu com telas funcionais usando dados simulados.

## Fase 1 — Núcleo navegável (esta rodada)

Objetivo: transformar o app atual em uma plataforma navegável, com todas as rotas do menu funcionando e o motor de cotação inteligente já operante com dados fictícios.

### Estrutura de rotas (TanStack Start)
```
/                     Dashboard
/cotacao              Nova Cotação (motor inteligente + resultado)
/pedidos              Lista de Pedidos + detalhe /pedidos/$id (timeline)
/rastreamento         Rastreamento por código
/transportadoras      Cadastro + cobertura por estado
/cidades              Cidades atendidas
/clientes             Cadastro de clientes (CNPJ/CEP mock)
/historico            Histórico de cotações
/relatorios           Gráficos (mensal, transportadora, estado)
/notificacoes         Central de notificações
/usuarios             Usuários e permissões
/configuracoes        Preferências, regras comerciais
/perfil               Meu perfil
/vendedor             Painel do Vendedor
/portal               Portal do Cliente (visão externa)
/login                Tela de login premium
```

### Motor de Cotação (Freight Engine, client-side com dados mock)
- Entradas: origem/destino (CEP, cidade, UF), peso, dimensões (A×L×C), volumes, valor NF, tipo carga.
- Cálculo automático: volume m³, peso cubado (fator configurável por transportadora, ex.: 300 kg/m³), peso tarifável = max(real, cubado).
- Cobertura: tabela `transportadora_cobertura` mock (Rodonaves, Braspress, Danúbio, Alfa, União Express, Jadlog) filtra por UF antes do cálculo.
- Regras Danúbio implementadas exatamente como especificado (≥100kg × 0,70; <100kg + NF≤6000 → R$100; <100kg + NF>6000 → 1,5% NF; mínimo R$100).
- Tabela UDI-Campanha mock (faixas de peso 5/10/20/30/50/70/100 + kg excedente + Ad Valorem 0,25%).
- Ranking: 🏆 Mais Barata, ⚡ Mais Rápida, 💰 Melhor Custo-Benefício.
- Card por transportadora com valor, prazo, método de cálculo, botão Selecionar.

### Painéis e telas
- Dashboard atual mantido, com indicadores adicionais de pedidos (dia/separação/trânsito/entregues/atrasados).
- Pedidos: lista + detalhe com timeline (12 status), dados de cliente/produto/motorista/veículo.
- Painel do Vendedor: rota dedicada com KPIs próprios, lista filtrada, timeline, ocorrências.
- Portal do Cliente: visualização somente-leitura de pedido + timeline estilo Mercado Livre.
- LogiFinder AI: botão flutuante global com painel lateral e respostas baseadas nos dados mock (sem IA real nesta fase).

### Design
- Mantém o dark premium atual (verde #22C55E, grafite, glassmorphism, animações).
- Sidebar recolhível existente é estendida com os novos itens.

## Fases seguintes (não nesta rodada, requerem confirmação depois)

- **Fase 2 — Backend real**: habilitar Lovable Cloud, criar tabelas (empresas, usuários, clientes, transportadoras, cidades, cobertura, cotações, itens_cotacao, pedidos, timeline, regras_negocio, histórico, configurações), RLS multi-tenant, auth (login/registro).
- **Fase 3 — Importação Excel** de cobertura e cidades por transportadora + editor administrativo de regras e tabelas tarifárias.
- **Fase 4 — E-mails automáticos** (Resend) em cada mudança de status, com templates HTML.
- **Fase 5 — LogiFinder AI real** via Lovable AI Gateway com contexto do banco.
- **Fase 6 — Integrações API** (Rodonaves, Braspress, Jadlog, Correios, Alfa, Jamef, União Express) via server functions.
- **Fase 7 — Relatórios PDF/Excel** e rastreamento com mapa real.

## Detalhes técnicos (Fase 1)

- Stack atual: TanStack Start + React 19 + Tailwind v4 + shadcn. Sem backend nesta fase (dados mock em `src/lib/mock/`).
- Motor: `src/lib/freight-engine.ts` puro, testável, parametrizável por transportadora.
- Cobertura: `src/lib/mock/coverage.ts` com todos os 27 estados × transportadoras.
- Componentes reutilizáveis: `PageHeader`, `DataTable`, `StatusBadge`, `Timeline`, `KpiCard`, `EmptyState`.
- Cada rota tem `head()` com título/descrição próprios.
- LogiFinder AI: `src/components/ai-fab.tsx` — botão flutuante + Sheet lateral com respostas heurísticas sobre os dados mock.

## O que fica fora desta rodada

Login funcional real, banco de dados, e-mails, IA generativa, importação Excel, PDFs, integrações de API oficiais das transportadoras e mapa real de rastreamento — tudo isso entra nas fases 2–7.

Confirme para eu iniciar a Fase 1.