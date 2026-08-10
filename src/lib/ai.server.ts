type OutputItem = { content?: { type?: string; text?: string }[] };

type Provider = "gemini" | "openai" | "lovable";

/**
 * Motor de IA do LogiFinder.
 *
 * Prioridade: Gemini (free tier) -> OpenAI -> Lovable.
 * Nenhuma chave é exposta ao navegador; todas ficam no servidor.
 * "Ilimitada" literalmente não existe: provedores têm limites de uso.
 * O objetivo é retirar a dependência dos créditos do workspace do Lovable.
 */
function getProvider(): Provider {
  const configured = (process.env["AI_PROVIDER"] || "").toLowerCase();
  if (configured === "gemini" && (process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"])) return "gemini";
  if (configured === "openai" && process.env["OPENAI_API_KEY"]) return "openai";
  if (configured === "lovable" && process.env["LOVABLE_API_KEY"]) return "lovable";
  if (process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"]) return "gemini";
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

async function askGemini(instructions: string, input: string): Promise<string> {
  const key = process.env["GEMINI_API_KEY"] || process.env["GOOGLE_API_KEY"];
  if (!key) throw new Error("GEMINI_API_KEY não configurada no servidor.");

  const model = process.env["GEMINI_MODEL"] || "gemini-3.5-flash";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instructions }] },
      contents: [{ role: "user", parts: [{ text: input }] }],
      generationConfig: { temperature: 0.2 },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Limite gratuito do Gemini atingido. Aguarde a renovação do limite ou configure outro provedor.");
    if (res.status === 401 || res.status === 403) throw new Error("A chave do Gemini é inválida ou não tem permissão para esse modelo.");
    throw new Error(`Falha no Gemini [${res.status}]: ${body}`);
  }

  const json = await res.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return json.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("\n").trim() || "Não consegui gerar uma resposta.";
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
    if (res.status === 429) throw new Error("A OpenAI atingiu o limite de uso da conta/API.");
    throw new Error(`Falha na OpenAI [${res.status}]: ${body}`);
  }
  return extractOutput(await res.json() as { output_text?: string; output?: OutputItem[] });
}

async function askLovable(instructions: string, input: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Nenhum provedor de IA configurado. Configure GEMINI_API_KEY no servidor.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({ model: process.env["LOVABLE_MODEL"] || "openai/gpt-5.6-sol", instructions, input }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("Limite do provedor Lovable atingido.");
    if (res.status === 402) throw new Error("Créditos do Lovable esgotados. O sistema está preparado para usar Gemini sem depender desses créditos.");
    throw new Error(`Falha no provedor Lovable [${res.status}]: ${body}`);
  }
  return extractOutput(await res.json() as { output_text?: string; output?: OutputItem[] });
}

export async function askModel(instructions: string, input: string): Promise<string> {
  const provider = getProvider();
  if (provider === "gemini") return askGemini(instructions, input);
  if (provider === "openai") return askOpenAI(instructions, input);
  return askLovable(instructions, input);
}

export function extractJson<T>(text: string): T | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(cleaned.slice(start, end + 1)) as T; } catch { return null; }
}
