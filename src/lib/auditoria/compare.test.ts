import { describe, expect, it } from "vitest";
import { compareInvoicesAndCtes } from "./compare";

describe("compareInvoicesAndCtes", () => {
  it("conferes equal NF and CTe", () => {
    const { summary, results } = compareInvoicesAndCtes(
      [{ numeroNF: "123", valorFrete: 100, transportadora: "Rodonaves", cliente: "Cliente", dataEmissao: "2026-08-10" }],
      [{ numeroCTe: "999", numeroNF: "123", valorFrete: 100, transportadora: "Rodonaves", origemArquivo: "999.xml" }],
    );
    expect(summary.conferidos).toBe(1);
    expect(results[0].status).toBe("CONFERIDO");
  });

  it("flags value and carrier divergences", () => {
    const { results } = compareInvoicesAndCtes(
      [{ numeroNF: "1", valorFrete: 100, transportadora: "A", cliente: "C", dataEmissao: "2026-08-10" }],
      [{ numeroCTe: "2", numeroNF: "1", valorFrete: 120, transportadora: "B", origemArquivo: "2.xml" }],
    );
    expect(results[0].status).toBe("TRANSPORTADORA_DIVERGENTE");
  });

  it("detects missing documents", () => {
    const { results } = compareInvoicesAndCtes(
      [{ numeroNF: "1", valorFrete: 100, transportadora: "A", cliente: "C", dataEmissao: "2026-08-10" }],
      [{ numeroCTe: "2", numeroNF: "9", valorFrete: 120, transportadora: "A", origemArquivo: "2.xml" }],
    );
    expect(results.map((r) => r.status)).toEqual(["CTE_NAO_ENCONTRADO", "NF_NAO_ENCONTRADA"]);
  });
});
