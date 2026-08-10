import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export type AiChatMessage = { role: "user" | "assistant"; content: string };

type ChatInput = {
  messages: AiChatMessage[];
  contexto?: string;
};

const SYSTEM = `Você é a IA do LogiFinder, um TMS brasileiro de cotação e gestão de fretes.
Você ajuda o usuário a entender planilhas de transportadoras, cidades atendidas, prazos,
tabelas de frete e cálculos (frete peso, frete valor, ad valorem, GRIS, cubagem, peso taxado,
percentual sobre a NF-e, frete mínimo).
Regras:
- Responda sempre em português do Brasil, de forma direta e prática.
- Quando houver cálculo, mostre a fórmula e o resultado passo a passo, com valores em R$.
- Se receber dados de uma planilha no contexto, use-os para responder (somas, médias, contagens, cidades, prazos).
- Se não souber, diga o que falta para responder. Responda também dúvidas gerais de logística.
- Seja conciso: no máximo ~250 palavras, salvo se pedirem detalhamento.`;

export const askLogiAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: ChatInput) => data)
  .handler(async ({ data }) => {
    const { askModel } = await import("./ai.server");
    const historico = data.messages
      .slice(-12)
      .map((m) => `${m.role === "user" ? "Usuário" : "IA"}: ${m.content}`)
      .join("\n\n");
    const input = data.contexto ? `Contexto disponível:\n${data.contexto}\n\n---\n\n${historico}` : historico;
    try {
      return { ok: true as const, answer: await askModel(SYSTEM, input) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na IA." };
    }
  });

type MapInput = { headers: string[]; sample: Record<string, unknown>[] };

const CAMPOS = [
  "municipio_origem",
  "codigo_destino",
  "municipio_destino",
  "uf",
  "km",
  "prazo_pj",
  "prazo_pf",
  "frequencia",
  "dias_semana",
  "ativo",
] as const;

export const mapSheetColumnsAI = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: MapInput) => data)
  .handler(async ({ data }) => {
    const { askModel, extractJson } = await import("./ai.server");
    const instructions = `Você mapeia colunas de planilhas de malha de atendimento de transportadoras.
Campos do sistema: ${CAMPOS.join(", ")}.
Responda APENAS um JSON no formato {"map":{"campo":"NOME EXATO DA COLUNA"},"resumo":"1-2 frases sobre a planilha"}.
Use somente nomes de coluna que existam na lista fornecida. Omita campos sem correspondência.`;
    const input = `Colunas: ${JSON.stringify(data.headers)}\n\nAmostra de linhas:\n${JSON.stringify(
      data.sample.slice(0, 8),
    )}`;
    try {
      const text = await askModel(instructions, input);
      const parsed = extractJson<{ map?: Record<string, string>; resumo?: string }>(text);
      if (!parsed?.map) return { ok: false as const, error: "A IA não conseguiu interpretar a planilha." };
      const map: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed.map)) {
        if ((CAMPOS as readonly string[]).includes(k) && data.headers.includes(v)) map[k] = v;
      }
      return { ok: true as const, map, resumo: parsed.resumo ?? "" };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na IA." };
    }
  });
