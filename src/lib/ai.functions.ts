import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

export type AiChatMessage = { role: "user" | "assistant"; content: string };
type AuthenticatedInput = { accessToken?: string };
type ChatInput = AuthenticatedInput & { messages: AiChatMessage[]; contexto?: string };
type MapInput = AuthenticatedInput & { headers: string[]; sample: Record<string, unknown>[] };

const SYSTEM = `Você é a IA principal do LogiFinder, um TMS brasileiro de cotação e gestão de fretes.
Você é especialista em logística, Excel, tabelas de transportadoras, cidades, prazos e matemática de frete.
Responda em português do Brasil, de forma prática e confiável.

REGRAS:
- Nunca invente dados. Se um dado não estiver no contexto, diga exatamente o que falta.
- Para cálculos, mostre fórmula, substituição e resultado.
- Considere frete peso, frete valor, ad valorem, GRIS, cubagem, peso taxado, frete mínimo, faixas e percentuais.
- Use dados tabulares como fonte principal para somas, médias, contagens, máximos, mínimos, filtros, duplicidades, cidades e prazos.
- Explique Excel, logística, CIF, FOB, NF-e, CT-e, MDF-e, TMS, WMS, cubagem e negociação.
- Diferencie valor calculado de valor encontrado na tabela.
- Nunca diga que leu uma planilha inteira se o contexto trouxer apenas uma amostra ou estatísticas.`;

async function validateAccessToken(accessToken?: string): Promise<void> {
  if (!accessToken) throw new Error("Sua sessão não foi identificada. Faça login novamente e tente outra vez.");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Supabase não configurado no servidor.");
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Sua sessão expirou. Faça login novamente e tente outra vez.");
}

export const askLogiAI = createServerFn({ method: "POST" })
  .inputValidator((data: ChatInput) => data)
  .handler(async ({ data }) => {
    try {
      await validateAccessToken(data.accessToken);
      const { askModel } = await import("./ai.server");
      const historico = data.messages.slice(-16).map((m) => `${m.role === "user" ? "Usuário" : "IA"}: ${m.content}`).join("\n\n");
      const input = data.contexto ? `DADOS DISPONÍVEIS DO LOGIFINDER:\n${data.contexto}\n\n--- CONVERSA ---\n${historico}` : historico;
      return { ok: true as const, answer: await askModel(SYSTEM, input) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na IA." };
    }
  });

const CAMPOS = ["municipio_origem", "codigo_destino", "municipio_destino", "uf", "km", "prazo_pj", "prazo_pf", "frequencia", "dias_semana", "ativo"] as const;

export const mapSheetColumnsAI = createServerFn({ method: "POST" })
  .inputValidator((data: MapInput) => data)
  .handler(async ({ data }) => {
    try {
      await validateAccessToken(data.accessToken);
      const { askModel, extractJson } = await import("./ai.server");
      const instructions = `Você é especialista em planilhas de transportadoras brasileiras. Mapeie cada coluna para o campo correto. Campos permitidos: ${CAMPOS.join(", ")}. Reconheça abreviações, acentos, sinônimos e termos de logística. Responda APENAS JSON: {"map":{"campo":"NOME EXATO DA COLUNA"},"resumo":"resumo curto","alertas":["..."],"confianca":0-100}. Nunca invente coluna.`;
      const input = `Colunas: ${JSON.stringify(data.headers)}\nAmostra: ${JSON.stringify(data.sample.slice(0, 12))}`;
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
