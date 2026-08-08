import type { Cte, NotaFiscal } from "./types";

// Parsing 100% local e somente leitura de XMLs de NF-e e CT-e.
const text = (el: Element | Document, tag: string) =>
  el.getElementsByTagName(tag)?.[0]?.textContent?.trim() ?? "";

const num = (v: string) => {
  const n = parseFloat((v || "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : parseFloat(v) || 0;
};

export function parseXml(content: string): Document | null {
  try {
    const doc = new DOMParser().parseFromString(content, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) return null;
    return doc;
  } catch {
    return null;
  }
}

export function parseNfeXml(content: string): NotaFiscal | null {
  const doc = parseXml(content);
  if (!doc || !doc.getElementsByTagName("infNFe").length) return null;
  const ide = doc.getElementsByTagName("ide")[0];
  const dest = doc.getElementsByTagName("dest")[0];
  const transporta = doc.getElementsByTagName("transporta")[0];
  const total = doc.getElementsByTagName("ICMSTot")[0];

  const numeroNF = ide ? text(ide, "nNF") : "";
  if (!numeroNF) return null;

  return {
    numeroNF,
    valorFrete: total ? num(text(total, "vFrete")) : 0,
    transportadora: transporta ? text(transporta, "xNome") : "",
    cliente: dest ? text(dest, "xNome") : "",
    dataEmissao: ide ? text(ide, "dhEmi") || text(ide, "dEmi") : "",
    origem: "xml",
  };
}

export function parseCteXml(content: string): Cte | null {
  const doc = parseXml(content);
  if (!doc || !doc.getElementsByTagName("infCte").length) return null;
  const ide = doc.getElementsByTagName("ide")[0];
  const emit = doc.getElementsByTagName("emit")[0];
  const vPrest = doc.getElementsByTagName("vPrest")[0];

  const numeroCte = ide ? text(ide, "nCT") : "";
  const infNFeEls = doc.getElementsByTagName("infNFe");
  const infNFEls = doc.getElementsByTagName("infNF");
  let numeroNF = "";
  if (infNFeEls.length) {
    const chave = text(infNFeEls[0], "chave");
    numeroNF = chave ? chave.slice(25, 34) : "";
  }
  if (!numeroNF && infNFEls.length) numeroNF = text(infNFEls[0], "nDoc");
  if (!numeroNF) numeroNF = text(doc, "nDoc");

  if (!numeroCte) return null;

  return {
    numeroCte,
    numeroNF,
    valorFrete: vPrest ? num(text(vPrest, "vTPrest") || text(vPrest, "vRec")) : 0,
    transportadora: emit ? text(emit, "xNome") : "",
    dataEmissao: ide ? text(ide, "dhEmi") : "",
    origem: "xml",
  };
}

export type ParsedFiles = { notas: NotaFiscal[]; ctes: Cte[]; ignorados: string[] };

export async function parseFiles(files: File[]): Promise<ParsedFiles> {
  const out: ParsedFiles = { notas: [], ctes: [], ignorados: [] };
  for (const file of files) {
    const isXml = /\.xml$/i.test(file.name);
    if (!isXml) {
      out.ignorados.push(`${file.name} — apenas XML é lido automaticamente (PDF requer lançamento manual).`);
      continue;
    }
    const content = await file.text();
    const cte = parseCteXml(content);
    if (cte) {
      out.ctes.push(cte);
      continue;
    }
    const nfe = parseNfeXml(content);
    if (nfe) {
      out.notas.push(nfe);
      continue;
    }
    out.ignorados.push(`${file.name} — XML não reconhecido como NF-e ou CT-e.`);
  }
  return out;
}
