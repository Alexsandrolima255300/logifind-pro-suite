// Mock dataset for LogiFinder Phase 1 (no backend).

export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO" | "MA"
  | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI" | "RJ" | "RN"
  | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO";

export const ESTADOS: { uf: UF; nome: string }[] = [
  { uf: "AC", nome: "Acre" }, { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" }, { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" }, { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" }, { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" }, { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" }, { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" }, { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" }, { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" }, { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" }, { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" }, { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" }, { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" }, { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
];

export type CarrierId = "rodonaves" | "braspress" | "danubio" | "alfa" | "uniao" | "jadlog";

export type Carrier = {
  id: CarrierId;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  site: string;
  contato: string;
  prazoMedio: number;
  rating: number;
  ativo: boolean;
  fatorCubagem: number; // kg/m³
  valorPorKg: number;
  taxaMinima: number;
  adValorem: number; // % da NF
  gris: number; // %
};

export const CARRIERS: Carrier[] = [
  { id: "rodonaves", nome: "Rodonaves Transportes", cnpj: "44.914.992/0001-03", telefone: "(16) 3512-6600", email: "atendimento@rodonaves.com.br", site: "rodonaves.com.br", contato: "Central de Atendimento", prazoMedio: 3, rating: 4.6, ativo: true, fatorCubagem: 300, valorPorKg: 2.85, taxaMinima: 120, adValorem: 0.25, gris: 0.10 },
  { id: "braspress", nome: "Braspress Transportes", cnpj: "48.740.351/0001-13", telefone: "(11) 3429-3000", email: "sac@braspress.com.br", site: "braspress.com", contato: "SAC Braspress", prazoMedio: 4, rating: 4.4, ativo: true, fatorCubagem: 300, valorPorKg: 2.72, taxaMinima: 110, adValorem: 0.30, gris: 0.12 },
  { id: "danubio", nome: "Danúbio Transportes", cnpj: "60.409.075/0001-52", telefone: "(11) 2431-1400", email: "comercial@danubio.com.br", site: "danubio.com.br", contato: "Comercial", prazoMedio: 2, rating: 4.5, ativo: true, fatorCubagem: 300, valorPorKg: 0.70, taxaMinima: 100, adValorem: 0, gris: 0 },
  { id: "alfa", nome: "Alfa Transportes", cnpj: "84.641.868/0001-51", telefone: "(48) 3216-6500", email: "atendimento@alfatransportes.com.br", site: "alfatransportes.com.br", contato: "Central", prazoMedio: 5, rating: 4.2, ativo: true, fatorCubagem: 300, valorPorKg: 2.55, taxaMinima: 95, adValorem: 0.25, gris: 0.10 },
  { id: "uniao", nome: "União Express", cnpj: "05.617.611/0001-73", telefone: "(11) 4991-8000", email: "operacoes@uniaoexpress.com.br", site: "uniaoexpress.com.br", contato: "Operações", prazoMedio: 3, rating: 4.3, ativo: true, fatorCubagem: 300, valorPorKg: 2.62, taxaMinima: 100, adValorem: 0.20, gris: 0.10 },
  { id: "jadlog", nome: "Jadlog Logística", cnpj: "04.884.082/0001-35", telefone: "(11) 3563-9500", email: "atendimento@jadlog.com.br", site: "jadlog.com.br", contato: "Atendimento", prazoMedio: 4, rating: 4.4, ativo: true, fatorCubagem: 250, valorPorKg: 2.90, taxaMinima: 90, adValorem: 0.25, gris: 0.12 },
];

// Coverage matrix (UF x carriers)
type CoverRow = { uf: UF; rodonaves: boolean; braspress: boolean; danubio: boolean; alfa: boolean; uniao: boolean; jadlog: boolean };
const T = true, F = false;
export const COVERAGE: CoverRow[] = [
  { uf: "AC", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: F, jadlog: T },
  { uf: "AL", rodonaves: T, braspress: T, danubio: F, alfa: F, uniao: T, jadlog: T },
  { uf: "AP", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: F, jadlog: T },
  { uf: "AM", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: F, jadlog: T },
  { uf: "BA", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "CE", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "DF", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "ES", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "GO", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "MA", rodonaves: T, braspress: T, danubio: F, alfa: F, uniao: T, jadlog: T },
  { uf: "MT", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "MS", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "MG", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "PA", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: T, jadlog: T },
  { uf: "PB", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "PR", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "PE", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "PI", rodonaves: T, braspress: T, danubio: F, alfa: F, uniao: T, jadlog: T },
  { uf: "RJ", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "RN", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "RS", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "RO", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: F, jadlog: T },
  { uf: "RR", rodonaves: F, braspress: T, danubio: F, alfa: F, uniao: F, jadlog: T },
  { uf: "SC", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "SP", rodonaves: T, braspress: T, danubio: T, alfa: T, uniao: T, jadlog: T },
  { uf: "SE", rodonaves: T, braspress: T, danubio: F, alfa: T, uniao: T, jadlog: T },
  { uf: "TO", rodonaves: T, braspress: T, danubio: F, alfa: F, uniao: T, jadlog: T },
];

export function coverageFor(uf: UF): CarrierId[] {
  const row = COVERAGE.find((r) => r.uf === uf);
  if (!row) return [];
  const list: CarrierId[] = [];
  if (row.rodonaves) list.push("rodonaves");
  if (row.braspress) list.push("braspress");
  if (row.danubio) list.push("danubio");
  if (row.alfa) list.push("alfa");
  if (row.uniao) list.push("uniao");
  if (row.jadlog) list.push("jadlog");
  return list;
}

export const CIDADES_POR_UF: Partial<Record<UF, string[]>> = {
  SP: ["São Paulo", "Campinas", "Santos", "Ribeirão Preto", "Sorocaba", "São José dos Campos"],
  RJ: ["Rio de Janeiro", "Niterói", "Petrópolis", "Nova Iguaçu", "Duque de Caxias"],
  MG: ["Belo Horizonte", "Uberlândia", "Uberaba", "Juiz de Fora", "Poços de Caldas", "Contagem"],
  PR: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
  SC: ["Florianópolis", "Joinville", "Blumenau", "Chapecó"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista"],
  PE: ["Recife", "Olinda", "Caruaru"],
  CE: ["Fortaleza", "Juazeiro do Norte"],
  GO: ["Goiânia", "Aparecida de Goiânia", "Anápolis"],
  DF: ["Brasília"],
  ES: ["Vitória", "Vila Velha", "Serra"],
  MT: ["Cuiabá", "Várzea Grande"],
  MS: ["Campo Grande", "Dourados"],
  PA: ["Belém", "Ananindeua"],
  AM: ["Manaus"],
  MA: ["São Luís"],
  PB: ["João Pessoa", "Campina Grande"],
  RN: ["Natal"],
  PI: ["Teresina"],
  SE: ["Aracaju"],
  AL: ["Maceió"],
  TO: ["Palmas"],
  RO: ["Porto Velho"],
  AC: ["Rio Branco"],
  RR: ["Boa Vista"],
  AP: ["Macapá"],
};

// Clientes
export type Cliente = {
  id: string; razaoSocial: string; nomeFantasia: string; cnpj: string;
  cidade: string; uf: UF; email: string; telefone: string; contato: string;
  totalPedidos: number; totalComprado: number; ultimaCompra: string;
};

export const CLIENTES: Cliente[] = [
  { id: "CLI-001", razaoSocial: "Metalúrgica Nova Aurora Ltda", nomeFantasia: "Nova Aurora", cnpj: "12.345.678/0001-90", cidade: "Curitiba", uf: "PR", email: "compras@novaaurora.com.br", telefone: "(41) 3222-4400", contato: "Ana Ribeiro", totalPedidos: 148, totalComprado: 2840000, ultimaCompra: "2026-07-18" },
  { id: "CLI-002", razaoSocial: "Eletrocom Distribuidora S/A", nomeFantasia: "Eletrocom", cnpj: "22.111.987/0001-45", cidade: "Rio de Janeiro", uf: "RJ", email: "logistica@eletrocom.com.br", telefone: "(21) 2555-9800", contato: "Rafael Souza", totalPedidos: 92, totalComprado: 1620000, ultimaCompra: "2026-07-20" },
  { id: "CLI-003", razaoSocial: "Farma Mineira Ltda", nomeFantasia: "FarmaMG", cnpj: "33.888.222/0001-11", cidade: "Belo Horizonte", uf: "MG", email: "sac@farmamg.com.br", telefone: "(31) 3444-2200", contato: "Juliana Prado", totalPedidos: 204, totalComprado: 3980000, ultimaCompra: "2026-07-19" },
  { id: "CLI-004", razaoSocial: "Sul Máquinas e Peças", nomeFantasia: "Sul Máquinas", cnpj: "44.555.101/0001-88", cidade: "Porto Alegre", uf: "RS", email: "compras@sulmaquinas.com.br", telefone: "(51) 3021-7700", contato: "Diego Menezes", totalPedidos: 61, totalComprado: 890000, ultimaCompra: "2026-07-15" },
  { id: "CLI-005", razaoSocial: "Nordeste Alimentos Ltda", nomeFantasia: "Nordeste Foods", cnpj: "55.222.404/0001-19", cidade: "Recife", uf: "PE", email: "expedicao@nordestefoods.com.br", telefone: "(81) 3322-6600", contato: "Carla Bezerra", totalPedidos: 133, totalComprado: 2150000, ultimaCompra: "2026-07-21" },
  { id: "CLI-006", razaoSocial: "Bahia Têxtil Ltda", nomeFantasia: "Bahia Têxtil", cnpj: "66.777.303/0001-27", cidade: "Salvador", uf: "BA", email: "compras@bahiatextil.com.br", telefone: "(71) 3266-1400", contato: "Marcelo Andrade", totalPedidos: 47, totalComprado: 640000, ultimaCompra: "2026-07-10" },
];

// Pedidos
export type StatusPedido =
  | "recebido" | "analise" | "aprovado" | "separacao" | "conferencia"
  | "embalagem" | "aguardando_coleta" | "coletado" | "em_transporte"
  | "cd" | "saiu_entrega" | "entregue" | "cancelado";

export const STATUS_LABEL: Record<StatusPedido, string> = {
  recebido: "Pedido recebido",
  analise: "Em análise",
  aprovado: "Aprovado",
  separacao: "Separação",
  conferencia: "Conferência",
  embalagem: "Embalagem",
  aguardando_coleta: "Aguardando coleta",
  coletado: "Coletado",
  em_transporte: "Em transporte",
  cd: "Centro de distribuição",
  saiu_entrega: "Saiu para entrega",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const STATUS_ORDER: StatusPedido[] = [
  "recebido", "analise", "aprovado", "separacao", "conferencia", "embalagem",
  "aguardando_coleta", "coletado", "em_transporte", "cd", "saiu_entrega", "entregue",
];

export type TimelineEvent = {
  status: StatusPedido; data: string; hora: string; usuario: string; obs?: string;
};

export type Pedido = {
  id: string;
  numero: string;
  clienteId: string;
  vendedor: string;
  origemCidade: string; origemUf: UF;
  destinoCidade: string; destinoUf: UF;
  transportadora: CarrierId;
  motorista: string; veiculo: string;
  produtos: { descricao: string; qtd: number }[];
  volumes: number; peso: number; cubagem: number; valor: number;
  dataVenda: string; previsao: string;
  codigoRastreio: string;
  status: StatusPedido;
  timeline: TimelineEvent[];
  atrasado: boolean;
};

function tl(items: [StatusPedido, string, string, string, string?][]): TimelineEvent[] {
  return items.map(([status, data, hora, usuario, obs]) => ({ status, data, hora, usuario, obs }));
}

export const PEDIDOS: Pedido[] = [
  {
    id: "PED-10548", numero: "10548", clienteId: "CLI-001", vendedor: "Marcos Costa",
    origemCidade: "São Paulo", origemUf: "SP", destinoCidade: "Curitiba", destinoUf: "PR",
    transportadora: "rodonaves", motorista: "João Batista", veiculo: "Truck MB-2521 · PLR-3H45",
    produtos: [{ descricao: "Peças metálicas usinadas", qtd: 4 }, { descricao: "Chapa de aço 2mm", qtd: 12 }],
    volumes: 12, peso: 420, cubagem: 1.44, valor: 38000,
    dataVenda: "2026-07-18", previsao: "2026-07-22", codigoRastreio: "RD-9821-4471",
    status: "em_transporte", atrasado: false,
    timeline: tl([
      ["recebido", "2026-07-18", "09:12", "Sistema"],
      ["analise", "2026-07-18", "09:14", "Bianca (Comercial)"],
      ["aprovado", "2026-07-18", "10:02", "Marcos Costa"],
      ["separacao", "2026-07-18", "13:40", "Expedição SP"],
      ["conferencia", "2026-07-18", "16:20", "Expedição SP"],
      ["embalagem", "2026-07-19", "08:15", "Expedição SP"],
      ["aguardando_coleta", "2026-07-19", "10:00", "Expedição SP"],
      ["coletado", "2026-07-19", "15:44", "Rodonaves", "Motorista João Batista"],
      ["em_transporte", "2026-07-20", "06:30", "Rodonaves", "Saída CD São Paulo"],
    ]),
  },
  {
    id: "PED-10549", numero: "10549", clienteId: "CLI-002", vendedor: "Marcos Costa",
    origemCidade: "Campinas", origemUf: "SP", destinoCidade: "Rio de Janeiro", destinoUf: "RJ",
    transportadora: "braspress", motorista: "Silvio Ramos", veiculo: "Toco VW-9160 · MYT-6821",
    produtos: [{ descricao: "Componentes eletrônicos", qtd: 30 }],
    volumes: 8, peso: 890, cubagem: 2.10, valor: 62000,
    dataVenda: "2026-07-19", previsao: "2026-07-23", codigoRastreio: "BP-4471-9982",
    status: "saiu_entrega", atrasado: false,
    timeline: tl([
      ["recebido", "2026-07-19", "08:05", "Sistema"],
      ["aprovado", "2026-07-19", "09:00", "Marcos Costa"],
      ["separacao", "2026-07-19", "11:22", "Expedição Campinas"],
      ["embalagem", "2026-07-19", "15:10", "Expedição Campinas"],
      ["coletado", "2026-07-20", "10:00", "Braspress"],
      ["em_transporte", "2026-07-20", "18:20", "Braspress"],
      ["cd", "2026-07-21", "06:00", "Braspress", "CD Rio de Janeiro"],
      ["saiu_entrega", "2026-07-21", "07:40", "Braspress"],
    ]),
  },
  {
    id: "PED-10550", numero: "10550", clienteId: "CLI-003", vendedor: "Priscila Vaz",
    origemCidade: "São Paulo", origemUf: "SP", destinoCidade: "Belo Horizonte", destinoUf: "MG",
    transportadora: "rodonaves", motorista: "—", veiculo: "—",
    produtos: [{ descricao: "Medicamentos refrigerados", qtd: 200 }],
    volumes: 24, peso: 1240, cubagem: 3.20, valor: 128000,
    dataVenda: "2026-07-20", previsao: "2026-07-24", codigoRastreio: "RD-1200-8815",
    status: "separacao", atrasado: false,
    timeline: tl([
      ["recebido", "2026-07-20", "07:44", "Sistema"],
      ["aprovado", "2026-07-20", "09:15", "Priscila Vaz"],
      ["separacao", "2026-07-20", "14:30", "Expedição SP"],
    ]),
  },
  {
    id: "PED-10551", numero: "10551", clienteId: "CLI-004", vendedor: "Marcos Costa",
    origemCidade: "São Paulo", origemUf: "SP", destinoCidade: "Porto Alegre", destinoUf: "RS",
    transportadora: "alfa", motorista: "—", veiculo: "—",
    produtos: [{ descricao: "Peças de reposição", qtd: 15 }],
    volumes: 6, peso: 310, cubagem: 0.98, valor: 24000,
    dataVenda: "2026-07-15", previsao: "2026-07-20", codigoRastreio: "AL-3390-2201",
    status: "em_transporte", atrasado: true,
    timeline: tl([
      ["recebido", "2026-07-15", "10:00", "Sistema"],
      ["aprovado", "2026-07-15", "11:00", "Marcos Costa"],
      ["separacao", "2026-07-15", "16:00", "Expedição SP"],
      ["coletado", "2026-07-16", "14:00", "Alfa"],
      ["em_transporte", "2026-07-17", "08:00", "Alfa", "Atraso reportado — chuvas na rota"],
    ]),
  },
  {
    id: "PED-10552", numero: "10552", clienteId: "CLI-005", vendedor: "Priscila Vaz",
    origemCidade: "São Paulo", origemUf: "SP", destinoCidade: "Recife", destinoUf: "PE",
    transportadora: "jadlog", motorista: "Airton Melo", veiculo: "Truck IV-3320 · LEO-2287",
    produtos: [{ descricao: "Alimentos secos", qtd: 80 }],
    volumes: 20, peso: 560, cubagem: 1.80, valor: 44000,
    dataVenda: "2026-07-17", previsao: "2026-07-22", codigoRastreio: "JL-6620-5544",
    status: "entregue", atrasado: false,
    timeline: tl([
      ["recebido", "2026-07-17", "09:00", "Sistema"],
      ["aprovado", "2026-07-17", "10:00", "Priscila Vaz"],
      ["separacao", "2026-07-17", "13:00", "Expedição SP"],
      ["coletado", "2026-07-18", "10:00", "Jadlog"],
      ["em_transporte", "2026-07-18", "18:00", "Jadlog"],
      ["cd", "2026-07-20", "06:00", "Jadlog", "CD Recife"],
      ["saiu_entrega", "2026-07-21", "07:00", "Jadlog"],
      ["entregue", "2026-07-21", "11:24", "Jadlog", "Recebido por Carla Bezerra"],
    ]),
  },
  {
    id: "PED-10553", numero: "10553", clienteId: "CLI-006", vendedor: "Marcos Costa",
    origemCidade: "São Paulo", origemUf: "SP", destinoCidade: "Salvador", destinoUf: "BA",
    transportadora: "braspress", motorista: "—", veiculo: "—",
    produtos: [{ descricao: "Tecidos", qtd: 42 }],
    volumes: 14, peso: 720, cubagem: 2.60, valor: 51000,
    dataVenda: "2026-07-21", previsao: "2026-07-26", codigoRastreio: "BP-8830-7712",
    status: "aprovado", atrasado: false,
    timeline: tl([
      ["recebido", "2026-07-21", "08:20", "Sistema"],
      ["analise", "2026-07-21", "08:45", "Bianca"],
      ["aprovado", "2026-07-21", "09:15", "Marcos Costa"],
    ]),
  },
];

export const OCORRENCIAS = [
  { id: "OC-201", pedido: "PED-10551", tipo: "Atraso na entrega", descricao: "Chuvas fortes na BR-116 · previsão revisada 22/07", data: "2026-07-20", hora: "14:22", responsavel: "Alfa Transportes", status: "em_andamento" },
  { id: "OC-202", pedido: "PED-10549", tipo: "Endereço incorreto", descricao: "Motorista solicitou confirmação do bairro", data: "2026-07-21", hora: "08:12", responsavel: "Braspress", status: "resolvida" },
  { id: "OC-203", pedido: "PED-10550", tipo: "Documentação", descricao: "Aguardando XML da NF-e", data: "2026-07-20", hora: "10:00", responsavel: "Comercial", status: "pendente" },
];

export const NOTIFICACOES = [
  { id: 1, titulo: "Pedido PED-10552 entregue", desc: "Recebido por Carla Bezerra · Recife, PE", tempo: "há 12 min", lida: false, tipo: "sucesso" as const },
  { id: 2, titulo: "Pedido PED-10551 em atraso", desc: "Chuvas fortes na BR-116 · nova previsão 22/07", tempo: "há 2 h", lida: false, tipo: "alerta" as const },
  { id: 3, titulo: "Nova cotação recebida", desc: "COT-8247 · São Paulo → Salvador · 720kg", tempo: "há 3 h", lida: false, tipo: "info" as const },
  { id: 4, titulo: "Pedido PED-10549 saiu para entrega", desc: "Braspress · Rio de Janeiro, RJ", tempo: "há 5 h", lida: true, tipo: "info" as const },
  { id: 5, titulo: "Cadastro sincronizado", desc: "128 cidades da Jadlog importadas com sucesso", tempo: "ontem", lida: true, tipo: "sucesso" as const },
];

export const USUARIOS = [
  { id: "U-01", nome: "Marcos Costa", email: "marcos@logifinder.io", perfil: "Administrador", ativo: true, ultimoAcesso: "há 2 min" },
  { id: "U-02", nome: "Priscila Vaz", email: "priscila@logifinder.io", perfil: "Vendedor", ativo: true, ultimoAcesso: "há 40 min" },
  { id: "U-03", nome: "Bianca Toledo", email: "bianca@logifinder.io", perfil: "Supervisor", ativo: true, ultimoAcesso: "há 3 h" },
  { id: "U-04", nome: "Ricardo Alves", email: "ricardo@logifinder.io", perfil: "Expedição", ativo: true, ultimoAcesso: "ontem" },
  { id: "U-05", nome: "Ana Ribeiro", email: "ana@novaaurora.com.br", perfil: "Cliente", ativo: false, ultimoAcesso: "há 4 dias" },
];

export const CIDADES_ATENDIDAS = [
  { cidade: "São Paulo", uf: "SP" as UF, transportadora: "Rodonaves", prazo: 1 },
  { cidade: "Campinas", uf: "SP" as UF, transportadora: "Rodonaves", prazo: 1 },
  { cidade: "Curitiba", uf: "PR" as UF, transportadora: "Rodonaves", prazo: 2 },
  { cidade: "Belo Horizonte", uf: "MG" as UF, transportadora: "Braspress", prazo: 2 },
  { cidade: "Rio de Janeiro", uf: "RJ" as UF, transportadora: "Braspress", prazo: 2 },
  { cidade: "Porto Alegre", uf: "RS" as UF, transportadora: "Alfa", prazo: 4 },
  { cidade: "Salvador", uf: "BA" as UF, transportadora: "Jadlog", prazo: 5 },
  { cidade: "Recife", uf: "PE" as UF, transportadora: "Jadlog", prazo: 5 },
  { cidade: "Fortaleza", uf: "CE" as UF, transportadora: "União Express", prazo: 5 },
  { cidade: "Brasília", uf: "DF" as UF, transportadora: "Rodonaves", prazo: 3 },
  { cidade: "Goiânia", uf: "GO" as UF, transportadora: "Rodonaves", prazo: 3 },
  { cidade: "Uberlândia", uf: "MG" as UF, transportadora: "Braspress", prazo: 2 },
];

export const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function getCliente(id: string) {
  return CLIENTES.find((c) => c.id === id);
}
export function getCarrier(id: CarrierId) {
  return CARRIERS.find((c) => c.id === id)!;
}
export function getPedido(id: string) {
  return PEDIDOS.find((p) => p.id === id || p.numero === id);
}
