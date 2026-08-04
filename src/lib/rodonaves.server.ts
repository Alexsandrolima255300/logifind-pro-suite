// Servidor-only: nunca exponha nada deste módulo ao cliente.
// As credenciais vivem apenas em variáveis de ambiente e nunca são retornadas.

const DOCS_INDEX = "https://dev.rodonaves.com.br/llms.txt";

type TokenCache = { token: string; expiresAt: number } | null;
let tokenCache: TokenCache = null;

export function baseUrl(): string {
  const raw = process.env["RODONAVES_BASE_URL"] || "https://tracking-apigateway.rte.com.br";
  return raw.replace(/\/+$/, "");
}

export function credentialsConfigured(): boolean {
  return Boolean(process.env["RODONAVES_USERNAME"] && process.env["RODONAVES_PASSWORD"]);
}

/** Obtém (e reaproveita) o token de acesso. Nunca retorne o token ao cliente. */
export async function getToken(force = false): Promise<{ token: string; expiresAt: number }> {
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache;

  const username = process.env["RODONAVES_USERNAME"];
  const password = process.env["RODONAVES_PASSWORD"];
  if (!username || !password) throw new Error("Credenciais Rodonaves não configuradas no servidor.");

  const body = new URLSearchParams({
    auth_type: process.env["RODONAVES_AUTH_TYPE"] || "DEV",
    grant_type: "password",
    username,
    password,
  });

  const res = await fetch(`${baseUrl()}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    // Nunca inclua credenciais na mensagem de erro.
    throw new Error(`Falha na autenticação (HTTP ${res.status}).`);
  }
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error("Resposta de autenticação inválida.");
  }
  const token = String(json["access_token"] ?? "");
  if (!token) throw new Error("Token não retornado pela API.");
  const expiresIn = Number(json["expires_in"] ?? 3600);
  tokenCache = { token, expiresAt: Date.now() + expiresIn * 1000 };
  return tokenCache;
}

export function cachedSession(): { connected: boolean; expiresAt: number | null } {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return { connected: true, expiresAt: tokenCache.expiresAt };
  }
  return { connected: false, expiresAt: null };
}

export function clearToken() {
  tokenCache = null;
}

export type DiscoveredParam = {
  name: string;
  in: "path" | "query" | "header" | "body";
  required: boolean;
  type: string;
  description?: string;
};

export type DiscoveredEndpoint = {
  id: string;
  group: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  params: DiscoveredParam[];
  bodyExample?: string;
};

type JsonObj = Record<string, unknown>;

function schemaToParams(schema: JsonObj | undefined, where: DiscoveredParam["in"]): DiscoveredParam[] {
  if (!schema) return [];
  const props = (schema["properties"] as JsonObj | undefined) ?? {};
  const required = (schema["required"] as string[] | undefined) ?? [];
  return Object.entries(props).map(([name, raw]) => {
    const p = (raw ?? {}) as JsonObj;
    return {
      name,
      in: where,
      required: required.includes(name),
      type: String(p["type"] ?? "string"),
      description: p["description"] ? String(p["description"]) : undefined,
    };
  });
}

function parseOpenApi(spec: JsonObj, fallbackGroup: string): DiscoveredEndpoint[] {
  const out: DiscoveredEndpoint[] = [];
  const paths = (spec["paths"] as JsonObj | undefined) ?? {};
  for (const [path, rawItem] of Object.entries(paths)) {
    const item = (rawItem ?? {}) as JsonObj;
    for (const method of ["get", "post", "put", "patch", "delete"]) {
      const rawOp = item[method];
      if (!rawOp) continue;
      const op = rawOp as JsonObj;
      const tags = (op["tags"] as string[] | undefined) ?? [];
      const params: DiscoveredParam[] = [];
      for (const rawP of ((op["parameters"] as unknown[] | undefined) ?? []) as JsonObj[]) {
        const sch = (rawP["schema"] as JsonObj | undefined) ?? {};
        params.push({
          name: String(rawP["name"] ?? ""),
          in: (String(rawP["in"] ?? "query") as DiscoveredParam["in"]) ?? "query",
          required: Boolean(rawP["required"]),
          type: String(sch["type"] ?? "string"),
          description: rawP["description"] ? String(rawP["description"]) : undefined,
        });
      }
      const rb = (op["requestBody"] as JsonObj | undefined)?.["content"] as JsonObj | undefined;
      let bodySchema: JsonObj | undefined;
      let isForm = false;
      if (rb) {
        const jsonCt = (rb["application/json"] as JsonObj | undefined);
        const formCt = (rb["application/x-www-form-urlencoded"] as JsonObj | undefined);
        const chosen = jsonCt ?? formCt;
        isForm = !jsonCt && Boolean(formCt);
        bodySchema = chosen?.["schema"] as JsonObj | undefined;
      }
      const bodyParams = isForm
        ? schemaToParams(bodySchema, "query")
        : schemaToParams(bodySchema, "body");

      out.push({
        id: `${method.toUpperCase()} ${path}`,
        group: tags[0] ?? fallbackGroup,
        method: method.toUpperCase(),
        path,
        summary: String(op["summary"] ?? path).trim(),
        description: op["description"] ? String(op["description"]) : undefined,
        params: [...params, ...bodyParams],
        bodyExample:
          !isForm && bodySchema
            ? JSON.stringify(
                Object.fromEntries(
                  schemaToParams(bodySchema, "body").map((p) => [p.name, p.type === "number" || p.type === "integer" ? 0 : ""]),
                ),
                null,
                2,
              )
            : undefined,
      });
    }
  }
  return out;
}

/** Descobre endpoints a partir da documentação pública (llms.txt + blocos OpenAPI). */
export async function discoverEndpoints(): Promise<{ endpoints: DiscoveredEndpoint[]; pages: number; source: string }> {
  const idxRes = await fetch(DOCS_INDEX);
  if (!idxRes.ok) throw new Error(`Não foi possível ler o índice da documentação (HTTP ${idxRes.status}).`);
  const idx = await idxRes.text();

  const links = Array.from(idx.matchAll(/\((https?:\/\/[^)\s]+)\)/g)).map((m) => m[1]!);
  const unique = Array.from(new Set(links)).slice(0, 60);

  const endpoints: DiscoveredEndpoint[] = [];
  const chunkSize = 8;
  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const results = await Promise.allSettled(
      chunk.map(async (url) => {
        const r = await fetch(url.endsWith(".md") ? url : `${url}.md`);
        if (!r.ok) return { url, text: "" };
        return { url, text: await r.text() };
      }),
    );
    for (const r of results) {
      if (r.status !== "fulfilled" || !r.value.text) continue;
      const { url, text } = r.value;
      const slug = decodeURIComponent(url.split("/").filter(Boolean).pop() ?? "geral").replace(/-/g, " ");
      for (const block of text.matchAll(/```json\s*([\s\S]*?)```/g)) {
        try {
          const spec = JSON.parse(block[1]!) as JsonObj;
          if (!spec["openapi"] && !spec["swagger"]) continue;
          endpoints.push(...parseOpenApi(spec, slug));
        } catch {
          /* bloco não é OpenAPI válido */
        }
      }
    }
  }

  const dedup = new Map<string, DiscoveredEndpoint>();
  for (const e of endpoints) dedup.set(e.id, e);
  return { endpoints: Array.from(dedup.values()), pages: unique.length, source: DOCS_INDEX };
}

export type ApiCallResult = {
  ok: boolean;
  status: number;
  statusText: string;
  durationMs: number;
  contentType: string;
  body: string;
};

export async function callApi(input: {
  method: string;
  path: string;
  query?: Record<string, string>;
  body?: string;
}): Promise<ApiCallResult> {
  const { token } = await getToken();
  const url = new URL(baseUrl() + (input.path.startsWith("/") ? input.path : `/${input.path}`));
  for (const [k, v] of Object.entries(input.query ?? {})) if (v !== "") url.searchParams.set(k, v);

  const started = Date.now();
  const headers: Record<string, string> = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  const method = input.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "DELETE" && Boolean(input.body?.trim());
  if (hasBody) headers["Content-Type"] = "application/json";

  const res = await fetch(url.toString(), { method, headers, body: hasBody ? input.body : undefined });
  const text = await res.text();
  return {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    durationMs: Date.now() - started,
    contentType: res.headers.get("content-type") ?? "",
    body: text,
  };
}
