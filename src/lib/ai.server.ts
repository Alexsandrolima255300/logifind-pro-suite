type OutputItem = { content?: { type?: string; text?: string }[] };

type Provider = "openai" | "lovable";

/**
 * Motor de IA do LogiFinder.
 *
 * Quando OPENAI_API_KEY estiver configurada no servidor, o LogiFinder usa
 * diretamente a API da OpenAI e não consome créditos de IA do Lovable.
 * A chave permanece somente no servidor.
 * LOVABLE_API_KEY continua como fallback para ambientes antigos.
 *
 * Nenhum provedor externo oferece uso literalmente infinito: o objetivo aqui
 * é retirar a dependência dos créditos do workspace do Lovable.
 */
function getProvider(): Provider {
  const configured = (process.env["AI_PROVIDER"] || "").toLowerCase();
  if (configured === "lovable") return "lovable";
  if (process.env["OPENAI_API_KEY"]) return "openai";
  return "lovable";
}

function extractOutput(json: { output_text?: string; output?: OutputItem[] }): string {
  if (typeof json.output_text === "string" && json.output_text.trim()) return json.output_text.trim();
  const parts: string[] = [];
  for (const item of json.output ?? []) {
    for (const c of item.content ?? []) {
      if (typeof c.text === "string") parts.push(c.text);
    }
  }
  return parts.join("\n").trim() || "Não consegui gerar uma resposta.";
}

async function askOpenAI(instructions: string, input: string): Promise<string> {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new Error("OPENAI_API_KEY não configurada no servidor.");

  const model = process.env["OPENAI_MODEL"] || "gpt-5-mini";
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, instructions, input }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401) throw new Error("A chave da OpenAI configurada no servidor é inválida.");
    if (res.status === 429) throw new Error("A OpenAI atingiu o limite de uso da conta/API. Verifique faturamento ou limites da API.");
    throw new Error(`Falha na OpenAI [${res.status}]: ${body}`);
  }
  return extractOutput((await res.json()) as { output_text?: string; output?: OutputItem[] });
}

async function askLovable(instructions: string, input: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Nenhum provedor de IA configurado. Configure OPENAI_API_KEY no servidor.");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: process.env["LOVABLE_MODEL"] || "openai/gpt-5.6-sol", instructions, input }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Limite do provedor de IA atingido.");
    if (res.status === 402) throw new Error("Créditos do Lovable esgotados. Configure OPENAI_API_KEY no servidor para não depender dos créditos do workspace.");
    throw new Error(`Falha no provedor Lovable [${res.status}]: ${body}`);
  }
  return extractOutput((await res.json()) as { output_text?: string; output?: OutputItem[] });
}

/** Chamada central de IA. OpenAI é priorizada quando sua chave está configurada. */
export async function askModel(instructions: string, input: string): Promise<string> {
  return getProvider() === "openai" ? askOpenAI(instructions, input) : askLovable(instructions, input);
}

export function extractJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)) as T; } catch { return null; }
}
