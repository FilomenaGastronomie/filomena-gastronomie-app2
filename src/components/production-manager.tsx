"use client";

import { useMemo, useState } from "react";
import { COMPANY_NAME } from "@/lib/brand";
import { formatDate, todayInputValue } from "@/lib/format";
import { FrozenOrder, EncomendaRevenueRecord, EventRecord } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  frozenOrders: FrozenOrder[];
  encomendas: EncomendaRevenueRecord[];
  eventos: EventRecord[];
};

export function ProductionManager({ frozenOrders, encomendas, eventos }: Props) {
  const [selectedDate, setSelectedDate] = useState(todayInputValue());
  const [employeePhone, setEmployeePhone] = useState("");
  const [feedback, setFeedback] = useState("");

  const frozenForDay = useMemo(
    () => frozenOrders.filter((order) => order.data === selectedDate),
    [frozenOrders, selectedDate],
  );

  const encomendasForDay = useMemo(
    () => encomendas.filter((record) => record.data === selectedDate),
    [encomendas, selectedDate],
  );

  const eventosForDay = useMemo(
    () => eventos.filter((record) => record.data === selectedDate),
    [eventos, selectedDate],
  );

  const productionText = useMemo(() => {
    const lines = [
      `${COMPANY_NAME} - Producao do Dia`,
      `Data: ${formatDate(selectedDate)}`,
      "",
      "CONGELADOS",
    ];

    if (frozenForDay.length === 0) {
      lines.push("- Nenhum pedido de congelados para hoje");
    } else {
      frozenForDay.forEach((order) => {
        lines.push(`- ${order.cliente}`);
        if (order.telefone) {
          lines.push(`  Telefone: ${order.telefone}`);
        }
        if (order.endereco) {
          lines.push(`  Endereco: ${order.endereco}`);
        }
        lines.push(`  Tipo: ${order.tipoEntrega === "entrega" ? "Entrega" : "Retirada"}`);
        order.itens.forEach((item) => {
          lines.push(`  ${item.quantidade}x ${item.nome}`);
        });
      });
    }

    lines.push("", "ENCOMENDAS");

    if (encomendasForDay.length === 0) {
      lines.push("- Nenhuma encomenda para hoje");
    } else {
      encomendasForDay.forEach((record) => {
        lines.push(`- ${record.cliente}`);
        if (record.telefone) {
          lines.push(`  Telefone: ${record.telefone}`);
        }
        if (record.endereco) {
          lines.push(`  Endereco: ${record.endereco}`);
        }
        lines.push(`  Producao: ${record.descricao || "Sem descricao"}`);
      });
    }

    lines.push("", "EVENTOS");

    if (eventosForDay.length === 0) {
      lines.push("- Nenhum evento para hoje");
    } else {
      eventosForDay.forEach((record) => {
        lines.push(`- ${record.cliente}`);
        if (record.telefone) {
          lines.push(`  Telefone: ${record.telefone}`);
        }
        if (record.endereco) {
          lines.push(`  Endereco: ${record.endereco}`);
        }
        lines.push(`  Evento para ${record.pessoas} pessoas`);
        lines.push(`  Cardapio/planejamento: ${record.pessoas} pessoas a ${record.valorPorPessoa} por pessoa`);
      });
    }

    return lines.join("\n");
  }, [selectedDate, frozenForDay, encomendasForDay, eventosForDay]);

  async function copyProductionText() {
    await navigator.clipboard.writeText(productionText);
    setFeedback("Producao do dia copiada.");
  }

  function printProduction() {
    const printWindow = window.open("", "_blank", "width=680,height=900");

    if (!printWindow) {
      setFeedback("Nao foi possivel abrir a impressao.");
      return;
    }

    const html = productionText.replace(/\n/g, "<br />");

    printWindow.document.write(`
      <html lang="pt-BR">
        <head>
          <title>Producao do dia</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; line-height: 1.6; }
            h1 { margin: 0 0 16px; font-size: 22px; }
          </style>
        </head>
        <body>
          <h1>${COMPANY_NAME}</h1>
          <div>${html}</div>
          <script>window.onload = function () { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <section className="card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Operacao interna</p>
          <h1>Producao do Dia</h1>
        </div>
      </div>

      <div className="metrics-grid metrics-grid-wide">
        <div className="metric">
          <span>Congelados</span>
          <strong>{frozenForDay.length}</strong>
        </div>
        <div className="metric">
          <span>Encomendas</span>
          <strong>{encomendasForDay.length}</strong>
        </div>
        <div className="metric">
          <span>Eventos</span>
          <strong>{eventosForDay.length}</strong>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Data</span>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>

        <label>
          <span>WhatsApp da funcionaria</span>
          <input
            value={employeePhone}
            onChange={(event) => setEmployeePhone(event.target.value)}
            placeholder="Ex.: 11999999999"
          />
        </label>
      </div>

      <div className="actions-row section-space">
        <button className="primary-button" type="button" onClick={copyProductionText}>
          Copiar producao
        </button>
        <button className="ghost-button" type="button" onClick={printProduction}>
          Imprimir roteiro
        </button>
        {employeePhone ? (
          <a
            className="ghost-button"
            href={buildWhatsAppUrl(employeePhone, productionText)}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp funcionaria
          </a>
        ) : null}
      </div>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      <div className="records-list section-space">
        <div className="record-card">
          <div className="production-text-block">
            {productionText.split("\n").map((line, index) => (
              <span key={`${line}-${index}`}>{line || " "}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
