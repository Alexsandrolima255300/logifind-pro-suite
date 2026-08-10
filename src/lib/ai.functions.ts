import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export type AiChatMessage = { role: "user" | "assistant"; content: string };

type ChatInput = { messages: AiChatMessage[]; contexto?: string };

const SYSTEM = `Você é a IA principal do LogiFinder, um TMS brasileiro de cotação e gestão de fretes.
Você é especialista em logística, Excel, tabelas de transportadoras, cidades, prazos e matemática de frete.
Você deve responder em português do Brasil, de forma prática e confiável.

REGRAS IMPORTANTES:
- Nunca invente dados. Se um dado não estiver no contexto, diga exatamente o que falta.
- Para cálculos, faça a conta explicitamente e mostre fórmula, substituição e resultado em R$.
- Considere frete peso, frete valor, ad valorem, GRIS, cubagem, peso taxado, frete mínimo, faixas e percentuais.
- Quando houver dados tabulares no contexto, use-os como fonte principal para somas, médias, contagens, máximos, mínimos, filtros, duplicidades, cidades e prazos.
- Você pode explicar Excel, logística, CIF, FOB, NF-e, CT-e, MDF-e, TMS, WMS, cubagem e negociação.
- Se o usuário pedir uma operação que alteraria dados, explique a ação e aguarde confirmação da interface; não finja ter gravado nada.
- Diferencie valor calculado de valor encontrado na tabela.
- Seja conciso por padrão, mas entregue todos os passos quando a pergunta exigir.
- Nunca diga que leu uma planilha inteira se o contexto trouxer apenas uma amostra ou estatísticas.`;

export const askLogiAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ChatInput) => data)
  .handler(async ({ data }) => {
    const { askModel } = await import("./ai.server");
    const historico = data.messages
      .slice(-16)
      .map((m) => `${m.role === "user" ? "Usuário" : "IA"}: ${m.content}`)
      .join("\n\n");
    const input = data.contexto ? `DADOS DISPONÍVEIS DO LOGIFINDER:\n${data.contexto}\n\n--- CONVERSA ---\n${historico}` : historico;
    try {
      return { ok: true as const, answer: await askModel(SYSTEM, input) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na IA." };
    }
  });

type MapInput = { headers: string[]; sample: Record<string, unknown>[] };

const CAMPOS = [
  "municipio_origem", "codigo_destino", "municipio_destino", "uf", "km",
  "prazo_pj", "prazo_pf", "frequencia", "dias_semana", "ativo",
] as const;

export const mapSheetColumnsAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: MapInput) => data)
  .handler(async ({ data }) => {
    const { askModel, extractJson } = await import("./ai.server");
    const instructions = `Você é um especialista em interpretar planilhas de transportadoras brasileiras.
Mapeie cada coluna para o campo correto do sistema.
Campos permitidos: ${CAMPOS.join(", ")}.
Reconheça abreviações, acentos, sinônimos, português e nomes comuns de logística.
Responda APENAS JSON: {"map":{"campo":"NOME EXATO DA COLUNA"},"resumo":"resumo curto","alertas":["..."],"confianca":0-100}.
Nunca invente nome de coluna. Use somente nomes presentes na lista recebida.`;
    const input = `Colunas: ${JSON.stringify(data.headers)}\nAmostra: ${JSON.stringify(data.sample.slice(0, 12))}`;
    try {
      const text = await askModel(instructions, input);
      const parsed = extractJson<{ map?: Record<string, string>; resumo?: string; alertas?: string[]; confianca?: number }>(text);
      if (!parsed?.map) return { ok: false as const, error: "A IA não conseguiu interpretar a planilha." };
      const map: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.map)) {
        if ((CAMPOS as readonly string[]).includes(k) && data.headers.includes(v)) map[k] = v;
      }
      return { ok: true as const, map, resumo: parsed.resumo ?? "", alertas: parsed.alertas ?? [], confianca: parsed.confianca ?? 0 };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na IA." };
    }
  });
