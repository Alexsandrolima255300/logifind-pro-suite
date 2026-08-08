import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createServerFn } from "@tanstack/react-start";

export const getRodonavesStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
  const { credentialsConfigured, cachedSession, baseUrl } = await import("./rodonaves.server");
  return {
    configured: credentialsConfigured(),
    baseUrl: baseUrl(),
    ...cachedSession(),
  };
});

export const connectRodonaves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
  const { getToken, baseUrl } = await import("./rodonaves.server");
  try {
    const { expiresAt } = await getToken(true);
    return { ok: true as const, expiresAt, baseUrl: baseUrl() };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Falha ao conectar." };
  }
});

export const disconnectRodonaves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
  const { clearToken } = await import("./rodonaves.server");
  clearToken();
  return { ok: true as const };
});

export const discoverRodonavesEndpoints = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
  const { discoverEndpoints } = await import("./rodonaves.server");
  try {
    return { ok: true as const, ...(await discoverEndpoints()) };
  } catch (e) {
    return { ok: false as const, error: e instanceof Error ? e.message : "Falha na descoberta." };
  }
});

export const callRodonaves = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { method: string; path: string; query?: Record<string, string>; body?: string }) => {
    if (!data || typeof data.path !== "string" || !data.path) throw new Error("Path obrigatório.");
    if (data.path.length > 500) throw new Error("Path inválido.");
    if ((data.body?.length ?? 0) > 100_000) throw new Error("Corpo muito grande.");
    return data;
  })
  .handler(async ({ data }) => {
    const { callApi } = await import("./rodonaves.server");
    try {
      return { ok: true as const, result: await callApi(data) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Falha na requisição." };
    }
  });
