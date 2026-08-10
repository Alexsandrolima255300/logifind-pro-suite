import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2, Upload, Search, Trash2, RefreshCw, Database, CheckCircle2, XCircle,
  Sparkles, Plus, Save, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  buildCoverageRows, countCoverage, deleteCoverage, listCoverage, normalizeCity,
  readSheet, updateCoverage, upsertCoverage, type ColumnMap, type CoverageRow, type SheetPreview,
} from "@/lib/carriers/coverage";
import { getCarrierSettings, saveCarrierSettings, type CarrierSettings } from "@/lib/carriers/settings";
import { askLogiAI, mapSheetColumnsAI, type AiChatMessage } from "@/lib/ai.functions";

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

export function CarrierEditor({ carrierId, carrierNome }: { carrierId: string; carrierNome: string }) {
  const [rows, setRows] = useState<CoverageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [preview, setPreview] = useState<SheetPreview | null>(null);
  const [map, setMap] = useState<ColumnMap>({});
  const [importing, setImporting] = useState(false);
  const [aiLendo, setAiLendo] = useState(false);
  const [resumoIa, setResumoIa] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, count] = await Promise.all([listCoverage(carrierId), countCoverage(carrierId)]);
      setRows(data);
      setTotal(count);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar a base.");
    } finally {
      setLoading(false);
    }
  }, [carrierId]);

  useEffect(() => {
    void load();
  }, [load]);

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
    setResumoIa("");
    try {
      const p = await readSheet(file);
      setPreview(p);
      setMap(p.map);
      toast.success(`Planilha lida: ${p.rows.length} linha(s). A IA está interpretando as colunas...`);
      setAiLendo(true);
      const res = await mapSheetColumnsAI({ data: { headers: p.headers, sample: p.rows.slice(0, 8) } });
      if (res.ok) {
        setMap((m) => ({ ...m, ...(res.map as ColumnMap) }));
        setResumoIa(res.resumo);
        toast.success("A IA identificou as colunas da planilha.");
      } else {
        toast.warning(`IA: ${res.error} — usando o mapeamento automático padrão.`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ler a planilha.");
    } finally {
      setAiLendo(false);
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
      const { rows: parsed, ignoradas } = buildCoverageRows(carrierId, preview.rows, map);
      if (!parsed.length) throw new Error("Nenhuma linha válida encontrada.");
      await upsertCoverage(parsed);
      toast.success(
        `${parsed.length} cidade(s) adicionada(s) a ${carrierNome}${ignoradas ? ` · ${ignoradas} ignorada(s)` : ""}.`,
      );
      setPreview(null);
      setResumoIa("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
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
    <Tabs defaultValue="cidades" className="space-y-6">
      <TabsList className="glass">
        <TabsTrigger value="cadastro">Cadastro e tarifas</TabsTrigger>
        <TabsTrigger value="cidades">Cidades atendidas</TabsTrigger>
        <TabsTrigger value="ia" className="gap-1.5"><Sparkles className="h-3.5 w-3.5" /> IA LogiFinder</TabsTrigger>
      </TabsList>

      <TabsContent value="cadastro">
        <SettingsForm carrierId={carrierId} carrierNome={carrierNome} />
      </TabsContent>

      <TabsContent value="cidades" className="space-y-6">
        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Badge variant="secondary" className="gap-1.5 w-fit">
              <Database className="h-3.5 w-3.5" /> {total} cidade(s) cadastradas
            </Badge>
            <div className="flex items-center gap-2">
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
              <Button onClick={() => fileRef.current?.click()} className="gap-2" disabled={aiLendo}>
                {aiLendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Importar planilha com IA
              </Button>
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>

          <AddCityForm carrierId={carrierId} onAdded={() => void load()} />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar cidade, UF ou código..."
              className="pl-9"
            />
          </div>
        </div>

        {preview && (
          <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Colunas interpretadas pela IA</h3>
                <p className="text-xs text-muted-foreground">
                  {preview.rows.length} linha(s). {resumoIa || "Ajuste qualquer coluna antes de importar."}
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
              Adicionar cidades a {carrierNome}
            </Button>
          </div>
        )}

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
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td></tr>
                )}
                {!loading && filtradas.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhuma cidade cadastrada. Importe uma planilha ou adicione manualmente.
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
                    <td className="px-4 py-2">
                      <Input
                        defaultValue={r.prazo_pf ?? ""}
                        className="h-8 w-16"
                        onBlur={(e) => {
                          const v = e.target.value === "" ? null : Number(e.target.value);
                          if (v !== r.prazo_pf) void salvarCampo(r, { prazo_pf: v });
                        }}
                      />
                    </td>
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
      </TabsContent>

      <TabsContent value="ia">
        <AiAssistant carrierId={carrierId} carrierNome={carrierNome} rows={rows} />
      </TabsContent>
    </Tabs>
  );
}

// ————— Cadastro e tarifas —————

function SettingsForm({ carrierId, carrierNome }: { carrierId: string; carrierNome: string }) {
  const [s, setS] = useState<CarrierSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ativo = true;
    getCarrierSettings(carrierId, carrierNome)
      .then((v) => { if (ativo) setS(v); })
      .catch((e: unknown) => toast.error(e instanceof Error ? e.message : "Falha ao carregar tarifas."));
    return () => { ativo = false; };
  }, [carrierId, carrierNome]);

  if (!s) {
    return <div className="glass rounded-2xl p-10 text-center"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></div>;
  }

  const num = (k: keyof CarrierSettings, label: string, sufixo?: string) => (
    <div className="space-y-1.5">
      <label className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="relative">
        <Input
          type="number"
          step="0.01"
          value={(s[k] as number | null) ?? ""}
          onChange={(e) =>
            setS({ ...s, [k]: e.target.value === "" ? null : Number(e.target.value) } as CarrierSettings)
          }
        />
        {sufixo && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">{sufixo}</span>
        )}
      </div>
    </div>
  );

  async function salvar() {
    if (!s) return;
    setSaving(true);
    try {
      await saveCarrierSettings({ ...s, nome: s.nome || carrierNome });
      toast.success("Cadastro da transportadora salvo.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Nome</label>
          <Input value={s.nome} onChange={(e) => setS({ ...s, nome: e.target.value })} />
        </div>
        {num("valor_por_kg", "Valor por kg", "R$")}
        {num("percentual_nf", "% sobre a NF-e", "%")}
        {num("frete_minimo", "Frete mínimo", "R$")}
        {num("ad_valorem", "Ad valorem", "%")}
        {num("gris", "GRIS", "%")}
        {num("fator_cubagem", "Fator de cubagem", "kg/m³")}
        {num("prazo_padrao", "Prazo padrão", "dias")}
        <div className="flex items-end gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={s.ativo} onCheckedChange={(v) => setS({ ...s, ativo: v })} />
            <span className="text-sm">{s.ativo ? "Ativa" : "Inativa"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Observações / regras</label>
        <Textarea
          rows={3}
          value={s.observacoes ?? ""}
          onChange={(e) => setS({ ...s, observacoes: e.target.value })}
          placeholder="Ex.: cobra o maior valor entre frete peso, 1,5% da NF-e e o mínimo."
        />
      </div>

      <Button onClick={() => void salvar()} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar cadastro
      </Button>
    </div>
  );
}

// ————— Adicionar cidade manualmente —————

function AddCityForm({ carrierId, onAdded }: { carrierId: string; onAdded: () => void }) {
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [prazo, setPrazo] = useState("");
  const [km, setKm] = useState("");
  const [saving, setSaving] = useState(false);

  async function adicionar() {
    if (!cidade.trim() || uf.trim().length !== 2) {
      toast.error("Informe a cidade e a UF (2 letras).");
      return;
    }
    setSaving(true);
    try {
      await upsertCoverage([
        {
          carrier_id: carrierId,
          municipio_origem: "",
          codigo_destino: "",
          municipio_destino: cidade.trim(),
          municipio_destino_norm: normalizeCity(cidade),
          uf: uf.trim().toUpperCase(),
          km: km === "" ? null : Number(km),
          prazo_pj: prazo === "" ? null : Number(prazo),
          prazo_pf: prazo === "" ? null : Number(prazo),
          frequencia: null,
          dias_semana: null,
          ativo: true,
        },
      ]);
      toast.success(`${cidade.trim()} adicionada.`);
      setCidade(""); setUf(""); setPrazo(""); setKm("");
      onAdded();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao adicionar cidade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_80px_110px_110px_auto]">
      <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Nova cidade atendida" />
      <Input value={uf} onChange={(e) => setUf(e.target.value.toUpperCase().slice(0, 2))} placeholder="UF" />
      <Input value={prazo} onChange={(e) => setPrazo(e.target.value)} placeholder="Prazo (d)" type="number" />
      <Input value={km} onChange={(e) => setKm(e.target.value)} placeholder="KM" type="number" />
      <Button variant="outline" onClick={() => void adicionar()} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Adicionar
      </Button>
    </div>
  );
}

// ————— Assistente de IA —————

function AiAssistant({
  carrierId, carrierNome, rows,
}: { carrierId: string; carrierNome: string; rows: CoverageRow[] }) {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: "assistant",
      content: `Olá! Sou a IA do LogiFinder. Posso ler planilhas, entender colunas, somar valores e explicar cálculos de frete de ${carrierNome}. Pergunte o que quiser — ou envie uma planilha aqui para eu analisar.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [anexo, setAnexo] = useState<{ nome: string; contexto: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [loading]);

  const contextoBase = useMemo(() => {
    const amostra = rows.slice(0, 60).map((r) => `${r.municipio_destino}/${r.uf} · prazo PJ ${r.prazo_pj ?? "-"} · km ${r.km ?? "-"}`);
    return `Transportadora selecionada: ${carrierNome} (id ${carrierId}). Cidades cadastradas: ${rows.length}. Amostra:\n${amostra.join("\n")}`;
  }, [rows, carrierNome, carrierId]);

  async function anexarPlanilha(file: File) {
    try {
      const p = await readSheet(file);
      const linhas = p.rows.slice(0, 120);
      setAnexo({
        nome: file.name,
        contexto: `Planilha "${file.name}" — colunas: ${p.headers.join(", ")}. Total de linhas: ${p.rows.length}. Primeiras linhas (JSON):\n${JSON.stringify(linhas)}`,
      });
      toast.success(`Planilha anexada: ${p.rows.length} linha(s).`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível ler a planilha.");
    }
  }

  async function enviar() {
    const texto = input.trim();
    if (!texto || loading) return;
    const novas: AiChatMessage[] = [...messages, { role: "user", content: texto }];
    setMessages(novas);
    setInput("");
    setLoading(true);
    try {
      const contexto = anexo ? `${contextoBase}\n\n${anexo.contexto}` : contextoBase;
      const res = await askLogiAI({ data: { messages: novas, contexto } });
      setMessages([...novas, { role: "assistant", content: res.ok ? res.answer : `⚠️ ${res.error}` }]);
    } catch (e) {
      setMessages([...novas, { role: "assistant", content: `⚠️ ${e instanceof Error ? e.message : "Falha na IA."}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass rounded-2xl flex flex-col h-[560px]">
      <div ref={boxRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary/15 border border-primary/25"
                  : "bg-white/[0.04] border border-white/[0.06]"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> A IA está pensando...
          </div>
        )}
      </div>

      <div className="border-t border-white/[0.05] p-4 space-y-2">
        {anexo && (
          <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-xs">
            <span className="truncate">📎 {anexo.nome}</span>
            <button className="text-muted-foreground hover:text-foreground" onClick={() => setAnexo(null)}>remover</button>
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void anexarPlanilha(f);
            }}
          />
          <Button variant="outline" size="icon" onClick={() => fileRef.current?.click()} title="Anexar planilha">
            <Upload className="h-4 w-4" />
          </Button>
          <Textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void enviar();
              }
            }}
            placeholder="Pergunte sobre planilhas, cidades, prazos ou cálculos de frete..."
            className="min-h-[42px] resize-none"
          />
          <Button onClick={() => void enviar()} disabled={loading || !input.trim()} className="gap-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
