"use client";

import { useMemo, useRef, useState } from "react";
import { COMPANY_NAME } from "@/lib/brand";
import { formatCurrency, formatDate, formatDateTime, formatMonthLabel, todayInputValue } from "@/lib/format";
import { getCurrentMonthValue, getCurrentWeekValue, getMonthValue, getWeekValue } from "@/lib/periods";
import { CatalogProduct, FrozenOrder, FrozenOrderStatus } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  initialOrders: FrozenOrder[];
  initialProducts: CatalogProduct[];
};

type Quantities = Record<string, number>;

const statusLabels: Record<FrozenOrderStatus, string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

export function FrozenOrderManager({ initialOrders, initialProducts }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [products] = useState(initialProducts);
  const [selectedOrderId, setSelectedOrderId] = useState(initialOrders[0]?.id ?? null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [data, setData] = useState(todayInputValue());
  const [horario, setHorario] = useState("");
  const [tipoEntrega, setTipoEntrega] = useState<"entrega" | "retirada">("entrega");
  const [taxaEntrega, setTaxaEntrega] = useState("0");
  const [custoTotal, setCustoTotal] = useState("0");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [weekFilter, setWeekFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [monthlyCalculatorMonth, setMonthlyCalculatorMonth] = useState(getCurrentMonthValue());
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const formCardRef = useRef<HTMLElement | null>(null);
  const summaryCardRef = useRef<HTMLElement | null>(null);
  const [quantities, setQuantities] = useState<Quantities>(
    Object.fromEntries(initialProducts.map((product) => [product.id, 0])),
  );

  const selectedItems = useMemo(() => {
    return products
      .map((product) => {
        const quantidade = quantities[product.id] ?? 0;
        const total = quantidade * product.preco;
        return {
          productId: product.id,
          nome: product.nome,
          precoUnitario: product.preco,
          quantidade,
          total,
        };
      })
      .filter((item) => item.quantidade > 0);
  }, [products, quantities]);

  const subtotal = useMemo(
    () => selectedItems.reduce((acc, item) => acc + item.total, 0),
    [selectedItems],
  );

  const deliveryFeeValue = tipoEntrega === "retirada" ? 0 : Number(taxaEntrega || 0);
  const total = subtotal + deliveryFeeValue;
  const estimatedProfit = total - Number(custoTotal || 0);
  const selectedOrder = useMemo(() => {
    return orders.find((order) => order.id === selectedOrderId) ?? orders[0] ?? null;
  }, [orders, selectedOrderId]);
  const activeFiltersCount = [nameFilter, statusFilter, weekFilter, monthFilter].filter(Boolean).length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const nameMatches = !nameFilter || order.cliente.toLowerCase().includes(nameFilter.toLowerCase());
      const statusMatches = !statusFilter || order.status === statusFilter;
      const weekMatches = !weekFilter || getWeekValue(order.data) === weekFilter;
      const monthMatches = !monthFilter || getMonthValue(order.data) === monthFilter;
      return nameMatches && statusMatches && weekMatches && monthMatches;
    });
  }, [orders, nameFilter, statusFilter, weekFilter, monthFilter]);

  const dashboard = useMemo(() => {
    const totalVendido = filteredOrders.reduce((acc, order) => acc + order.total, 0);
    const totalTaxas = filteredOrders.reduce((acc, order) => acc + order.taxaEntrega, 0);
    const lucro = filteredOrders.reduce((acc, order) => acc + (order.total - order.custoTotal), 0);

    const quantidadePorProduto = products.map((product) => {
      const quantidade = filteredOrders.reduce((acc, order) => {
        const item = order.itens.find((entry) => entry.productId === product.id);
        return acc + (item?.quantidade ?? 0);
      }, 0);

      return {
        nome: product.nome,
        quantidade,
      };
    });

    return {
      totalVendido,
      totalTaxas,
      lucro,
      quantidadePorProduto,
    };
  }, [filteredOrders, products]);

  const weeklyRevenue = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return orders
      .filter((order) => getWeekValue(order.data) === currentWeek)
      .reduce((acc, order) => acc + order.total, 0);
  }, [orders]);

  const monthlyRevenue = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return orders
      .filter((order) => getMonthValue(order.data) === currentMonth)
      .reduce((acc, order) => acc + order.total, 0);
  }, [orders]);

  const weeklyProfit = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return orders
      .filter((order) => getWeekValue(order.data) === currentWeek)
      .reduce((acc, order) => acc + (order.total - order.custoTotal), 0);
  }, [orders]);

  const monthlyProfit = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return orders
      .filter((order) => getMonthValue(order.data) === currentMonth)
      .reduce((acc, order) => acc + (order.total - order.custoTotal), 0);
  }, [orders]);

  const monthlyCalculator = useMemo(() => {
    const filteredByMonth = orders.filter((order) => getMonthValue(order.data) === monthlyCalculatorMonth);

    return {
      pedidos: filteredByMonth.length,
      faturamento: filteredByMonth.reduce((acc, order) => acc + order.total, 0),
      taxas: filteredByMonth.reduce((acc, order) => acc + order.taxaEntrega, 0),
      lucro: filteredByMonth.reduce((acc, order) => acc + (order.total - order.custoTotal), 0),
    };
  }, [monthlyCalculatorMonth, orders]);

  const summaryText = useMemo(() => {
    if (!selectedOrder) {
      return "";
    }

    const lines = [
      COMPANY_NAME,
      `Cliente: ${selectedOrder.cliente}`,
      `Telefone: ${selectedOrder.telefone || "-"}`,
      `Endereço: ${selectedOrder.endereco || "-"}`,
      `Data: ${formatDate(selectedOrder.data)}`,
      `Horário: ${selectedOrder.horario || "-"}`,
      `Entrega: ${selectedOrder.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}`,
      "",
      "Item | Qtde | Unit | Total",
      ...selectedOrder.itens.map(
        (item) =>
          `${item.nome} | ${item.quantidade} | ${formatCurrency(item.precoUnitario)} | ${formatCurrency(item.total)}`,
      ),
      "",
      `Subtotal: ${formatCurrency(selectedOrder.subtotal)}`,
      `Entrega: ${formatCurrency(selectedOrder.taxaEntrega)}`,
      `Total: ${formatCurrency(selectedOrder.total)}`,
    ];

    return lines.join("\n");
  }, [selectedOrder]);

  function getDeliveryText(order: FrozenOrder) {
    const lines = [
      `${COMPANY_NAME} - Ficha de entrega`,
      `Cliente: ${order.cliente}`,
      `Telefone: ${order.telefone || "-"}`,
      `Data: ${formatDate(order.data)}`,
      `Horário: ${order.horario || "-"}`,
      `Endereço: ${order.endereco || "-"}`,
      `Entrega: ${order.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}`,
      "",
      "Itens:",
      ...order.itens.map((item) => `- ${item.quantidade}x ${item.nome}`),
    ];

    return lines.join("\n");
  }

  function updateQuantity(productId: string, delta: number) {
    setQuantities((current) => {
      const nextValue = Math.max(0, (current[productId] ?? 0) + delta);
      return {
        ...current,
        [productId]: nextValue,
      };
    });
  }

  function resetForm() {
    setCliente("");
    setTelefone("");
    setEndereco("");
    setData(todayInputValue());
    setHorario("");
    setTipoEntrega("entrega");
    setTaxaEntrega("0");
    setCustoTotal("0");
    setQuantities(Object.fromEntries(products.map((product) => [product.id, 0])));
  }

  function populateForm(order: FrozenOrder) {
    const nextQuantities = Object.fromEntries(products.map((product) => [product.id, 0]));

    order.itens.forEach((item) => {
      nextQuantities[item.productId] = item.quantidade;
    });

    setCliente(order.cliente);
    setTelefone(order.telefone);
    setEndereco(order.endereco);
    setData(order.data);
    setHorario(order.horario || "");
    setTipoEntrega(order.tipoEntrega);
    setTaxaEntrega(String(order.taxaEntrega));
    setCustoTotal(String(order.custoTotal));
    setQuantities(nextQuantities);
  }

  function clearFilters() {
    setNameFilter("");
    setStatusFilter("");
    setWeekFilter("");
    setMonthFilter("");
  }

  function openOrder(orderId: string) {
    setSelectedOrderId(orderId);

    window.requestAnimationFrame(() => {
      summaryCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function startEditing(order: FrozenOrder) {
    setSelectedOrderId(order.id);
    setEditingOrderId(order.id);
    populateForm(order);
    setFeedback(`Editando pedido de ${order.cliente}.`);

    window.requestAnimationFrame(() => {
      formCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cancelEditing() {
    setEditingOrderId(null);
    resetForm();
    setFeedback("Edição cancelada.");
  }

  async function deleteOrder(order: FrozenOrder) {
    const confirmed = window.confirm(`Excluir o pedido de ${order.cliente}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/frozen-orders", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: order.id }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível excluir o pedido.");
      return;
    }

    const nextOrders = orders.filter((item) => item.id !== order.id);
    setOrders(nextOrders);

    if (selectedOrderId === order.id) {
      setSelectedOrderId(nextOrders[0]?.id ?? null);
    }

    if (editingOrderId === order.id) {
      setEditingOrderId(null);
      resetForm();
    }

    setFeedback("Pedido excluído.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!cliente.trim()) {
      setFeedback("Informe o nome do cliente.");
      return;
    }

    if (selectedItems.length === 0) {
      setFeedback("Selecione pelo menos um produto.");
      return;
    }

    setIsSaving(true);
    setFeedback("");

    const editingOrder = editingOrderId ? orders.find((order) => order.id === editingOrderId) : null;
    const payload = {
      id: editingOrder?.id,
      cliente: cliente.trim(),
      telefone: telefone.trim(),
      endereco: endereco.trim(),
      data,
      horario: horario.trim(),
      tipoEntrega,
      status: editingOrder?.status ?? ("pendente" as FrozenOrderStatus),
      taxaEntrega: deliveryFeeValue,
      custoTotal: Number(custoTotal || 0),
      itens: selectedItems,
      subtotal,
      total,
      criadoEm: editingOrder?.criadoEm,
    };

    const response = await fetch("/api/frozen-orders", {
      method: editingOrder ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      setFeedback("Não foi possível salvar o pedido.");
      setIsSaving(false);
      return;
    }

    const savedOrder = (await response.json()) as FrozenOrder;
    setOrders((current) =>
      editingOrder
        ? current.map((order) => (order.id === savedOrder.id ? savedOrder : order))
        : [savedOrder, ...current],
    );
    setSelectedOrderId(savedOrder.id);
    setEditingOrderId(null);
    resetForm();
    setFeedback(editingOrder ? "Pedido atualizado com sucesso." : "Pedido salvo com sucesso.");
    setIsSaving(false);
  }

  async function copySummary() {
    if (!summaryText) {
      return;
    }

    await navigator.clipboard.writeText(summaryText);
    setFeedback("Resumo copiado para o WhatsApp.");
  }

  async function copyDeliveryText(order: FrozenOrder) {
    await navigator.clipboard.writeText(getDeliveryText(order));
    setFeedback("Ficha de entrega copiada para o motorista.");
  }

  function openDeliverySheet(order: FrozenOrder) {
    const printWindow = window.open("", "_blank", "width=520,height=760");

    if (!printWindow) {
      setFeedback("Não foi possível abrir a ficha de entrega.");
      return;
    }

    const itemsHtml = order.itens
      .map(
        (item) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #ddd;">${item.nome}</td>
            <td style="padding:8px 0;border-bottom:1px solid #ddd;text-align:right;">${item.quantidade}</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html lang="pt-BR">
        <head>
          <title>Ficha de entrega</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 10px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; padding-bottom: 8px; border-bottom: 2px solid #111; }
            .block { margin-bottom: 18px; }
            .label { font-size: 12px; text-transform: uppercase; color: #666; }
          </style>
        </head>
        <body>
          <h1>${COMPANY_NAME}</h1>
          <div class="block">
            <div class="label">Ficha de entrega</div>
            <p><strong>Cliente:</strong> ${order.cliente}</p>
            <p><strong>Data:</strong> ${formatDate(order.data)}</p>
            <p><strong>Horario:</strong> ${order.horario || "-"}</p>
            <p><strong>Endereço:</strong> ${order.endereco || "-"}</p>
            <p><strong>Tipo:</strong> ${order.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:right;">Qtde</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="page-grid">
      <section ref={formCardRef} className="card">
        <div className="hero-banner">
          <div>
            <p className="eyebrow">Operação de congelados</p>
            <h1>{COMPANY_NAME}</h1>
            <p className="hero-text">
              Monte pedidos rapidamente, gere um resumo limpo para WhatsApp e tenha uma ficha separada para o motorista sem mostrar os valores.
            </p>
          </div>
          <div className="hero-stats">
            <div>
              <span>Produtos fixos</span>
              <strong>{products.length}</strong>
            </div>
            <div>
              <span>Pedidos salvos</span>
              <strong>{orders.length}</strong>
            </div>
          </div>
        </div>

        <div className="section-heading">
          <div>
            <p className="eyebrow">Módulo completo</p>
            <h2>Congelados</h2>
          </div>
          <span className="badge">{editingOrderId ? "Editando pedido" : "Pronto para uso"}</span>
        </div>

        <form className="order-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              <span>Nome do cliente</span>
              <input value={cliente} onChange={(event) => setCliente(event.target.value)} placeholder="Ex.: Maria Clara" />
            </label>

            <label>
              <span>Telefone do cliente</span>
              <input value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder="Ex.: 11999999999" />
            </label>

            <label>
              <span>Endereço do cliente</span>
              <input
                value={endereco}
                onChange={(event) => setEndereco(event.target.value)}
                placeholder="Rua, número, complemento e bairro"
              />
            </label>

            <label>
              <span>Data</span>
              <input type="date" value={data} onChange={(event) => setData(event.target.value)} />
            </label>

            <label>
              <span>Horário</span>
              <input type="time" value={horario} onChange={(event) => setHorario(event.target.value)} />
            </label>

            <label>
              <span>Entrega ou retirada</span>
              <select
                value={tipoEntrega}
                onChange={(event) => {
                  const value = event.target.value as "entrega" | "retirada";
                  setTipoEntrega(value);
                  if (value === "retirada") {
                    setTaxaEntrega("0");
                  }
                }}
              >
                <option value="entrega">Entrega</option>
                <option value="retirada">Retirada</option>
              </select>
            </label>

            <label>
              <span>Taxa de entrega</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxaEntrega}
                disabled={tipoEntrega === "retirada"}
                onChange={(event) => setTaxaEntrega(event.target.value)}
              />
            </label>

            <label>
              <span>Custo total do pedido</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={custoTotal}
                onChange={(event) => setCustoTotal(event.target.value)}
              />
            </label>
          </div>

          <div className="product-list">
            {products.map((product) => {
              const quantidade = quantities[product.id] ?? 0;
              const totalItem = quantidade * product.preco;

              return (
                <div key={product.id} className="product-row">
                  <div>
                    <strong>{product.nome}</strong>
                    <span>{formatCurrency(product.preco)}</span>
                  </div>

                  <div className="qty-controls">
                    <button type="button" onClick={() => updateQuantity(product.id, -1)}>
                      -
                    </button>
                    <span>{quantidade}</span>
                    <button type="button" onClick={() => updateQuantity(product.id, 1)}>
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <span>Unitário</span>
                    <strong>{formatCurrency(product.preco)}</strong>
                  </div>

                  <div className="item-total">
                    <span>Total</span>
                    <strong>{formatCurrency(totalItem)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="totals-box totals-box-four">
            <div>
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div>
              <span>Entrega</span>
              <strong>{formatCurrency(deliveryFeeValue)}</strong>
            </div>
            <div className="total-highlight">
              <span>Total final</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div>
              <span>Lucro estimado</span>
              <strong>{formatCurrency(estimatedProfit)}</strong>
            </div>
          </div>

          <div className="actions-row">
            <button className="primary-button" type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : editingOrderId ? "Salvar alterações" : "Salvar pedido"}
            </button>
            {editingOrderId ? (
              <button className="ghost-button" type="button" onClick={cancelEditing}>
                Cancelar edição
              </button>
            ) : (
              <button className="ghost-button" type="button" onClick={resetForm}>
                Limpar
              </button>
            )}
          </div>

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </form>
      </section>

      <section className="stack">
        <article ref={summaryCardRef} className="card summary-card print-card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Resumo para print</p>
              <h2>{selectedOrder ? `Pedido de ${selectedOrder.cliente}` : "Último pedido"}</h2>
            </div>
            <div className="inline-actions no-print">
              <button className="ghost-button" type="button" onClick={copySummary} disabled={!selectedOrder}>
                Copiar texto
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => selectedOrder && copyDeliveryText(selectedOrder)}
                disabled={!selectedOrder}
              >
                Copiar entrega
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => selectedOrder && openDeliverySheet(selectedOrder)}
                disabled={!selectedOrder}
              >
                Ficha do motorista
              </button>
              <button className="primary-button" type="button" onClick={() => window.print()} disabled={!selectedOrder}>
                Imprimir
              </button>
              {selectedOrder?.telefone ? (
                <a
                  className="ghost-button"
                  href={buildWhatsAppUrl(selectedOrder.telefone, `Olá, ${selectedOrder.cliente}. Sobre o seu pedido...`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp cliente
                </a>
              ) : null}
              <button
                className="ghost-button"
                type="button"
                onClick={() => selectedOrder && startEditing(selectedOrder)}
                disabled={!selectedOrder}
              >
                Editar pedido
              </button>
              <button
                className="ghost-button"
                type="button"
                onClick={() => selectedOrder && deleteOrder(selectedOrder)}
                disabled={!selectedOrder}
              >
                Excluir pedido
              </button>
            </div>
          </div>

          {selectedOrder ? (
            <div className="summary-sheet">
              <div className="summary-header">
                <strong>{COMPANY_NAME}</strong>
                <span>{formatDate(selectedOrder.data)}</span>
              </div>
              <div className="summary-meta">
                <span>Cliente: {selectedOrder.cliente}</span>
                <span>{selectedOrder.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}</span>
              </div>
              <div className="summary-address">
                <span>Horário: {selectedOrder.horario || "-"}</span>
              </div>
              <div className="summary-address">
                <span>Telefone: {selectedOrder.telefone || "-"}</span>
              </div>
              <div className="summary-address">
                <span>Endereço: {selectedOrder.endereco || "-"}</span>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Qtde</th>
                    <th>Unit</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.itens.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.nome}</td>
                      <td>{item.quantidade}</td>
                      <td>{formatCurrency(item.precoUnitario)}</td>
                      <td>{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Subtotal</td>
                    <td>{formatCurrency(selectedOrder.subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3}>Entrega</td>
                    <td>{formatCurrency(selectedOrder.taxaEntrega)}</td>
                  </tr>
                  <tr className="grand-total">
                    <td colSpan={3}>Total</td>
                    <td>{formatCurrency(selectedOrder.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="empty-state">Salve um pedido para gerar o resumo compacto para WhatsApp.</p>
          )}
        </article>

        <article className="card">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Painel</p>
              <h2>Pedidos salvos</h2>
            </div>
            <div className="filters-row">
              <label className="week-filter">
                <span>Buscar cliente</span>
                <input type="text" value={nameFilter} onChange={(event) => setNameFilter(event.target.value)} placeholder="Nome do cliente" />
              </label>
              <label className="week-filter">
                <span>Filtrar por status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_producao">Em produção</option>
                  <option value="pronto">Pronto</option>
                  <option value="entregue">Entregue</option>
                </select>
              </label>
              <label className="week-filter">
                <span>Filtrar por semana</span>
                <input type="week" value={weekFilter} onChange={(event) => setWeekFilter(event.target.value)} />
              </label>
              <label className="week-filter">
                <span>Filtrar por mês</span>
                <input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} />
              </label>
              <button className="ghost-button filter-clear-button" type="button" onClick={clearFilters}>
                Limpar filtros
              </button>
            </div>
          </div>

          <p className="filter-summary">
            {activeFiltersCount > 0
              ? `${activeFiltersCount} filtro(s) ativo(s).`
              : "Nenhum filtro ativo. A lista mostra todos os pedidos."}
          </p>

          <div className="metrics-grid metrics-grid-wide">
            <div className="metric">
              <span>Faturamento semanal</span>
              <strong>{formatCurrency(weeklyRevenue)}</strong>
            </div>
            <div className="metric">
              <span>Faturamento mensal</span>
              <strong>{formatCurrency(monthlyRevenue)}</strong>
            </div>
            <div className="metric">
              <span>Lucro semanal</span>
              <strong>{formatCurrency(weeklyProfit)}</strong>
            </div>
            <div className="metric">
              <span>Lucro mensal</span>
              <strong>{formatCurrency(monthlyProfit)}</strong>
            </div>
            <div className="metric">
              <span>Total vendido no filtro</span>
              <strong>{formatCurrency(dashboard.totalVendido)}</strong>
            </div>
            <div className="metric">
              <span>Total de taxas no filtro</span>
              <strong>{formatCurrency(dashboard.totalTaxas)}</strong>
            </div>
            <div className="metric">
              <span>Lucro no filtro</span>
              <strong>{formatCurrency(dashboard.lucro)}</strong>
            </div>
            <div className="metric">
              <span>Pedidos</span>
              <strong>{filteredOrders.length}</strong>
            </div>
          </div>

          <div className="product-summary">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Calculadora</p>
                <h3>Faturamento mensal</h3>
              </div>
            </div>

            <div className="filters-row">
              <label className="week-filter">
                <span>Mês</span>
                <input
                  type="month"
                  value={monthlyCalculatorMonth}
                  onChange={(event) => setMonthlyCalculatorMonth(event.target.value)}
                />
              </label>
            </div>

            <p className="filter-summary">
              {monthlyCalculatorMonth ? `Resumo de ${formatMonthLabel(monthlyCalculatorMonth)}.` : "Escolha um mês."}
            </p>

            <div className="metrics-grid metrics-grid-wide">
              <div className="metric">
                <span>Pedidos</span>
                <strong>{monthlyCalculator.pedidos}</strong>
              </div>
              <div className="metric">
                <span>Faturamento</span>
                <strong>{formatCurrency(monthlyCalculator.faturamento)}</strong>
              </div>
              <div className="metric">
                <span>Taxas</span>
                <strong>{formatCurrency(monthlyCalculator.taxas)}</strong>
              </div>
              <div className="metric">
                <span>Lucro</span>
                <strong>{formatCurrency(monthlyCalculator.lucro)}</strong>
              </div>
            </div>
          </div>

          <div className="product-summary">
            <h3>Quantidade por produto</h3>
            <div className="summary-list">
              {dashboard.quantidadePorProduto.map((item) => (
                <div key={item.nome} className="summary-list-item">
                  <span>{item.nome}</span>
                  <strong>{item.quantidade}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                  <th>Data</th>
                  <th>Horário</th>
                  <th>Entrega</th>
                  <th>Status</th>
                  <th>Lucro</th>
                  <th>Total</th>
                  <th>Pedido</th>
                  <th>Motorista</th>
                  <th>Criado em</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.cliente}</td>
                    <td>{order.telefone || "-"}</td>
                    <td>{order.endereco || "-"}</td>
                    <td>{formatDate(order.data)}</td>
                    <td>{order.horario || "-"}</td>
                    <td>{order.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}</td>
                    <td>{statusLabels[order.status]}</td>
                    <td>{formatCurrency(order.total - order.custoTotal)}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className={selectedOrder?.id === order.id ? "ghost-button small-button selected-button" : "ghost-button small-button"}
                          type="button"
                          onClick={() => openOrder(order.id)}
                        >
                          Ver pedido
                        </button>
                        <button className="ghost-button small-button" type="button" onClick={() => startEditing(order)}>
                          Editar
                        </button>
                        <button className="ghost-button small-button" type="button" onClick={() => deleteOrder(order)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="inline-actions">
                        {order.telefone ? (
                          <a
                            className="ghost-button small-button"
                            href={buildWhatsAppUrl(order.telefone, `Olá, ${order.cliente}. Sobre o seu pedido...`)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            WhatsApp
                          </a>
                        ) : null}
                        <button className="ghost-button small-button" type="button" onClick={() => copyDeliveryText(order)}>
                          Copiar
                        </button>
                        <button className="ghost-button small-button" type="button" onClick={() => openDeliverySheet(order)}>
                          Entrega
                        </button>
                      </div>
                    </td>
                    <td>{formatDateTime(order.criadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 ? <p className="empty-state">Nenhum pedido encontrado com os filtros atuais.</p> : null}
          </div>
        </article>
      </section>
    </div>
  );
}
