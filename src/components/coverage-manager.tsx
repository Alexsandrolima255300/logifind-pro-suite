import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, Search, Trash2, RefreshCw, Database, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  CARRIERS_COM_BASE, buildCoverageRows, countCoverage, deleteCoverage, listCoverage,
  readSheet, updateCoverage, upsertCoverage, type ColumnMap, type CoverageRow, type SheetPreview,
} from "@/lib/carriers/coverage";

const FIELD_LABELS: { key: keyof ColumnMap; label: string; required?: boolean }[] = [
  { key: "municipio_origem", label: "Município de Origem" },
  { key: "codigo_destino", label: "Código do Destino" },
  { key: "municipio_destino", label: "Município de Destino", required: true },
  { key: "uf", label: "UF", required: true },
  { key: "km", label: "Quilometragem" },
  { key: "prazo_pj", label: "Prazo PJ" },
  { key: "prazo_pf", label: "Prazo PF" },
  { key: "frequencia", label: "Frequência" },
  { key: "dias_semana", label: "Dias da semana" },
  { key: "ativo", label: "Status" },
];

const NONE = "__none__";

export function CoverageManager() {
  const [carrier, setCarrier] = useState<string>("rodonaves");
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [preview, setPreview] = useState<SheetPreview | null>(null);
  const [map, setMap] = useState<ColumnMap>({});
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [data, count] = await Promise.all([listCoverage(id), countCoverage(id)]);
      setRows(data);
      setTotal(count);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar a base.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(carrier);
  }, [carrier, load]);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.municipio_destino.toLowerCase().includes(q) ||
        r.uf.toLowerCase().includes(q) ||
        (r.codigo_destino ?? "").toLowerCase().includes(q),
    );
  }, [rows, busca]);

  async function onFile(file: File) {
    try {
      const p = await readSheet(file);
      setPreview(p);
      setMap(p.map);
      toast.success(`Planilha lida: ${p.rows.length} linha(s), ${p.headers.length} coluna(s).`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ler a planilha.");
    }
  }

  async function importar() {
    if (!preview) return;
    if (!map.municipio_destino || !map.uf) {
      toast.error("Mapeie ao menos Município de Destino e UF.");
      return;
    }
    setImporting(true);
    try {
      const { rows: parsed, ignoradas } = buildCoverageRows(carrier, preview.rows, map);
      if (!parsed.length) throw new Error("Nenhuma linha válida encontrada.");
      await upsertCoverage(parsed);
      toast.success(
        `${parsed.length} cidade(s) importada(s)/atualizada(s)${ignoradas ? ` · ${ignoradas} linha(s) ignorada(s)` : ""}.`,
      );
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      await load(carrier);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha na importação.");
    } finally {
      setImporting(false);
    }
  }

  async function salvarCampo(row: CoverageRow, patch: Partial<CoverageRow>) {
    if (!row.id) return;
    try {
      await updateCoverage(row.id, patch);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar.");
    }
  }

  async function remover(row: CoverageRow) {
    if (!row.id) return;
    try {
      await deleteCoverage(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao excluir.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Transportadora</label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger className="w-full md:w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CARRIERS_COM_BASE.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5">
              <Database className="h-3.5 w-3.5" />
              {total} cidade(s) na base
            </Badge>
            <Button variant="outline" size="sm" onClick={() => void load(carrier)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onFile(f);
            }}
          />
          <Button onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> Importar planilha (.xlsx)
          </Button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cidade, UF ou código..."
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Mapeamento */}
      {preview && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Conferir colunas detectadas</h3>
              <p className="text-xs text-muted-foreground">
                {preview.rows.length} linha(s) na planilha. Ajuste qualquer coluna que o sistema não reconheceu.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPreview(null)}>Cancelar</Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FIELD_LABELS.map((f) => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {f.label}{f.required && <span className="text-primary"> *</span>}
                </label>
                <Select
                  value={map[f.key] ?? NONE}
                  onValueChange={(v) => setMap((m) => ({ ...m, [f.key]: v === NONE ? undefined : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Não usar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Não usar</SelectItem>
                    {preview.headers.map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <Button onClick={() => void importar()} disabled={importing} className="gap-2">
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Importar para o banco
          </Button>
        </div>
      )}

      {/* Tabela */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-3">Origem</th>
                <th className="text-left font-medium px-4 py-3">Cód.</th>
                <th className="text-left font-medium px-4 py-3">Destino</th>
                <th className="text-left font-medium px-4 py-3">UF</th>
                <th className="text-left font-medium px-4 py-3">KM</th>
                <th className="text-left font-medium px-4 py-3">Prazo PJ</th>
                <th className="text-left font-medium px-4 py-3">Prazo PF</th>
                <th className="text-left font-medium px-4 py-3">Frequência</th>
                <th className="text-left font-medium px-4 py-3">Dias</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                </td></tr>
              )}
              {!loading && filtradas.length === 0 && (
                <tr><td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma cidade cadastrada. Importe a planilha para alimentar a base.
                </td></tr>
              )}
              {filtradas.slice(0, 500).map((r) => (
                <tr key={r.id} className="border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-2 whitespace-nowrap">{r.municipio_origem || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{r.codigo_destino || "—"}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{r.municipio_destino}</td>
                  <td className="px-4 py-2 font-mono text-primary">{r.uf}</td>
                  <td className="px-4 py-2">{r.km ?? "—"}</td>
                  <td className="px-4 py-2">
                    <Input
                      defaultValue={r.prazo_pj ?? ""}
                      className="h-8 w-16"
                      onBlur={(e) => {
                        const v = e.target.value === "" ? null : Number(e.target.value);
                        if (v !== r.prazo_pj) void salvarCampo(r, { prazo_pj: v });
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">{r.prazo_pf ?? "—"}</td>
                  <td className="px-4 py-2">{r.frequencia ?? "—"}</td>
                  <td className="px-4 py-2">{r.dias_semana ?? "—"}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => void salvarCampo(r, { ativo: !r.ativo })}
                      className="inline-flex items-center gap-1.5 text-xs"
                    >
                      {r.ativo
                        ? <><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Ativo</>
                        : <><XCircle className="h-3.5 w-3.5 text-muted-foreground" /> Inativo</>}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => void remover(r)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtradas.length > 500 && (
          <div className="px-4 py-3 text-xs text-muted-foreground border-t border-white/[0.04]">
            Exibindo as primeiras 500 de {filtradas.length} linhas — refine a busca para ver mais.
          </div>
        )}
      </div>
    </div>
  );
}
