## Adicionar transportadora Danúbio

Criar um novo adapter `danubio` seguindo o mesmo padrão dos existentes (Rodonaves, Braspress, Alfa), mas com uma diferença chave: como a regra de cálculo Danúbio é conhecida e determinística (peso × R$0,70, 1,5% da NF-e, mínimo R$100), o adapter **retorna `status: "success"` calculando localmente** — não fica como "Indisponível". Isso mantém a mesma interface `CarrierAdapter`, então no futuro basta trocar o cálculo local por uma chamada HTTP real quando a API oficial existir.

### Arquivos

**Novo: `src/lib/carriers/adapters/danubio.ts`**
- Implementa `CarrierAdapter` com `id: "danubio"`, `nome: "Danúbio"`.
- `isConfigured()` → `true` (regra interna sempre disponível).
- `quote(req)` aplica a lógica:
  - `fretePeso`: se `pesoKg > 100` → `pesoKg × 0.70`; senão `0`.
  - `fretePercentual`: `valorNF × 0.015`.
  - Se `pesoKg >= 100`: `final = max(fretePeso, fretePercentual, 100)`, regra = "Maior valor entre peso e percentual".
  - Se `pesoKg < 100` e `valorNF < 6000`: `final = 100`, regra = "Mínimo R$100 (NF < R$6.000)".
  - Se `pesoKg < 100` e `valorNF >= 6000`: `final = max(fretePercentual, 100)`, regra = "1,5% da NF-e vs mínimo R$100".
  - `prazoDias`: 3 (padrão, ajustável no futuro).
  - Retorna `CarrierQuoteResult` com `valor`, `prazoDias`, e `mensagem` contendo a regra aplicada + breakdown (peso considerado, frete peso, frete percentual).

**Editar: `src/lib/carriers/index.ts`**
- Importar `danubioAdapter` e adicioná-lo ao array `ADAPTERS` — assim aparece automaticamente na tabela comparativa ordenada por menor valor junto com as outras três.

### Detalhes técnicos

- `CarrierQuoteResult.mensagem` é o único campo livre para texto — usaremos para expor o breakdown ("Peso: 500kg | Frete peso: R$350,00 | Frete %: R$150,00 | Regra: maior valor"). A UI atual (`quote-engine.tsx`) já exibe `mensagem` apenas em erros, então o breakdown ficará disponível no objeto para uso futuro sem alterar a UI.
- Nenhuma alteração em `types.ts`, `quote-engine.tsx` ou UI: o novo adapter herda todo o comportamento visual (ordenação por preço, botão Selecionar, badge de status).
- Estrutura pronta para migração futura à API oficial: basta substituir o corpo de `quote()` por `fetch(...)` mantendo o mesmo retorno.

### Fora de escopo desta etapa
- Persistência em "banco de dados de transportadoras" e importador de tabela de cidades atendidas (itens 7 e 8 do pedido) exigem Lovable Cloud + tela de administração. Sugiro tratar em uma próxima iteração dedicada — o adapter atual já deixa a Danúbio pronta para consumir essa tabela quando existir.
