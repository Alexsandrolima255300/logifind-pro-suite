import type { ReadOnlyAuditSource, SankhyaInvoice } from "./types";

/**
 * Read-only Sankhya adapter.
 *
 * Security invariant: this adapter only exposes GET requests. There are no
 * POST/PUT/PATCH/DELETE helpers, and the URL is allow-listed. Credentials must
 * be provided by server-side environment variables/secrets, never the client.
 */
export class SankhyaReadOnlyClient implements ReadOnlyAuditSource {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(options: { baseUrl: string; token?: string }) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
  }

  private async get(path: string, params: Record<string, string>) {
    if (!path.startsWith("/")) throw new Error("Consulta Sankhya inválida.");
    const url = new URL(`${this.baseUrl}${path}`);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
    });

    if (!response.ok) throw new Error(`Sankhya respondeu HTTP ${response.status}.`);
    return response.json();
  }

  async listInvoices(periodStart: string, periodEnd: string): Promise<SankhyaInvoice[]> {
    const data = await this.get("/readonly/invoices", { periodStart, periodEnd });
    if (!Array.isArray(data)) throw new Error("Resposta de notas fiscais inválida.");

    return data.map((item) => ({
      numeroNF: String(item.numeroNF ?? item.NUNOTA ?? ""),
      valorFrete: item.valorFrete == null ? null : Number(item.valorFrete),
      transportadora: String(item.transportadora ?? item.TRANSPORTADORA ?? ""),
      cliente: String(item.cliente ?? item.CLIENTE ?? ""),
      dataEmissao: String(item.dataEmissao ?? item.DTNEG ?? ""),
    }));
  }
}

/** Defensive block for browser automation scripts: refuse known write actions. */
export const FORBIDDEN_SANKHYA_ACTIONS = Object.freeze([
  "salvar", "save", "alterar", "editar", "edit", "excluir", "delete",
  "confirmar", "confirm", "cancelar", "cancel", "finalizar", "finalize",
  "aprovar", "approve", "emitir", "emit", "gravar", "insert", "update", "post", "put", "patch", "delete",
]);

export function assertReadOnlyAction(action: string): void {
  const normalized = action.trim().toLowerCase();
  if (FORBIDDEN_SANKHYA_ACTIONS.includes(normalized)) {
    throw new Error(`Ação bloqueada pelo modo SOMENTE LEITURA: ${action}`);
  }
}
