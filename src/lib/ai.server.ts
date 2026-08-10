const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-5.6-sol";

type OutputItem = { content?: { type?: string; text?: string }[] };

/** Chamada de texto no Lovable AI Gateway (Responses API). */
export async function askModel(instructions: string, input: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("IA não configurada (LOVABLE_API_KEY ausente).");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: MODEL, instructions, input }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Limite de uso da IA atingido. Tente novamente em instantes.");
    if (res.status === 402) throw new Error("Créditos de IA esgotados. Adicione créditos ao workspace.");
    throw new Error(`Falha na IA [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as { output_text?: string; output?: OutputItem[] };
  if (typeof json.output_text === "string" && json.output_text.trim()) return json.output_text;
  const parts: string[] = [];
  for (const item of json.output ?? []) {
    for (const c of item.content ?? []) {
      if (typeof c.text === "string") parts.push(c.text);
    }
  }
  return parts.join("\n").trim() || "Não consegui gerar uma resposta.";
}

export function extractJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
