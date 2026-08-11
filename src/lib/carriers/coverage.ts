// Base de atendimento (cidades atendidas) — estrutura única compartilhada por todas as transportadoras.
import { supabase } from "@/integrations/supabase/client";
import { DANUBIO_CIDADES, normalizeCity } from "./danubio-cities";

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

const DANUBIO_ORIGEM = "Uberaba";

function danubioDefaultRows(): CoverageRow[] {
  return DANUBIO_CIDADES.map((c) => ({
    carrier_id: "danubio", municipio_origem: DANUBIO_ORIGEM, codigo_destino: "",
    municipio_destino: c.cidade, municipio_destino_norm: normalizeCity(c.cidade), uf: c.estado,
    km: null, prazo_pj: c.prazo, prazo_pf: c.prazo, frequencia: null,
    dias_semana: null, ativo: c.ativo,
  }));
}

async function ensureDanubioDefaults(existing: CoverageRow[]): Promise<CoverageRow[]> {
  if (existing.length > 0) return existing;
  const defaults = danubioDefaultRows();
  const { error } = await supabase.from("carrier_coverage").upsert(defaults, {
    onConflict: "carrier_id,municipio_origem,codigo_destino,municipio_destino_norm,uf",
  });
  if (error) throw new Error(error.message);
  return defaults;
}

export async function findCoverage(carrierId: string, cidade?: string, uf?: string): Promise<CoverageRow | null> {
  if (!cidade) return null;
  let q = supabase.from("carrier_coverage").select("*").eq("carrier_id", carrierId).eq("ativo", true)
    .eq("municipio_destino_norm", normalizeCity(cidade)).limit(1);
  if (uf) q = q.eq("uf", uf.toUpperCase());
  const { data, error } = await q; if (error) throw new Error(error.message);
  const hit = (data?.[0] as CoverageRow | undefined) ?? null;
  if (hit) return hit;
  if (carrierId === "danubio") {
    const fallback = DANUBIO_CIDADES.find((c) => c.ativo && normalizeCity(c.cidade) === normalizeCity(cidade) && (!uf || c.estado === uf.toUpperCase()));
    if (fallback) return { carrier_id: "danubio", municipio_origem: DANUBIO_ORIGEM, codigo_destino: "", municipio_destino: fallback.cidade, municipio_destino_norm: normalizeCity(fallback.cidade), uf: fallback.estado, km: null, prazo_pj: fallback.prazo, prazo_pf: fallback.prazo, frequencia: null, dias_semana: null, ativo: fallback.ativo };
  }
  return null;
}

