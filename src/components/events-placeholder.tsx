"use client";

import { useMemo, useRef, useState } from "react";
import { formatCurrency, formatDate, todayInputValue } from "@/lib/format";
import { getCurrentMonthValue, getCurrentWeekValue, getMonthValue, getWeekValue } from "@/lib/periods";
import { EventRecord } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  initialRecords: EventRecord[];
};

export function EventsPlaceholder({ initialRecords }: Props) {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [data, setData] = useState(todayInputValue());
  const [pessoas, setPessoas] = useState("0");
  const [valorPorPessoa, setValorPorPessoa] = useState("0");
  const [custoStaff, setCustoStaff] = useState("0");
  const [custoExtras, setCustoExtras] = useState("0");
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecords[0]?.id ?? null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);

  const total = useMemo(() => {
    return Number(pessoas || 0) * Number(valorPorPessoa || 0) + Number(custoStaff || 0);
  }, [custoStaff, pessoas, valorPorPessoa]);

  const lucro = useMemo(() => {
    return total - Number(custoStaff || 0) - Number(custoExtras || 0);
  }, [custoExtras, custoStaff, total]);

  const custoTotalReal = useMemo(() => {
    return Number(custoStaff || 0) + Number(custoExtras || 0);
  }, [custoExtras, custoStaff]);

  const weeklyRevenue = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return records
      .filter((record) => getWeekValue(record.data) === currentWeek)
      .reduce((acc, record) => acc + record.total, 0);
  }, [records]);

  const monthlyRevenue = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return records
      .filter((record) => getMonthValue(record.data) === currentMonth)
      .reduce((acc, record) => acc + record.total, 0);
  }, [records]);

  const weeklyProfit = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return records
      .filter((record) => getWeekValue(record.data) === currentWeek)
      .reduce((acc, record) => acc + (record.total - record.custoStaff - record.custoExtras), 0);
  }, [records]);

  const monthlyProfit = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return records
      .filter((record) => getMonthValue(record.data) === currentMonth)
      .reduce((acc, record) => acc + (record.total - record.custoStaff - record.custoExtras), 0);
  }, [records]);

  const selectedRecord = useMemo(() => {
    return records.find((record) => record.id === selectedRecordId) ?? records[0] ?? null;
  }, [records, selectedRecordId]);

  function resetForm() {
    setCliente("");
    setTelefone("");
    setEndereco("");
    setData(todayInputValue());
    setPessoas("0");
    setValorPorPessoa("0");
    setCustoStaff("0");
    setCustoExtras("0");
  }

  function startEditing(record: EventRecord) {
    setSelectedRecordId(record.id);
    setEditingRecordId(record.id);
    setCliente(record.cliente);
    setTelefone(record.telefone);
    setEndereco(record.endereco);
    setData(record.data);
    setPessoas(String(record.pessoas));
    setValorPorPessoa(String(record.valorPorPessoa));
    setCustoStaff(String(record.custoStaff));
    setCustoExtras(String(record.custoExtras));
    setFeedback(`Editando evento de ${record.cliente}.`);

    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cancelEditing() {
    setEditingRecordId(null);
    resetForm();
    setFeedback("Edição cancelada.");
  }

  async function deleteRecord(record: EventRecord) {
    const confirmed = window.confirm(`Excluir o evento de ${record.cliente}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/event-records", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: record.id }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível excluir o evento.");
      return;
    }

    const nextRecords = records.filter((item) => item.id !== record.id);
    setRecords(nextRecords);

    if (selectedRecordId === record.id) {
      setSelectedRecordId(nextRecords[0]?.id ?? null);
    }

    if (editingRecordId === record.id) {
      setEditingRecordId(null);
      resetForm();
    }

    setFeedback("Evento excluído.");
  }

  async function handleSave() {
    if (!cliente.trim()) {
      setFeedback("Informe o cliente do evento.");
      return;
    }

    setIsSaving(true);
    setFeedback("");

    const editingRecord = editingRecordId ? records.find((record) => record.id === editingRecordId) : null;

    const response = await fetch("/api/event-records", {
      method: editingRecord ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingRecord?.id,
        cliente: cliente.trim(),
        telefone: telefone.trim(),
        endereco: endereco.trim(),
        data,
        pessoas: Number(pessoas || 0),
        valorPorPessoa: Number(valorPorPessoa || 0),
        custoStaff: Number(custoStaff || 0),
        custoExtras: Number(custoExtras || 0),
        total,
        criadoEm: editingRecord?.criadoEm,
      }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível salvar o evento.");
      setIsSaving(false);
      return;
    }

    const record = (await response.json()) as EventRecord;
    setRecords((current) =>
      editingRecord
        ? current.map((item) => (item.id === record.id ? record : item))
        : [record, ...current],
    );
    setSelectedRecordId(record.id);
    setEditingRecordId(null);
    resetForm();
    setFeedback(editingRecord ? "Evento atualizado com sucesso." : "Evento salvo com sucesso.");
    setIsSaving(false);
  }

  return (
    <section ref={formRef} className="card narrow-card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Controle simples</p>
          <h1>Eventos</h1>
        </div>
        <span className="badge">{editingRecordId ? "Editando evento" : "Módulo em uso"}</span>
      </div>

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
          <span>Eventos salvos</span>
          <strong>{records.length}</strong>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Nome do cliente</span>
          <input value={cliente} onChange={(event) => setCliente(event.target.value)} placeholder="Ex.: Empresa Exemplo" />
        </label>

        <label>
          <span>Telefone</span>
          <input value={telefone} onChange={(event) => setTelefone(event.target.value)} placeholder="Ex.: 11999999999" />
        </label>

        <label className="full-width">
          <span>Endereço</span>
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
          <span>Número de pessoas</span>
          <input type="number" min="0" value={pessoas} onChange={(event) => setPessoas(event.target.value)} />
        </label>

        <label>
          <span>Valor por pessoa</span>
          <input type="number" min="0" step="0.01" value={valorPorPessoa} onChange={(event) => setValorPorPessoa(event.target.value)} />
        </label>

        <label>
          <span>Custo de staff</span>
          <input type="number" min="0" step="0.01" value={custoStaff} onChange={(event) => setCustoStaff(event.target.value)} />
        </label>

        <label>
          <span>Insumos do evento</span>
          <input type="number" min="0" step="0.01" value={custoExtras} onChange={(event) => setCustoExtras(event.target.value)} />
        </label>
      </div>

      <div className="totals-box totals-box-four">
        <div>
          <span>Cliente</span>
          <strong>{cliente || "-"}</strong>
        </div>
        <div>
          <span>Total calculado</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
        <div>
          <span>Custo total real</span>
          <strong>{formatCurrency(custoTotalReal)}</strong>
        </div>
        <div>
          <span>Lucro real</span>
          <strong>{formatCurrency(lucro)}</strong>
        </div>
      </div>

      <div className="actions-row section-space">
        <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : editingRecordId ? "Salvar alterações" : "Salvar evento"}
        </button>
        {editingRecordId ? (
          <button className="ghost-button" type="button" onClick={cancelEditing}>
            Cancelar edição
          </button>
        ) : null}
      </div>

      {feedback ? <p className="feedback">{feedback}</p> : null}

      {selectedRecord ? (
        <div className="detail-panel section-space">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Evento aberto</p>
              <h2>{selectedRecord.cliente}</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => startEditing(selectedRecord)}>
              Editar evento
            </button>
            <button className="ghost-button" type="button" onClick={() => deleteRecord(selectedRecord)}>
              Excluir evento
            </button>
          </div>

          <div className="detail-grid">
            <div className="metric">
              <span>Telefone</span>
              <strong>{selectedRecord.telefone || "-"}</strong>
            </div>
            <div className="metric">
              <span>Data</span>
              <strong>{formatDate(selectedRecord.data)}</strong>
            </div>
            <div className="metric">
              <span>Pessoas</span>
              <strong>{selectedRecord.pessoas}</strong>
            </div>
            <div className="metric">
              <span>Total</span>
              <strong>{formatCurrency(selectedRecord.total)}</strong>
            </div>
            <div className="metric">
              <span>Custo real</span>
              <strong>{formatCurrency(selectedRecord.custoStaff + selectedRecord.custoExtras)}</strong>
            </div>
            <div className="metric">
              <span>Lucro real</span>
              <strong>{formatCurrency(selectedRecord.total - selectedRecord.custoStaff - selectedRecord.custoExtras)}</strong>
            </div>
          </div>

          <div className="detail-note">
            <strong>Endereço</strong>
            <p>{selectedRecord.endereco || "-"}</p>
          </div>
          <div className="detail-note">
            <strong>Resumo do evento</strong>
            <p>
              {selectedRecord.pessoas} pessoas • {formatCurrency(selectedRecord.valorPorPessoa)} por pessoa • Staff{" "}
              {formatCurrency(selectedRecord.custoStaff)} • Insumos {formatCurrency(selectedRecord.custoExtras)}
            </p>
          </div>
        </div>
      ) : null}

      <div className="records-list section-space">
        {records.map((record) => (
          <div key={record.id} className="record-card">
            <div>
              <strong>{record.cliente}</strong>
              <span>{record.telefone || "-"}</span>
              <span>{record.endereco || "-"}</span>
            </div>
            <div>
              <span>
                {record.pessoas} pessoas • {formatCurrency(record.valorPorPessoa)} por pessoa
              </span>
            </div>
            <div>
              <strong>{formatCurrency(record.total)}</strong>
              <span>{formatDate(record.data)}</span>
            </div>
            <div>
              <strong>Lucro</strong>
              <span>{formatCurrency(record.total - record.custoStaff - record.custoExtras)}</span>
            </div>
            <div>
              <strong>Custo real</strong>
              <span>{formatCurrency(record.custoStaff + record.custoExtras)}</span>
            </div>
            <div>
              <div className="inline-actions">
                <button
                  className={selectedRecord?.id === record.id ? "ghost-button small-button selected-button" : "ghost-button small-button"}
                  type="button"
                  onClick={() => setSelectedRecordId(record.id)}
                >
                  Ver evento
                </button>
                <button className="ghost-button small-button" type="button" onClick={() => startEditing(record)}>
                  Editar
                </button>
                <button className="ghost-button small-button" type="button" onClick={() => deleteRecord(record)}>
                  Excluir
                </button>
              </div>
            </div>
            <div>
              <a
                className="ghost-button small-button"
                href={buildWhatsAppUrl(
                  record.telefone,
                  `Olá, ${record.cliente}. Sobre o evento do dia ${formatDate(record.data)}...`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
