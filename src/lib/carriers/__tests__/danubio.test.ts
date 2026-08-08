import { describe, it, expect } from "vitest";
import { calculateDanubioFreight, danubioAdapter } from "../adapters/danubio";
import { calculateCubagem, validateFreightRequest } from "../types";

describe("Danúbio Freight Engine Tests", () => {
  it("should calculate Exemplo 1: 200kg, NF R$5.000 -> R$ 140", () => {
    const res = calculateDanubioFreight(200, 5000);
    expect(res.valor).toBe(140);
  });

  it("should calculate Exemplo 2: 80kg, NF R$10.000 -> R$ 150", () => {
    const res = calculateDanubioFreight(80, 10000);
    expect(res.valor).toBe(150);
  });

  it("should calculate Exemplo 3: 50kg, NF R$2.000 -> R$ 100 (mínimo)", () => {
    const res = calculateDanubioFreight(50, 2000);
    expect(res.valor).toBe(100);
  });

  it("should check Danúbio city coverage correctly", async () => {
    const resCampinas = await danubioAdapter.checkCoverage!("Campinas", "SP");
    expect(resCampinas.atende).toBe(true);

    const resUnknown = await danubioAdapter.checkCoverage!("CidadeInexistente", "XX");
    expect(resUnknown.atende).toBe(false);
  });

  it("should calculate cubagem correctly", () => {
    // 10x40x40 cm = 16.000 cm³ * 2 volumes = 32.000 cm³ = 0.032 m³
    const items = [{ alturaCm: 10, larguraCm: 40, comprimentoCm: 40, quantidade: 2 }];
    const cub = calculateCubagem(items);
    expect(cub).toBe(0.032);
  });

  it("should validate FreightRequest parameters", () => {
    const invalid = validateFreightRequest({ cepOrigem: "123", pesoKg: -5 });
    expect(invalid.length).toBeGreaterThan(0);

    const valid = validateFreightRequest({
      cepOrigem: "01001000",
      cepDestino: "13010001",
      pesoKg: 10,
      valorNF: 500,
      volumes: 1,
    });
    expect(valid.length).toBe(0);
  });
});
