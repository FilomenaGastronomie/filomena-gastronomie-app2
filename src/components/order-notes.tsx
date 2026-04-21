"use client";

import { useMemo, useRef, useState } from "react";
import { formatCurrency, formatDate, formatDateTime, todayInputValue } from "@/lib/format";
import { getCurrentMonthValue, getCurrentWeekValue, getMonthValue, getWeekValue } from "@/lib/periods";
import { CatalogProduct, EncomendaRevenueRecord } from "@/lib/types";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Props = {
  initialText: string;
  updatedAt: string | null;
  initialRecords: EncomendaRevenueRecord[];
  catalogProducts: CatalogProduct[];
};

export function OrderNotes({ initialText, updatedAt, initialRecords, catalogProducts }: Props) {
  const [text, setText] = useState(initialText);
  const [savedAt, setSavedAt] = useState(updatedAt);
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecordId, setSelectedRecordId] = useState(initialRecords[0]?.id ?? null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [data, setData] = useState(todayInputValue());
  const [valor, setValor] = useState("0");
  const [custo, setCusto] = useState("0");
  const [descricao, setDescricao] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const formRef = useRef<HTMLElement | null>(null);

  const weeklyRevenue = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return records
      .filter((record) => getWeekValue(record.data) === currentWeek)
      .reduce((acc, record) => acc + record.valor, 0);
  }, [records]);

  const monthlyRevenue = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return records
      .filter((record) => getMonthValue(record.data) === currentMonth)
      .reduce((acc, record) => acc + record.valor, 0);
  }, [records]);

  const weeklyProfit = useMemo(() => {
    const currentWeek = getCurrentWeekValue();
    return records
      .filter((record) => getWeekValue(record.data) === currentWeek)
      .reduce((acc, record) => acc + (record.valor - record.custo), 0);
  }, [records]);

  const monthlyProfit = useMemo(() => {
    const currentMonth = getCurrentMonthValue();
    return records
      .filter((record) => getMonthValue(record.data) === currentMonth)
      .reduce((acc, record) => acc + (record.valor - record.custo), 0);
  }, [records]);

  const selectedRecord = useMemo(() => {
    return records.find((record) => record.id === selectedRecordId) ?? records[0] ?? null;
  }, [records, selectedRecordId]);

  function resetRecordForm() {
    setCliente("");
    setTelefone("");
    setEndereco("");
    setData(todayInputValue());
    setValor("0");
    setCusto("0");
    setDescricao("");
  }

  function startEditing(record: EncomendaRevenueRecord) {
    setSelectedRecordId(record.id);
    setEditingRecordId(record.id);
    setCliente(record.cliente);
    setTelefone(record.telefone);
    setEndereco(record.endereco);
    setData(record.data);
    setValor(String(record.valor));
    setCusto(String(record.custo));
    setDescricao(record.descricao);
    setFeedback(`Editando registro de ${record.cliente}.`);

    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function cancelEditing() {
    setEditingRecordId(null);
    resetRecordForm();
    setFeedback("Edição cancelada.");
  }

  function addProductToDescription(product: CatalogProduct) {
    setDescricao((current) => {
      if (!current.trim()) {
        return product.nome;
      }

      return `${current}, ${product.nome}`;
    });
  }

  async function deleteRecord(record: EncomendaRevenueRecord) {
    const confirmed = window.confirm(`Excluir o registro de ${record.cliente}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/encomenda-records", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: record.id }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível excluir o registro.");
      return;
    }

    const nextRecords = records.filter((item) => item.id !== record.id);
    setRecords(nextRecords);

    if (selectedRecordId === record.id) {
      setSelectedRecordId(nextRecords[0]?.id ?? null);
    }

    if (editingRecordId === record.id) {
      setEditingRecordId(null);
      resetRecordForm();
    }

    setFeedback("Registro excluído.");
  }

  async function handleSave() {
    setIsSaving(true);
    setFeedback("");

    const response = await fetch("/api/order-notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anotacao: text }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível salvar a anotação.");
      setIsSaving(false);
      return;
    }

    const data = (await response.json()) as { atualizadoEm: string };
    setSavedAt(data.atualizadoEm);
    setFeedback("Anotação salva.");
    setIsSaving(false);
  }

  async function handleSaveRecord() {
    if (!cliente.trim()) {
      setFeedback("Informe o cliente da encomenda.");
      return;
    }

    setIsSavingRecord(true);
    setFeedback("");

    const editingRecord = editingRecordId ? records.find((record) => record.id === editingRecordId) : null;

    const response = await fetch("/api/encomenda-records", {
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
        valor: Number(valor || 0),
        custo: Number(custo || 0),
        descricao: descricao.trim(),
        criadoEm: editingRecord?.criadoEm,
      }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível salvar o faturamento de encomendas.");
      setIsSavingRecord(false);
      return;
    }

    const record = (await response.json()) as EncomendaRevenueRecord;
    setRecords((current) =>
      editingRecord
        ? current.map((item) => (item.id === record.id ? record : item))
        : [record, ...current],
    );
    setSelectedRecordId(record.id);
    setEditingRecordId(null);
    resetRecordForm();
    setFeedback(editingRecord ? "Registro de encomenda atualizado." : "Faturamento de encomenda salvo.");
    setIsSavingRecord(false);
  }

  return (
    <section ref={formRef} className="card narrow-card">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Controle simples</p>
          <h1>Encomendas</h1>
        </div>
        <span className="badge">{editingRecordId ? "Editando registro" : "Módulo em uso"}</span>
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
          <span>Registros</span>
          <strong>{records.length}</strong>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Cliente</span>
          <input value={cliente} onChange={(event) => setCliente(event.target.value)} placeholder="Ex.: Ana Paula" />
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
          <span>Valor da encomenda</span>
          <input type="number" min="0" step="0.01" value={valor} onChange={(event) => setValor(event.target.value)} />
        </label>

        <label>
          <span>Custo</span>
          <input type="number" min="0" step="0.01" value={custo} onChange={(event) => setCusto(event.target.value)} />
        </label>

        <label className="full-width">
          <span>Descrição</span>
          <input value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Ex.: bolo, doces e bem-casados" />
        </label>
      </div>

      <div className="actions-row section-space">
        <button className="primary-button" type="button" onClick={handleSaveRecord} disabled={isSavingRecord}>
          {isSavingRecord ? "Salvando..." : editingRecordId ? "Salvar alterações" : "Salvar faturamento"}
        </button>
        {editingRecordId ? (
          <button className="ghost-button" type="button" onClick={cancelEditing}>
            Cancelar edição
          </button>
        ) : null}
      </div>

      <div className="product-reference-box">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Base de produtos</p>
            <h2>Produtos de encomendas</h2>
          </div>
        </div>

        <div className="inline-actions product-chip-list">
          {catalogProducts.map((product) => (
            <button key={product.id} className="ghost-button small-button" type="button" onClick={() => addProductToDescription(product)}>
              {product.nome}
            </button>
          ))}
        </div>

        {catalogProducts.length === 0 ? <p className="empty-state">Cadastre produtos em Configurações para usar aqui.</p> : null}
      </div>

      <label className="notes-field">
        <span>Anotações livres</span>
        <textarea
          rows={10}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Use este espaço para registrar observações rápidas, pedidos especiais e ideias para evoluir o módulo."
        />
      </label>

      <div className="actions-row">
        <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Salvar anotação"}
        </button>
      </div>

      {savedAt ? <p className="muted-text">Última atualização: {formatDateTime(savedAt)}</p> : null}
      {feedback ? <p className="feedback">{feedback}</p> : null}

      {selectedRecord ? (
        <div className="detail-panel section-space">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Registro aberto</p>
              <h2>{selectedRecord.cliente}</h2>
            </div>
            <button className="ghost-button" type="button" onClick={() => startEditing(selectedRecord)}>
              Editar registro
            </button>
            <button className="ghost-button" type="button" onClick={() => deleteRecord(selectedRecord)}>
              Excluir registro
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
              <span>Valor</span>
              <strong>{formatCurrency(selectedRecord.valor)}</strong>
            </div>
            <div className="metric">
              <span>Custo</span>
              <strong>{formatCurrency(selectedRecord.custo)}</strong>
            </div>
            <div className="metric">
              <span>Lucro</span>
              <strong>{formatCurrency(selectedRecord.valor - selectedRecord.custo)}</strong>
            </div>
          </div>

          <div className="detail-note">
            <strong>Endereço</strong>
            <p>{selectedRecord.endereco || "-"}</p>
          </div>
          <div className="detail-note">
            <strong>Descrição</strong>
            <p>{selectedRecord.descricao || "Sem descrição"}</p>
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
              <span>{record.descricao || "Sem descrição"}</span>
            </div>
            <div>
              <strong>{formatCurrency(record.valor)}</strong>
              <span>{formatDate(record.data)}</span>
            </div>
            <div>
              <strong>Lucro</strong>
              <span>{formatCurrency(record.valor - record.custo)}</span>
            </div>
            <div>
              <div className="inline-actions">
                <button
                  className={selectedRecord?.id === record.id ? "ghost-button small-button selected-button" : "ghost-button small-button"}
                  type="button"
                  onClick={() => setSelectedRecordId(record.id)}
                >
                  Ver registro
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
                  `Olá, ${record.cliente}. Sobre a encomenda do dia ${formatDate(record.data)}...`,
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
