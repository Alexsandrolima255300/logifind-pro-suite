import type { AuditRow, AuditSummary } from "./types";
import { STATUS_META } from "./types";

const brl = (v?: number) =>
  v === undefined ? "" : v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function exportCsv(rows: AuditRow[], summary: AuditSummary) {
  const head = [
    "Status",
    "Nota Fiscal",
    "CT-e",
    "Cliente",
    "Transportadora (NF)",
    "Transportadora (CT-e)",
    "Valor NF",
    "Valor CT-e",
    "Diferença",
    "Data emissão",
    "Observação",
  ];
  const lines = rows.map((r) => [
    STATUS_META[r.status].label,
    r.numeroNF,
    r.numeroCte ?? "",
    r.cliente ?? "",
    r.transportadoraNF ?? "",
    r.transportadoraCte ?? "",
    r.valorNF ?? "",
    r.valorCte ?? "",
    r.diferenca ?? "",
    r.dataEmissao ?? "",
    r.observacao ?? "",
  ]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    ["LogiFinder — Auditoria de Fretes (somente leitura)"],
    [`Notas: ${summary.totalNotas}`, `CT-es: ${summary.totalCtes}`, `Divergências: ${summary.divergencias}`],
    [],
    head,
    ...lines,
  ]
    .map((l) => l.map(esc).join(";"))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `auditoria-fretes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdf(rows: AuditRow[], summary: AuditSummary, periodo: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  const body = rows
    .map(
      (r) => `<tr>
      <td><span class="tag">${STATUS_META[r.status].dot} ${STATUS_META[r.status].label}</span></td>
      <td>${r.numeroNF}</td><td>${r.numeroCte ?? "—"}</td><td>${r.cliente ?? "—"}</td>
      <td>${r.transportadoraNF ?? "—"}</td><td>${r.transportadoraCte ?? "—"}</td>
      <td class="r">${brl(r.valorNF)}</td><td class="r">${brl(r.valorCte)}</td>
      <td class="r ${(r.diferenca ?? 0) !== 0 ? "neg" : ""}">${r.diferenca !== undefined ? brl(r.diferenca) : "—"}</td>
      <td>${r.observacao ?? ""}</td></tr>`,
    )
    .join("");

  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Auditoria de Fretes — LogiFinder</title>
  <style>
    *{box-sizing:border-box} body{font-family:-apple-system,Segoe UI,Inter,Arial,sans-serif;margin:32px;color:#111}
    h1{font-size:22px;margin:0} .sub{color:#666;font-size:12px;margin-top:4px}
    .head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:12px}
    .cards{display:flex;gap:12px;margin:20px 0}
    .card{flex:1;border:1px solid #ddd;border-radius:10px;padding:12px}
    .card b{display:block;font-size:20px} .card span{font-size:11px;color:#666;text-transform:uppercase;letter-spacing:.08em}
    table{width:100%;border-collapse:collapse;font-size:11px} th{background:#f4f4f5;text-align:left}
    th,td{border:1px solid #e4e4e7;padding:6px} .r{text-align:right} .neg{color:#b91c1c;font-weight:600}
    .tag{white-space:nowrap} footer{margin-top:24px;font-size:10px;color:#888}
    @media print{body{margin:12mm}}
  </style></head><body>
  <div class="head"><div><h1>Relatório de Auditoria de Fretes</h1>
  <div class="sub">BRASIL ENGRENAGENS E CORRENTES · LogiFinder · Período: ${periodo || "não informado"}</div></div>
  <div class="sub">Emitido em ${new Date().toLocaleString("pt-BR")}</div></div>
  <div class="cards">
    <div class="card"><span>Notas analisadas</span><b>${summary.totalNotas}</b></div>
    <div class="card"><span>CT-es encontrados</span><b>${summary.totalCtes}</b></div>
    <div class="card"><span>Conferidos</span><b>${summary.conferidos}</b></div>
    <div class="card"><span>Divergências</span><b>${summary.divergencias}</b></div>
    <div class="card"><span>Diferença total</span><b>${brl(summary.diferencaTotal)}</b></div>
  </div>
  <table><thead><tr><th>Status</th><th>NF</th><th>CT-e</th><th>Cliente</th><th>Transp. (NF)</th><th>Transp. (CT-e)</th><th>Valor NF</th><th>Valor CT-e</th><th>Diferença</th><th>Observação</th></tr></thead>
  <tbody>${body}</tbody></table>
  <footer>Documento gerado automaticamente pelo agente de auditoria do LogiFinder em modo somente leitura. Nenhum dado de origem foi alterado.</footer>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)<\/script>
  </body></html>`);
  win.document.close();
}
