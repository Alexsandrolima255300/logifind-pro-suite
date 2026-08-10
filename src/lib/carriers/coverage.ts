// Base de atendimento (cidades atendidas) — estrutura única compartilhada por todas as transportadoras.
import { supabase } from "@/integrations/supabase/client";
import { normalizeCity } from "./danubio-cities";

export type CoverageRow = {
  id?: string; carrier_id: string; municipio_origem: string; codigo_destino: string;
  municipio_destino: string; municipio_destino_norm: string; uf: string; km: number | null;
  prazo_pj: number | null; prazo_pf: number | null; frequencia: string | null;
  dias_semana: string | null; ativo: boolean;
};

export const CARRIERS_COM_BASE = [
  { id: "rodonaves", nome: "Rodonaves (RTE)" }, { id: "braspress", nome: "Braspress" },
  { id: "alfa", nome: "Alfa Transportes" }, { id: "danubio", nome: "Danúbio Transportes" },
] as const;
export { normalizeCity };

export async function findCoverage(carrierId: string, cidade?: string, uf?: string): Promise<CoverageRow | null> {
  if (!cidade) return null;
  let q = supabase.from("carrier_coverage").select("*").eq("carrier_id", carrierId).eq("ativo", true)
    .eq("municipio_destino_norm", normalizeCity(cidade)).limit(1);
  if (uf) q = q.eq("uf", uf.toUpperCase());
  const { data, error } = await q; if (error) throw new Error(error.message);
  return (data?.[0] as CoverageRow | undefined) ?? null;
}

export async function listCoverage(carrierId: string): Promise<CoverageRow[]> {
  const { data, error } = await supabase.from("carrier_coverage").select("*").eq("carrier_id", carrierId)
    .order("municipio_destino", { ascending: true }).limit(10000);
  if (error) throw new Error(error.message); return (data ?? []) as CoverageRow[];
}
export async function countCoverage(carrierId: string): Promise<number> {
  const { count, error } = await supabase.from("carrier_coverage").select("id", { count: "exact", head: true }).eq("carrier_id", carrierId);
  if (error) throw new Error(error.message); return count ?? 0;
}
export async function upsertCoverage(rows: CoverageRow[]): Promise<number> {
  let total = 0; const chunk = 500;
  for (let i = 0; i < rows.length; i += chunk) {
    const { error } = await supabase.from("carrier_coverage").upsert(rows.slice(i, i + chunk), {
      onConflict: "carrier_id,municipio_origem,codigo_destino,municipio_destino_norm,uf",
    });
    if (error) throw new Error(error.message); total += Math.min(chunk, rows.length - i);
  }
  return total;
}
export async function updateCoverage(id: string, patch: Partial<CoverageRow>): Promise<void> {
  const { error } = await supabase.from("carrier_coverage").update(patch).eq("id", id); if (error) throw new Error(error.message);
}
export async function deleteCoverage(id: string): Promise<void> {
  const { error } = await supabase.from("carrier_coverage").delete().eq("id", id); if (error) throw new Error(error.message);
}

