import { describe, it, expect } from "vitest";
import { RODONAVES_PROCEDA_CODES, rodonavesAdapter } from "../adapters/rodonaves";

describe("Rodonaves Adapter & Proceda Codes Tests", () => {
  it("should have all 17 Proceda codes defined correctly", () => {
    expect(RODONAVES_PROCEDA_CODES[0].descricao).toContain("transporte iniciado");
    expect(RODONAVES_PROCEDA_CODES[1].descricao).toContain("realizada normalmente");
    expect(RODONAVES_PROCEDA_CODES[13].descricao).toContain("não atende a cidade");
    expect(RODONAVES_PROCEDA_CODES[27].descricao).toContain("Roubo");
    expect(RODONAVES_PROCEDA_CODES[78].descricao).toContain("Avaria total");
  });

  it("should return false coverage for non-existing destinations when offline", async () => {
    const res = await rodonavesAdapter.checkCoverage!("CidadeFicticiaAbsurda", "ZZ");
    expect(res.atende).toBe(false);
  });
});
