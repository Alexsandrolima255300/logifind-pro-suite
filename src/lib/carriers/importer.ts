import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabaseClient";

export type ImportStats = {
  totalRows: number;
  insertedCount: number;
  updatedCount: number;
  errorLines: string[];
};

export function parseBoolSN(val: unknown): boolean {
  if (val === true || val === 1 || val === "1") return true;
  if (typeof val === "string") {
    const clean = val.trim().toUpperCase();
    return clean === "S" || clean === "SIM" || clean === "TRUE";
  }
  return false;
}

export function normalizeText(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  return str.length > 0 ? str : null;
}

export function parseNumeric(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export async function importRodonavesSpreadsheet(fileBuffer: ArrayBuffer | Uint8Array | Buffer): Promise<ImportStats> {
  const workbook = XLSX.read(fileBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  const stats: ImportStats = {
    totalRows: rawRows.length,
    insertedCount: 0,
    updatedCount: 0,
    errorLines: [],
  };

  if (rawRows.length === 0) {
    stats.errorLines.push("Planilha vazia ou sem cabeçalhos válidos.");
    return stats;
  }

  // 1. Obter ID da Rodonaves no Supabase
  let rodonavesId = "a1b2c3d4-e5f6-7890-abcd-111111111111";
  try {
    const { data } = await supabase.from("transportadoras").select("id").eq("codigo_interno", "RODONAVES").maybeSingle();
    if (data && data.id) rodonavesId = data.id;
  } catch {
    // Usar ID fallback se necessário
  }

  const now = new Date().toISOString();
  const upsertBatch: Array<Record<string, unknown>> = [];

  rawRows.forEach((row, index) => {
    const lineNum = index + 2; // Cabeçalho é a linha 1

    try {
      const municipioOrigem = normalizeText(row["Municipio Origem"] || row["municipio_origem"] || row["Origem"]);
      const codigoDestino = normalizeText(row["Und Destino"] || row["codigo_destino"] || row["Codigo"]);
      const municipioDestino = normalizeText(row["Municipio Destino"] || row["municipio_destino"] || row["Destino"]);
      const uf = normalizeText(row["UF Municipio Destino"] || row["uf"] || row["UF"])?.toUpperCase();

      if (!municipioDestino || !uf) {
        stats.errorLines.push(`Linha ${lineNum}: Município de destino e UF são obrigatórios.`);
        return;
      }

      const record = {
        transportadora_id: rodonavesId,
        municipio_origem: municipioOrigem,
        codigo_destino: codigoDestino,
        municipio_destino: municipioDestino,
        uf: uf,
        km_total: parseNumeric(row["Km Total"] || row["km_total"]),
        prazo_pj: parseNumeric(row["Prazo Total PJ"] || row["prazo_pj"]) ? Math.round(Number(row["Prazo Total PJ"] || row["prazo_pj"])) : null,
        prazo_pf: parseNumeric(row["Prazo Total PF"] || row["prazo_pf"]) ? Math.round(Number(row["Prazo Total PF"] || row["prazo_pf"])) : null,
        frequencia: parseNumeric(row["Frequência"] || row["frequencia"]) ? Math.round(Number(row["Frequência"] || row["frequencia"])) : null,
        segunda: parseBoolSN(row["segunda"] ?? row["Segunda"]),
        terca: parseBoolSN(row["terça"] ?? row["terca"] ?? row["Terça"]),
        quarta: parseBoolSN(row["quarta"] ?? row["Quarta"]),
        quinta: parseBoolSN(row["quinta"] ?? row["Quinta"]),
        sexta: parseBoolSN(row["sexta"] ?? row["Sexta"]),
        sabado: parseBoolSN(row["sabado"] ?? row["sábado"] ?? row["Sábado"]),
        domingo: parseBoolSN(row["domingo"] ?? row["Domingo"]),
        created_at: now,
        updated_at: now,
      };

      upsertBatch.push(record);
    } catch (err) {
      stats.errorLines.push(`Linha ${lineNum}: ${(err as Error).message}`);
    }
  });

  if (upsertBatch.length === 0) {
    return stats;
  }

  // 2. Executar UPSERT em lotes no Supabase
  const BATCH_SIZE = 500;
  for (let i = 0; i < upsertBatch.length; i += BATCH_SIZE) {
    const chunk = upsertBatch.slice(i, i + BATCH_SIZE);
    try {
      const { error } = await supabase
        .from("transportadora_cidades")
        .upsert(chunk, {
          onConflict: "transportadora_id, COALESCE(municipio_origem, ''), COALESCE(codigo_destino, ''), municipio_destino, uf",
        });

      if (error) {
        // Fallback sem onConflict estrito se o índice for simples
        const { error: fallbackErr } = await supabase.from("transportadora_cidades").insert(chunk);
        if (fallbackErr) {
          stats.errorLines.push(`Erro de gravação no banco no lote ${i / BATCH_SIZE + 1}: ${fallbackErr.message}`);
        } else {
          stats.insertedCount += chunk.length;
        }
      } else {
        stats.insertedCount += chunk.length;
      }
    } catch (err) {
      stats.errorLines.push(`Falha no envio do lote ${i / BATCH_SIZE + 1}: ${(err as Error).message}`);
    }
  }

  return stats;
}
