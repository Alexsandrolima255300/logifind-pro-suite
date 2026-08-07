// Cidades atendidas pela Danúbio Transportes (estado padrão: SP).
// Fonte única de verdade — quando houver persistência em banco, basta trocar
// a origem destes dados mantendo a mesma API (findDanubioCity).

export type DanubioCity = {
  cidade: string;
  estado: string;
  prazo: number;
  ativo: boolean;
};

export const DANUBIO_CIDADES: DanubioCity[] = [
  { cidade: "Campinas", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Hortolândia", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Indaiatuba", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Sumaré", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Vinhedo", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Valinhos", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Americana", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Santa Bárbara d'Oeste", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Sorocaba", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Leme", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Limeira", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Piracicaba", estado: "SP", prazo: 3, ativo: true },
  { cidade: "São Carlos", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Rio Claro", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Porto Ferreira", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Ribeirão Preto", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Bragança Paulista", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Araras", estado: "SP", prazo: 3, ativo: true },
  { cidade: "São Paulo", estado: "SP", prazo: 2, ativo: true },
  { cidade: "Barueri", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Diadema", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Guarulhos", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Mauá", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Osasco", estado: "SP", prazo: 3, ativo: true },
  { cidade: "São Caetano do Sul", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Santo André", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Embu das Artes", estado: "SP", prazo: 3, ativo: true },
  { cidade: "Itapecerica da Serra", estado: "SP", prazo: 3, ativo: true },
];

export function normalizeCity(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

export function findDanubioCity(cidade?: string, uf?: string): DanubioCity | null {
  if (!cidade) return null;
  const alvo = normalizeCity(cidade);
  const hit = DANUBIO_CIDADES.find(
    (c) => c.ativo && normalizeCity(c.cidade) === alvo && (!uf || c.estado === uf.toUpperCase()),
  );
  return hit ?? null;
}
