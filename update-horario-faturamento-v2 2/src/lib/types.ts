export type DeliveryType = "entrega" | "retirada";
export type FrozenOrderStatus = "pendente" | "em_producao" | "pronto" | "entregue";

export type FrozenProduct = {
  id: string;
  nome: string;
  preco: number;
};

export type ProductModule = "congelados" | "encomendas";

export type CatalogProduct = {
  id: string;
  nome: string;
  preco: number;
  modulo: ProductModule;
  criadoEm: string;
};

export type FrozenOrderItem = {
  productId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  total: number;
};

export type FrozenOrder = {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  horario: string;
  tipoEntrega: DeliveryType;
  status: FrozenOrderStatus;
  taxaEntrega: number;
  custoTotal: number;
  itens: FrozenOrderItem[];
  subtotal: number;
  total: number;
  criadoEm: string;
};

export type EncomendaRevenueRecord = {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  horario: string;
  tipoEntrega: DeliveryType;
  valor: number;
  custo: number;
  descricao: string;
  criadoEm: string;
};

export type EventRecord = {
  id: string;
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  pessoas: number;
  valorPorPessoa: number;
  custoStaff: number;
  custoExtras: number;
  total: number;
  criadoEm: string;
};
