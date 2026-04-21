create table if not exists public.frozen_orders (
  id text primary key,
  cliente text not null,
  telefone text not null default '',
  endereco text not null default '',
  data date not null,
  tipo_entrega text not null check (tipo_entrega in ('entrega', 'retirada')),
  taxa_entrega numeric(10, 2) not null default 0,
  custo_total numeric(10, 2) not null default 0,
  itens jsonb not null,
  subtotal numeric(10, 2) not null,
  total numeric(10, 2) not null,
  criado_em timestamptz not null default now()
);

create table if not exists public.order_notes (
  slug text primary key,
  anotacao text not null default '',
  atualizado_em timestamptz
);

create table if not exists public.encomenda_records (
  id text primary key,
  cliente text not null,
  telefone text not null default '',
  endereco text not null default '',
  data date not null,
  valor numeric(10, 2) not null default 0,
  custo numeric(10, 2) not null default 0,
  descricao text not null default '',
  criado_em timestamptz not null default now()
);

create table if not exists public.event_records (
  id text primary key,
  cliente text not null,
  telefone text not null default '',
  endereco text not null default '',
  data date not null,
  pessoas integer not null default 0,
  valor_por_pessoa numeric(10, 2) not null default 0,
  custo_staff numeric(10, 2) not null default 0,
  custo_extras numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  criado_em timestamptz not null default now()
);

create table if not exists public.product_catalog (
  id text primary key,
  nome text not null,
  preco numeric(10, 2) not null default 0,
  modulo text not null check (modulo in ('congelados', 'encomendas')),
  criado_em timestamptz not null default now()
);
