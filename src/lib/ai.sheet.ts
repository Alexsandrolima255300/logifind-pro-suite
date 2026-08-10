import type { ColumnMap, CoverageRow, SheetPreview } from "@/lib/carriers/coverage";

export type SheetAnalysis = {
  fileName: string;
  sheetCount: number;
  rowCount: number;
  columns: string[];
  mappedFields: ColumnMap;
  numericColumns: { name: string; count: number; sum: number; average: number | null; min: number | null; max: number | null }[];
  dateColumns: string[];
  duplicateDestinations: number;
  missingDestination: number;
  missingUf: number;
  preview: Record<string, unknown>[];
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const text = String(value).trim().replace(/R\$\s?/gi, "").replace(/\./g, "").replace(/,/g, ".");
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
};

export function analyzeSheet(preview: SheetPreview, fileName: string): SheetAnalysis {
  const numericColumns = preview.headers.map((name) => {
    const values = preview.rows.map((r) => toNumber(r[name])).filter((n): n is number => n !== null);
    if (values.length < Math.max(3, preview.rows.length * 0.2)) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return { name, count: values.length, sum, average: sum / values.length, min: Math.min(...values), max: Math.max(...values) };
  }).filter(Boolean) as SheetAnalysis["numericColumns"];

  const cityField = preview.map.municipio_destino;
  const ufField = preview.map.uf;
  const keys = new Set<string>();
  let duplicateDestinations = 0;
  let missingDestination = 0;
  let missingUf = 0;
  if (cityField && ufField) {
    for (const row of preview.rows) {
      const city = String(row[cityField] ?? "").trim().toUpperCase();
      const uf = String(row[ufField] ?? "").trim().toUpperCase();
      if (!city) missingDestination++;
      if (!uf) missingUf++;
      const key = `${city}|${uf}`;
      if (city && uf && keys.has(key)) duplicateDestinations++;
      if (city && uf) keys.add(key);
    }
  }

  const dateColumns = preview.headers.filter((name) => /data|date|vigencia|validade/i.test(name));
  return {
    fileName,
    sheetCount: 1,
    rowCount: preview.rows.length,
    columns: preview.headers,
    mappedFields: preview.map,
    numericColumns,
    dateColumns,
    duplicateDestinations,
    missingDestination,
    missingUf,
    preview: preview.rows.slice(0, 20),
  };
}

export function compactCoverage(rows: CoverageRow[]) {
  return rows.map((r) => ({
    cidade: r.municipio_destino,
    uf: r.uf,
    codigo: r.codigo_destino || undefined,
    origem: r.municipio_origem || undefined,
    prazoPJ: r.prazo_pj,
    prazoPF: r.prazo_pf,
    km: r.km,
    frequencia: r.frequencia,
    dias: r.dias_semana,
    ativo: r.ativo,
  }));
}
