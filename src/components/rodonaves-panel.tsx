import { useCallback, useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Plug,
  ShieldCheck,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Send,
  History,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getRodonavesStatus,
  connectRodonaves,
  disconnectRodonaves,
  discoverRodonavesEndpoints,
  callRodonaves,
} from "@/lib/rodonaves.functions";

type Param = { name: string; in: "path" | "query" | "header" | "body"; required: boolean; type: string; description?: string };
type Endpoint = {
  id: string;
  group: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  params: Param[];
  bodyExample?: string;
};

type HistoryItem = {
  at: string;
  method: string;
  path: string;
  status: number | null;
  durationMs: number;
  ok: boolean;
};

const TABS = [
  { id: "conexao", label: "Autenticação", icon: ShieldCheck },
  { id: "explorar", label: "Testes da API", icon: Send },
  { id: "docs", label: "Documentação", icon: BookOpen },
  { id: "historico", label: "Histórico", icon: History },
] as const;

type TabId = (typeof TABS)[number]["id"];

const methodColor = (m: string) =>
  m === "GET"
    ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"
    : m === "POST"
      ? "text-blue-400 border-blue-400/30 bg-blue-400/10"
      : m === "DELETE"
        ? "text-rose-400 border-rose-400/30 bg-rose-400/10"
        : "text-amber-400 border-amber-400/30 bg-amber-400/10";

