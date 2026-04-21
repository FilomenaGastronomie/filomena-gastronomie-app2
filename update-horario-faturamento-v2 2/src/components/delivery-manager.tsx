"use client";

import { useMemo, useState } from "react";
import { COMPANY_NAME } from "@/lib/brand";
import { formatDate } from "@/lib/format";
import { FrozenOrder, FrozenOrderStatus } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  initialOrders: FrozenOrder[];
};

const statusLabels: Record<FrozenOrderStatus, string> = {
  pendente: "Pendente",
  em_producao: "Em produção",
  pronto: "Pronto",
  entregue: "Entregue",
};

export function DeliveryManager({ initialOrders }: Props) {
  const [orders, setOrders] = useState(initialOrders);
  const [feedback, setFeedback] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const activeFiltersCount = [nameFilter, statusFilter].filter(Boolean).length;

  const deliveryOrders = useMemo(() => {
    return orders.filter((order) => order.tipoEntrega === "entrega");
  }, [orders]);

  const todayDeliveries = useMemo(() => {
    return deliveryOrders.filter((order) => {
      const isToday = order.data === today;
      const nameMatches = !nameFilter || order.cliente.toLowerCase().includes(nameFilter.toLowerCase());
      const statusMatches = !statusFilter || order.status === statusFilter;
      return isToday && nameMatches && statusMatches;
    });
  }, [deliveryOrders, nameFilter, statusFilter, today]);

  function getDeliveryText(order: FrozenOrder) {
    return [
      `${COMPANY_NAME} - Entrega`,
      `Cliente: ${order.cliente}`,
      `Telefone: ${order.telefone || "-"}`,
      `Data: ${formatDate(order.data)}`,
      `Horário: ${order.horario || "-"}`,
      `Endereço: ${order.endereco || "-"}`,
      "",
      "Itens:",
      ...order.itens.map((item) => `- ${item.quantidade}x ${item.nome}`),
    ].join("\n");
  }

  async function copyDelivery(order: FrozenOrder) {
    await navigator.clipboard.writeText(getDeliveryText(order));
    setFeedback("Texto de entrega copiado.");
  }

  function printDelivery(order: FrozenOrder) {
    const printWindow = window.open("", "_blank", "width=520,height=760");

    if (!printWindow) {
      setFeedback("Não foi possível abrir a ficha.");
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
          <title>Entrega</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin: 0 0 8px; font-size: 22px; }
            p { margin: 0 0 10px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { text-align: left; padding-bottom: 8px; border-bottom: 2px solid #111; }
          </style>
        </head>
        <body>
          <h1>${COMPANY_NAME}</h1>
          <p><strong>Cliente:</strong> ${order.cliente}</p>
          <p><strong>Data:</strong> ${formatDate(order.data)}</p>
          <p><strong>Horario:</strong> ${order.horario || "-"}</p>
          <p><strong>Endereço:</strong> ${order.endereco || "-"}</p>
          <table>
            <thead>
              <tr><th>Item</th><th style="text-align:right;">Qtde</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  async function updateStatus(orderId: string, status: FrozenOrderStatus) {
    const response = await fetch("/api/frozen-orders", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: orderId, status }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível atualizar o status.");
      return;
    }

    setOrders((current) => current.map((order) => (order.id === orderId ? { ...order, status } : order)));
    setFeedback("Status atualizado.");
  }

  function clearFilters() {
    setNameFilter("");
    setStatusFilter("");
  }

  return (
    <section className="card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Operação diária</p>
          <h1>Entregas</h1>
        </div>
      </div>

      <div className="metrics-grid metrics-grid-wide">
        <div className="metric">
          <span>Entregas de hoje</span>
          <strong>{todayDeliveries.length}</strong>
        </div>
        <div className="metric">
          <span>Total de entregas</span>
          <strong>{deliveryOrders.length}</strong>
        </div>
      </div>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <div className="filters-row section-space">
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
        <button className="ghost-button filter-clear-button" type="button" onClick={clearFilters}>
          Limpar filtros
        </button>
      </div>

      <p className="filter-summary">
        {activeFiltersCount > 0
          ? `${activeFiltersCount} filtro(s) ativo(s).`
          : "Nenhum filtro ativo. A lista mostra as entregas do dia."}
      </p>

      <div className="records-list section-space">
        {todayDeliveries.map((order) => (
          <div key={order.id} className="record-card">
            <div>
              <strong>{order.cliente}</strong>
              <span>{order.telefone || "-"}</span>
              <span>{order.endereco || "-"}</span>
            </div>
            <div>
              <strong>{formatDate(order.data)}</strong>
              <span>{order.horario || "-"}</span>
              <span>{statusLabels[order.status]}</span>
            </div>
            <div className="record-actions">
              <select value={order.status} onChange={(event) => updateStatus(order.id, event.target.value as FrozenOrderStatus)}>
                <option value="pendente">Pendente</option>
                <option value="em_producao">Em produção</option>
                <option value="pronto">Pronto</option>
                <option value="entregue">Entregue</option>
              </select>
              <div className="inline-actions">
                {order.telefone ? (
                  <a
                    className="ghost-button small-button"
                    href={buildWhatsAppUrl(order.telefone, getDeliveryText(order))}
                    target="_blank"
                    rel="noreferrer"
                  >
                    WhatsApp
                  </a>
                ) : null}
                <button className="ghost-button small-button" type="button" onClick={() => copyDelivery(order)}>
                  Enviar para motorista
                </button>
                <button className="ghost-button small-button" type="button" onClick={() => printDelivery(order)}>
                  Imprimir
                </button>
              </div>
            </div>
          </div>
        ))}

        {todayDeliveries.length === 0 ? <p className="empty-state">Nenhuma entrega pendente para hoje.</p> : null}
      </div>
    </section>
  );
}