const norm = (s: string) => normalizeCity(String(s ?? ""));
const ALIASES: Record<keyof ParsedFields, string[]> = {
  municipio_origem: ["municipio de origem", "municipio origem", "origem", "cidade origem", "cidade de origem"],
  codigo_destino: ["codigo do destino", "codigo destino", "cod destino", "codigo", "cod"],
  municipio_destino: ["municipio de destino", "municipio destino", "destino", "cidade destino", "cidade de destino", "municipio", "cidade"],
  uf: ["uf", "estado", "sigla uf", "uf destino"], km: ["quilometragem", "km", "kms", "distancia", "distancia km"],
  prazo_pj: ["prazo pj", "prazo pessoa juridica", "prazo juridica", "prazo entrega pj", "prazo"],
  prazo_pf: ["prazo pf", "prazo pessoa fisica", "prazo fisica", "prazo entrega pf"],
  frequencia: ["frequencia de atendimento", "frequencia", "atendimento"],
  dias_semana: ["dias da semana", "dias semana", "dias", "dias de coleta entrega", "dias de atendimento"],
  ativo: ["status", "ativo", "situacao"],
};
type ParsedFields = { municipio_origem: string; codigo_destino: string; municipio_destino: string; uf: string; km: string; prazo_pj: string; prazo_pf: string; frequencia: string; dias_semana: string; ativo: string };
export type ColumnMap = Partial<Record<keyof ParsedFields, string>>;
export function autoMapColumns(headers: string[]): ColumnMap {
  const map: ColumnMap = {}; const used = new Set<string>();
  for (const field of Object.keys(ALIASES) as (keyof ParsedFields)[]) {
    const aliases = ALIASES[field];
    let hit = headers.find((h) => !used.has(h) && aliases.includes(norm(h)));
    if (!hit) hit = headers.find((h) => !used.has(h) && aliases.some((a) => norm(h).includes(a)));
    if (hit) { map[field] = hit; used.add(hit); }
  }
  return map;
}
const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const raw = String(v).trim().replace(/R\$\s?/gi, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const n = Number(normalized); return Number.isFinite(n) ? n : null;
};
const toInt = (v: unknown): number | null => { const n = toNumber(v); return n === null ? null : Math.round(n); };
const toAtivo = (v: unknown): boolean => {
  if (v === null || v === undefined || v === "") return true;
  return !["inativo", "nao", "n", "false", "0", "desativado", "bloqueado"].includes(norm(String(v)));
};
export type SheetPreview = { headers: string[]; rows: Record<string, unknown>[]; map: ColumnMap; sheetNames?: string[]; };

export async function readSheet(file: File): Promise<SheetPreview> {
  const XLSX = await import("xlsx"); const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellFormula: true, cellNF: true, cellDates: true });
  if (!wb.SheetNames.length) throw new Error("Planilha vazia.");
  const allRows: Record<string, unknown>[] = []; const allHeaders = new Set<string>();
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName]; if (!ws) continue;
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
    for (const row of rows) {
      allRows.push({ __aba: sheetName, ...row }); Object.keys(row).forEach((h) => allHeaders.add(h));
    }
  }
  if (!allRows.length) throw new Error("Nenhuma linha encontrada na planilha.");
  const headers = Array.from(allHeaders); const map = autoMapColumns(headers);
  return { headers, rows: allRows, map, sheetNames: wb.SheetNames };
}

export function buildCoverageRows(carrierId: string, rows: Record<string, unknown>[], map: ColumnMap): { rows: CoverageRow[]; ignoradas: number } {
  const get = (r: Record<string, unknown>, f: keyof ParsedFields) => map[f] ? r[map[f]!] : undefined;
  const out = new Map<string, CoverageRow>(); let ignoradas = 0;
  for (const r of rows) {
    const destino = String(get(r, "municipio_destino") ?? "").trim(); const uf = String(get(r, "uf") ?? "").trim().toUpperCase().slice(0, 2);
    if (!destino || !uf) { ignoradas++; continue; }
    const row: CoverageRow = {
      carrier_id: carrierId, municipio_origem: String(get(r, "municipio_origem") ?? "").trim(),
      codigo_destino: String(get(r, "codigo_destino") ?? "").trim(), municipio_destino: destino,
      municipio_destino_norm: normalizeCity(destino), uf, km: toNumber(get(r, "km")),
      prazo_pj: toInt(get(r, "prazo_pj")), prazo_pf: toInt(get(r, "prazo_pf")),
      frequencia: String(get(r, "frequencia") ?? "").trim() || null,
      dias_semana: String(get(r, "dias_semana") ?? "").trim() || null, ativo: toAtivo(get(r, "ativo")),
    };
    const key = [row.carrier_id, row.municipio_origem, row.codigo_destino, row.municipio_destino_norm, row.uf].join("|"); out.set(key, row);
  }
  return { rows: Array.from(out.values()), ignoradas };
}