export async function listCoverage(carrierId: string): Promise<CoverageRow[]> {
  const { data, error } = await supabase.from("carrier_coverage").select("*").eq("carrier_id", carrierId)
    .order("municipio_destino", { ascending: true }).limit(10000);
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as CoverageRow[];
  return carrierId === "danubio" ? ensureDanubioDefaults(rows) : rows;
}
export async function countCoverage(carrierId: string): Promise<number> {
  const { count, error } = await supabase.from("carrier_coverage").select("id", { count: "exact", head: true }).eq("carrier_id", carrierId);
  if (error) throw new Error(error.message);
  if (carrierId === "danubio" && (count ?? 0) === 0) return DANUBIO_CIDADES.length;
  return count ?? 0;
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

type ParsedFields = { municipio_origem: string; codigo_destino: string; municipio_destino: string; uf: string; km: string; prazo_pj: string; prazo_pf: string; frequencia: string; dias_semana: string; ativo: string };
export type ColumnMap = Partial<Record<keyof ParsedFields, string>>;

const norm = (s: string) => normalizeCity(String(s ?? ""));
const ALIASES: Record<keyof ParsedFields, string[]> = {
  municipio_origem: ["municipio de origem", "municipio origem", "cidade origem", "cidade de origem", "origem"], codigo_destino: ["codigo do destino", "codigo destino", "cod destino", "codigo de destino", "codigo", "cod"],
  municipio_destino: ["municipio de destino", "municipio destino", "municipio destinatario", "cidade destino", "cidade de destino", "cidade destinatario", "destino", "municipio", "cidade"], uf: ["uf destino", "uf", "sigla uf", "estado destino", "estado", "est", "unidade federativa"],
  km: ["quilometragem", "quilometros", "quilometro", "km", "kms", "distancia km", "distancia"], prazo_pj: ["prazo pj", "prazo pessoa juridica", "prazo juridica", "prazo entrega pj", "prazo de entrega pj", "prazo"], prazo_pf: ["prazo pf", "prazo pessoa fisica", "prazo fisica", "prazo entrega pf", "prazo de entrega pf"], frequencia: ["frequencia de atendimento", "frequencia atendimento", "frequencia", "atendimento"], dias_semana: ["dias da semana", "dias semana", "dias de coleta entrega", "dias de atendimento", "dias"], ativo: ["status", "ativo", "situacao", "situacao cadastro"],
};
const FIELD_WORDS: Record<keyof ParsedFields, string[]> = {
  municipio_origem: ["origem"], codigo_destino: ["codigo", "cod"], municipio_destino: ["destino", "municipio", "cidade"], uf: ["uf", "estado"], km: ["km", "quilometragem", "distancia"], prazo_pj: ["prazo", "pj", "juridica"], prazo_pf: ["prazo", "pf", "fisica"], frequencia: ["frequencia", "atendimento"], dias_semana: ["dias", "semana"], ativo: ["status", "ativo", "situacao"],
};
function scoreHeader(header: string, field: keyof ParsedFields): number {
  const h = norm(header); if (!h) return -1; const aliases = ALIASES[field]; if (aliases.includes(h)) return 100; const compact = h.replace(/\s+/g, " "); let score = 0;
  for (const alias of aliases) if (compact.includes(alias)) score = Math.max(score, 70 + Math.min(alias.length, 15));
  const words = FIELD_WORDS[field]; score = Math.max(score, words.filter((w) => compact.includes(w)).length * 18);
  if (field === "municipio_destino" && /origem/.test(compact)) score -= 60; if (field === "municipio_origem" && /destino/.test(compact)) score -= 60; if (field === "prazo_pj" && /pf|fisica/.test(compact)) score -= 70; if (field === "prazo_pf" && /pj|juridica/.test(compact)) score -= 70; if (field === "codigo_destino" && /municipio|cidade|prazo|uf|estado/.test(compact)) score -= 50;
  return score;
}
export function autoMapColumns(headers: string[]): ColumnMap {
  const map: ColumnMap = {}; const used = new Set<string>(); const fields = Object.keys(ALIASES) as (keyof ParsedFields)[];
  for (const field of fields) { const ranked = headers.filter((h) => !used.has(h)).map((h) => ({ h, score: scoreHeader(h, field) })).filter((x) => x.score >= 70).sort((a, b) => b.score - a.score); if (ranked[0]) { map[field] = ranked[0].h; used.add(ranked[0].h); } }
  for (const field of fields) { if (map[field] || field === "municipio_destino" || field === "uf") continue; const ranked = headers.filter((h) => !used.has(h)).map((h) => ({ h, score: scoreHeader(h, field) })).sort((a, b) => b.score - a.score); if (ranked[0] && ranked[0].score >= 18) { map[field] = ranked[0].h; used.add(ranked[0].h); } }
  return map;
}
function detectHeaderRow(matrix: unknown[][]): number { let bestIndex = 0; let bestScore = -1; for (let i = 0; i < Math.min(matrix.length, 30); i++) { const cells = matrix[i].map((v) => String(v ?? "").trim()).filter(Boolean); if (cells.length < 2) continue; const normalized = cells.map(norm).join(" | "); let score = Math.min(cells.length, 8); if (/destino|municipio|cidade/.test(normalized)) score += 10; if (/\buf\b|estado/.test(normalized)) score += 8; if (/prazo|km|quilometragem|codigo|código/.test(normalized)) score += 4; if (score > bestScore) { bestScore = score; bestIndex = i; } } return bestIndex; }
function matrixToRows(matrix: unknown[][]): { headers: string[]; rows: Record<string, unknown>[] } { const headerIndex = detectHeaderRow(matrix); const rawHeaders = matrix[headerIndex] ?? []; const headers: string[] = []; const seen = new Map<string, number>(); rawHeaders.forEach((value, index) => { let h = String(value ?? "").trim(); if (!h) h = `Coluna ${index + 1}`; const n = seen.get(h) ?? 0; seen.set(h, n + 1); headers.push(n ? `${h} (${n + 1})` : h); }); const rows: Record<string, unknown>[] = []; for (let i = headerIndex + 1; i < matrix.length; i++) { const values = matrix[i] ?? []; if (!values.some((v) => String(v ?? "").trim() !== "")) continue; const row: Record<string, unknown> = {}; headers.forEach((h, index) => { row[h] = values[index] ?? ""; }); rows.push(row); } return { headers, rows }; }
const toNumber = (v: unknown): number | null => { if (v === null || v === undefined || v === "") return null; const raw = String(v).trim().replace(/R\$\s?/gi, "").replace(/\s/g, ""); const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw; const n = Number(normalized); return Number.isFinite(n) ? n : null; };
const toInt = (v: unknown): number | null => { const n = toNumber(v); return n === null ? null : Math.round(n); };
const toAtivo = (v: unknown): boolean => { if (v === null || v === undefined || v === "") return true; return !["inativo", "nao", "n", "false", "0", "desativado", "bloqueado"].includes(norm(String(v))); };
export type SheetPreview = { headers: string[]; rows: Record<string, unknown>[]; map: ColumnMap; sheetNames?: string[]; };
export async function readSheet(file: File): Promise<SheetPreview> { const XLSX = await import("xlsx"); const buf = await file.arrayBuffer(); const wb = XLSX.read(buf, { type: "array", cellFormula: true, cellNF: true, cellDates: true }); if (!wb.SheetNames.length) throw new Error("Planilha vazia."); const allRows: Record<string, unknown>[] = []; const allHeaders = new Set<string>(); for (const sheetName of wb.SheetNames) { const ws = wb.Sheets[sheetName]; if (!ws) continue; const matrix = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: "", raw: false, blankrows: false }); const parsed = matrixToRows(matrix); if (!parsed.rows.length) continue; for (const row of parsed.rows) { allRows.push({ __aba: sheetName, ...row }); Object.keys(row).forEach((h) => allHeaders.add(h)); } } if (!allRows.length) throw new Error("Nenhuma linha de dados encontrada na planilha."); const headers = Array.from(allHeaders).filter((h) => h !== "__aba"); const map = autoMapColumns(headers); return { headers, rows: allRows, map, sheetNames: wb.SheetNames }; }
export function buildCoverageRows(carrierId: string, rows: Record<string, unknown>[], map: ColumnMap): { rows: CoverageRow[]; ignoradas: number } { const get = (r: Record<string, unknown>, f: keyof ParsedFields) => map[f] ? r[map[f]!] : undefined; const out = new Map<string, CoverageRow>(); let ignoradas = 0; for (const r of rows) { const destino = String(get(r, "municipio_destino") ?? "").trim(); const uf = String(get(r, "uf") ?? "").trim().toUpperCase().slice(0, 2); if (!destino || !uf) { ignoradas++; continue; } const row: CoverageRow = { carrier_id: carrierId, municipio_origem: String(get(r, "municipio_origem") ?? "").trim(), codigo_destino: String(get(r, "codigo_destino") ?? "").trim(), municipio_destino: destino, municipio_destino_norm: normalizeCity(destino), uf, km: toNumber(get(r, "km")), prazo_pj: toInt(get(r, "prazo_pj")), prazo_pf: toInt(get(r, "prazo_pf")), frequencia: String(get(r, "frequencia") ?? "").trim() || null, dias_semana: String(get(r, "dias_semana") ?? "").trim() || null, ativo: toAtivo(get(r, "ativo")) }; const key = [row.carrier_id, row.municipio_origem, row.codigo_destino, row.municipio_destino_norm, row.uf].join("|"); out.set(key, row); } return { rows: Array.from(out.values()), ignoradas }; }
