# FILOMENA GASTRONOMIE

Aplicação web simples para gestão da `FILOMENA GASTRONOMIE`, com estrutura pronta para três módulos:

- `Congelados`: completo
- `Entregas`: operacional
- `Produção do Dia`: operacional
- `Encomendas`: placeholder inicial
- `Eventos`: placeholder inicial

O projeto foi feito com `Next.js + React + TypeScript` e usa `JSON local` para armazenamento simples. O foco da interface é operação rápida no dia a dia, especialmente para o módulo de congelados.

Agora o projeto também está preparado para:

- abrir com cara de app no iPhone
- ser publicado online com `Vercel`
- usar `Supabase` como banco online quando você quiser sair do modo local

## Tecnologias

- `Next.js`
- `React`
- `TypeScript`
- `App Router`
- `JSON local` em `/data`

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Rode o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra no navegador:

```text
http://localhost:3000
```

## Usar no iPhone com jeito de app

Depois de publicar online ou abrir pela mesma rede local:

1. Abra o sistema no `Safari` do iPhone
2. Toque em `Compartilhar`
3. Toque em `Adicionar à Tela de Início`

O iPhone vai criar um ícone na tela inicial e o sistema abrirá em modo mais parecido com app.

## Estrutura principal

```text
src/
  app/
    api/
    encomendas/
    eventos/
    page.tsx
  components/
  data/
  lib/
data/
  frozen-orders.json
  order-notes.json
```

## Módulos

### 1. Congelados

Módulo completo com:

- cadastro fixo de produtos
- tela de pedido
- cálculo automático de subtotal, entrega e total
- campo de custo total do pedido
- faturamento e lucro semanal/mensal
- visual mais limpo para operação diária
- resumo compacto para WhatsApp
- botão para copiar texto
- botão para imprimir
- ficha de entrega para motorista sem mostrar valores
- painel com lista de pedidos
- filtro por semana
- filtro por mês
- status do pedido
- total vendido
- total de taxas
- quantidade por produto

### 2. Entregas

Módulo operacional com:

- lista de entregas do dia
- botão `Enviar para motorista`
- impressão de ficha sem valores
- atualização de status

### 3. Produção do Dia

Área operacional com:

- roteiro do dia sem valores
- congelados, encomendas e eventos na mesma tela
- botão para copiar
- botão para imprimir
- botão de WhatsApp para funcionária

### 4. Encomendas

Placeholder simples com:

- título da tela
- campo de anotação livre
- botão salvar
- registro simples de faturamento
- painel com faturamento e lucro semanal/mensal

Os dados ficam salvos em `data/order-notes.json`.

### 5. Eventos

Placeholder simples com:

- nome do cliente
- número de pessoas
- valor por pessoa
- custo de staff
- custos extras
- total calculado simples
- salvar evento
- painel com faturamento e lucro semanal/mensal

## Onde alterar produtos e preços

Edite este arquivo:

- [src/data/frozen-products.ts](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/src/data/frozen-products.ts)

Cada item segue esta estrutura:

```ts
{ id: "strogonoff-frango", nome: "Strogonoff de frango", preco: 37.9 }
```

## Onde ficam os pedidos salvos

Pedidos de congelados:

- [data/frozen-orders.json](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/data/frozen-orders.json)

Anotações de encomendas:

- [data/order-notes.json](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/data/order-notes.json)

## Modo online mais fácil

Hoje o sistema funciona localmente com `JSON`.

Se você quiser publicar online da forma mais simples, o projeto já está preparado para usar `Supabase`.

### O que muda quando for publicar

- localmente sem configuração extra: continua usando arquivos `JSON`
- online com `Supabase` configurado: passa a salvar pedidos e anotações no banco

### Arquivos preparados para isso

- [.env.example](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/.env.example)
- [src/lib/supabase.ts](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/src/lib/supabase.ts)
- [supabase/schema.sql](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/supabase/schema.sql)

### Variáveis de ambiente para publicação

Crie estas variáveis na hospedagem:

```text
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Passo a passo simples para publicar depois

1. Criar conta no `GitHub`
2. Criar conta no `Vercel`
3. Criar conta no `Supabase`
4. Rodar o SQL de [supabase/schema.sql](/Users/camillavaleixo/Documents/Codex/2026-04-20-crie-uma-aplica-o-web-simples/supabase/schema.sql)
5. Subir o projeto para o `GitHub`
6. Importar o projeto na `Vercel`
7. Adicionar as variáveis do `Supabase`
8. Publicar

Depois disso, basta abrir o link no iPhone e usar `Adicionar à Tela de Início`.

## Como evoluir os módulos no futuro

### Encomendas

Sugestões de evolução:

- transformar anotações em cards por cliente
- adicionar status do pedido
- incluir data de entrega
- cadastrar itens e valores
- gerar orçamento simples

### Eventos

Sugestões de evolução:

- detalhar cardápio por evento
- separar custos fixos e variáveis
- incluir margem desejada
- gerar proposta comercial
- salvar histórico de eventos por cliente

## Observações

- Todo o sistema está em português do Brasil
- Os valores usam `R$`
- As datas são exibidas no padrão brasileiro
- Não há login
- O código foi deixado organizado para facilitar manutenção
- A identidade visual e os textos já estão configurados com o nome `FILOMENA GASTRONOMIE`
- O projeto continua funcionando localmente mesmo sem Supabase configurado
