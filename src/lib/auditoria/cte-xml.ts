import type { CteDocument } from "./types";

const text = (root: Document, names: string[]) => {
  for (const name of names) {
    const nodes = root.getElementsByTagNameNS("*", name);
    if (nodes.length && nodes[0].textContent?.trim()) return nodes[0].textContent.trim();
    const plain = root.getElementsByTagName(name);
    if (plain.length && plain[0].textContent?.trim()) return plain[0].textContent.trim();
  }
  return "";
};

const money = (value: string) => {
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

/** Parses an authorized CT-e XML locally. It never sends the XML to Sankhya and never writes data. */
export function parseCteXml(xml: string, origemArquivo = "CT-e.xml"): CteDocument {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("XML do CT-e inválido ou corrompido.");

  const numeroCTe = text(doc, ["nCT", "nCTe", "nCT-e"]);
  const numeroNF = text(doc, ["nNF", "nNf", "numeroNF"]);
  const valorFrete = money(text(doc, ["vTPrest", "vRec", "vFrete"]));
  const transportadora = text(doc, ["xNome", "transportadora"]);

  if (!numeroCTe || !numeroNF) {
    throw new Error("Não foi possível identificar o número do CT-e e/ou da NF no XML.");
  }

  return { numeroCTe, numeroNF, valorFrete, transportadora, origemArquivo };
}

export async function parseCteXmlFile(file: File): Promise<CteDocument> {
  return parseCteXml(await file.text(), file.name);
}