export function RodonavesPanel() {
  const status = useServerFn(getRodonavesStatus);
  const connect = useServerFn(connectRodonaves);
  const disconnect = useServerFn(disconnectRodonaves);
  const discover = useServerFn(discoverRodonavesEndpoints);
  const call = useServerFn(callRodonaves);

  const [tab, setTab] = useState<TabId>("conexao");
  const [connected, setConnected] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [baseUrlValue, setBaseUrlValue] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);
  const [pagesRead, setPagesRead] = useState(0);

  const [group, setGroup] = useState<string | null>(null);
  const [selected, setSelected] = useState<Endpoint | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [bodyText, setBodyText] = useState("");
  const [sending, setSending] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    body: string;
    ok: boolean;
  } | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const doConnect = useCallback(async () => {
    setConnecting(true);
    setAuthError(null);
    const r = await connect({});
    if (r.ok) {
      setConnected(true);
      setExpiresAt(r.expiresAt);
      setBaseUrlValue(r.baseUrl);
    } else {
      setConnected(false);
      setAuthError(r.error);
    }
    setConnecting(false);
  }, [connect]);

  const doDiscover = useCallback(async () => {
    setDiscovering(true);
    setDiscoverError(null);
    const r = await discover({});
    if (r.ok) {
      setEndpoints(r.endpoints as Endpoint[]);
      setPagesRead(r.pages);
    } else {
      setDiscoverError(r.error);
    }
    setDiscovering(false);
  }, [discover]);

  // Conexão automática — as credenciais ficam apenas no servidor.
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = await status({});
      if (!alive) return;
      setBaseUrlValue(s.baseUrl);
      setConnected(s.connected);
      setExpiresAt(s.expiresAt);
      if (s.configured && !s.connected) await doConnect();
      await doDiscover();
    })();
    return () => {
      alive = false;
    };
  }, [status, doConnect, doDiscover]);

  const groups = useMemo(() => {
    const set = new Map<string, number>();
    for (const e of endpoints) set.set(e.group, (set.get(e.group) ?? 0) + 1);
    return Array.from(set.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [endpoints]);

  const visible = useMemo(
    () => (group ? endpoints.filter((e) => e.group === group) : endpoints),
    [endpoints, group],
  );

  function pick(e: Endpoint) {
    setSelected(e);
    setValues({});
    setBodyText(e.bodyExample ?? "");
    setResponse(null);
    setCallError(null);
    setTab("explorar");
  }

  async function send() {
    if (!selected) return;
    setSending(true);
    setCallError(null);
    setResponse(null);

    let path = selected.path;
    const query: Record<string, string> = {};
    for (const p of selected.params) {
      const v = values[p.name] ?? "";
      if (p.in === "path") path = path.replace(`{${p.name}}`, encodeURIComponent(v));
      else if (p.in === "query") query[p.name] = v;
    }

    const r = await call({ data: { method: selected.method, path, query, body: bodyText } });
    if (r.ok) {
      setResponse(r.result);
      setHistory((h) =>
        [
          {
            at: new Date().toLocaleString("pt-BR"),
            method: selected.method,
            path,
            status: r.result.status,
            durationMs: r.result.durationMs,
            ok: r.result.ok,
          },
          ...h,
        ].slice(0, 50),
      );
    } else {
      setCallError(r.error);
      setHistory((h) =>
        [{ at: new Date().toLocaleString("pt-BR"), method: selected.method, path, status: null, durationMs: 0, ok: false }, ...h].slice(0, 50),
      );
    }
    setSending(false);
  }

  const pretty = (t: string) => {
    try {
      return JSON.stringify(JSON.parse(t), null, 2);
    } catch {
      return t;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="glass rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", connected ? "bg-emerald-500/15 text-emerald-400" : "bg-white/[0.05] text-muted-foreground")}>
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold">
              {connecting ? "Conectando…" : connected ? "Conectado à API Rodonaves" : "Desconectado"}
            </div>
            <div className="text-xs text-muted-foreground font-mono">{baseUrlValue || "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground">
            Credenciais protegidas · usuário e senha ocultos
          </span>
          <button
            onClick={doConnect}
            disabled={connecting}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            {connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Reconectar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/[0.04]",
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "conexao" && (
        <div className="glass rounded-2xl p-6 space-y-5 max-w-xl">
          <div>
            <div className="text-sm font-semibold">Autenticação</div>
            <p className="mt-1 text-xs text-muted-foreground">
              A conexão é feita automaticamente pelo servidor. As credenciais ficam em variáveis de ambiente
              criptografadas e nunca são exibidas, registradas ou enviadas ao navegador.
            </p>
          </div>
          <div className="grid gap-3">
            <label className="text-xs text-muted-foreground">
              Usuário
              <input value="••••••••" readOnly className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm tracking-[0.3em]" />
            </label>
            <label className="text-xs text-muted-foreground">
              Senha
              <input type="password" value="••••••••" readOnly className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm tracking-[0.3em]" />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={doConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plug className="h-4 w-4" />}
              Conectar
            </button>
            {connected && (
              <button
                onClick={async () => {
                  await disconnect({});
                  setConnected(false);
                  setExpiresAt(null);
                }}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
              >
                Encerrar sessão
              </button>
            )}
          </div>
          {connected && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Token válido {expiresAt ? `até ${new Date(expiresAt).toLocaleTimeString("pt-BR")}` : ""} (armazenado apenas no servidor)
            </div>
          )}
          {authError && (
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <AlertTriangle className="h-4 w-4" /> {authError}
            </div>
          )}
        </div>
      )}

      {(tab === "explorar" || tab === "docs") && (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="glass rounded-2xl p-4 space-y-3 h-fit">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Recursos</div>
              <button onClick={doDiscover} className="text-muted-foreground hover:text-foreground" title="Redescobrir">
                {discovering ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
              </button>
            </div>
            {discovering && <div className="text-xs text-muted-foreground">Lendo documentação…</div>}
            {discoverError && <div className="text-xs text-rose-400">{discoverError}</div>}
            <button
              onClick={() => setGroup(null)}
              className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", group === null ? "bg-primary/15 text-primary" : "hover:bg-white/[0.04]")}
            >
              Todos ({endpoints.length})
            </button>
            {groups.map(([g, n]) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={cn("w-full rounded-lg px-3 py-2 text-left text-sm capitalize", group === g ? "bg-primary/15 text-primary" : "hover:bg-white/[0.04]")}
              >
                {g} ({n})
              </button>
            ))}
            {!discovering && endpoints.length === 0 && (
              <div className="text-xs text-muted-foreground">Nenhum endpoint descoberto ainda.</div>
            )}
            <div className="pt-2 text-[11px] text-muted-foreground border-t border-white/[0.05]">
              {pagesRead} páginas de documentação analisadas
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-2xl divide-y divide-white/[0.04] max-h-[340px] overflow-y-auto">
              {visible.map((e) => (
                <button
                  key={e.id}
                  onClick={() => pick(e)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.03]",
                    selected?.id === e.id && "bg-primary/10",
                  )}
                >
                  <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", methodColor(e.method))}>{e.method}</span>
                  <span className="font-mono text-xs text-muted-foreground truncate">{e.path}</span>
                  <span className="ml-auto truncate text-xs">{e.summary}</span>
                </button>
              ))}
              {visible.length === 0 && <div className="px-4 py-6 text-sm text-muted-foreground">Nada para exibir.</div>}
            </div>

            {tab === "explorar" && selected && (
              <div className="glass rounded-2xl p-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", methodColor(selected.method))}>{selected.method}</span>
                    <span className="font-mono text-sm">{selected.path}</span>
                  </div>
                  {selected.description && <p className="mt-1 text-xs text-muted-foreground">{selected.description}</p>}
                </div>

                {selected.params.filter((p) => p.in !== "body").length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selected.params
                      .filter((p) => p.in !== "body")
                      .map((p) => (
                        <label key={`${p.in}-${p.name}`} className="text-xs text-muted-foreground">
                          {p.name}
                          {p.required && <span className="text-rose-400"> *</span>}
                          <span className="ml-1 opacity-60">({p.in} · {p.type})</span>
                          <input
                            value={values[p.name] ?? ""}
                            onChange={(ev) => setValues((v) => ({ ...v, [p.name]: ev.target.value }))}
                            className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground"
                          />
                        </label>
                      ))}
                  </div>
                )}

                {selected.method !== "GET" && (
                  <label className="block text-xs text-muted-foreground">
                    Corpo (JSON)
                    <textarea
                      value={bodyText}
                      onChange={(ev) => setBodyText(ev.target.value)}
                      rows={8}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-xs text-foreground"
                    />
                  </label>
                )}

                <button
                  onClick={send}
                  disabled={sending || !connected}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar requisição
                </button>

                {callError && (
                  <div className="flex items-center gap-2 text-xs text-rose-400">
                    <AlertTriangle className="h-4 w-4" /> {callError}
                  </div>
                )}

                {response && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className={cn("rounded-md px-2 py-1 font-bold", response.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400")}>
                        HTTP {response.status} {response.statusText}
                      </span>
                      <span className="text-muted-foreground">{response.durationMs} ms</span>
                    </div>
                    <pre className="max-h-[360px] overflow-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[11px] leading-relaxed">
                      {pretty(response.body) || "(vazio)"}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {tab === "docs" && (
              <div className="glass rounded-2xl p-5 space-y-4">
                <div className="text-sm font-semibold">Documentação automática</div>
                {visible.map((e) => (
                  <div key={e.id} className="rounded-xl border border-white/[0.06] p-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-bold", methodColor(e.method))}>{e.method}</span>
                      <span className="font-mono text-xs">{e.path}</span>
                    </div>
                    <div className="mt-1 text-sm">{e.summary}</div>
                    {e.params.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {e.params.map((p) => (
                          <li key={`${p.in}-${p.name}`}>
                            <span className="font-mono text-foreground">{p.name}</span> · {p.in} · {p.type}
                            {p.required ? " · obrigatório" : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "historico" && (
        <div className="glass rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04] text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 text-left font-medium">Quando</th>
                <th className="px-6 py-3 text-left font-medium">Método</th>
                <th className="px-6 py-3 text-left font-medium">Endpoint</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Tempo</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b border-white/[0.03] last:border-0">
                  <td className="px-6 py-3 text-muted-foreground">{h.at}</td>
                  <td className="px-6 py-3 font-mono text-xs">{h.method}</td>
                  <td className="px-6 py-3 font-mono text-xs">{h.path}</td>
                  <td className={cn("px-6 py-3 font-semibold", h.ok ? "text-emerald-400" : "text-rose-400")}>{h.status ?? "erro"}</td>
                  <td className="px-6 py-3 text-muted-foreground">{h.durationMs} ms</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground">
                    Nenhuma requisição realizada. Credenciais nunca são registradas aqui.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
