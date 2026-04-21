"use client";

import { useMemo, useState } from "react";
import { CatalogProduct, ProductModule } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

type Props = {
  initialProducts: CatalogProduct[];
};

const moduleLabels: Record<ProductModule, string> = {
  congelados: "Congelados",
  encomendas: "Encomendas",
};

export function ProductSettings({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("0");
  const [modulo, setModulo] = useState<ProductModule>("congelados");
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const groupedProducts = useMemo(() => {
    return {
      congelados: products.filter((product) => product.modulo === "congelados"),
      encomendas: products.filter((product) => product.modulo === "encomendas"),
    };
  }, [products]);

  function resetForm() {
    setNome("");
    setPreco("0");
    setModulo("congelados");
  }

  function startEditing(product: CatalogProduct) {
    setEditingProductId(product.id);
    setNome(product.nome);
    setPreco(String(product.preco));
    setModulo(product.modulo);
    setFeedback(`Editando produto ${product.nome}.`);
  }

  function cancelEditing() {
    setEditingProductId(null);
    resetForm();
    setFeedback("Edição cancelada.");
  }

  async function handleSave() {
    if (!nome.trim()) {
      setFeedback("Informe o nome do produto.");
      return;
    }

    setIsSaving(true);
    setFeedback("");

    const editingProduct = editingProductId ? products.find((product) => product.id === editingProductId) : null;

    const response = await fetch("/api/product-catalog", {
      method: editingProduct ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingProduct?.id,
        nome: nome.trim(),
        preco: Number(preco || 0),
        modulo,
        criadoEm: editingProduct?.criadoEm,
      }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível salvar o produto.");
      setIsSaving(false);
      return;
    }

    const savedProduct = (await response.json()) as CatalogProduct;
    setProducts((current) =>
      editingProduct
        ? current
            .map((product) => (product.id === savedProduct.id ? savedProduct : product))
            .sort((a, b) => a.nome.localeCompare(b.nome))
        : [...current, savedProduct].sort((a, b) => a.nome.localeCompare(b.nome)),
    );
    setEditingProductId(null);
    resetForm();
    setFeedback(editingProduct ? "Produto atualizado." : "Produto adicionado.");
    setIsSaving(false);
  }

  async function deleteProduct(product: CatalogProduct) {
    const confirmed = window.confirm(`Excluir o produto ${product.nome}?`);

    if (!confirmed) {
      return;
    }

    const response = await fetch("/api/product-catalog", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: product.id }),
    });

    if (!response.ok) {
      setFeedback("Não foi possível excluir o produto.");
      return;
    }

    setProducts((current) => current.filter((item) => item.id !== product.id));

    if (editingProductId === product.id) {
      setEditingProductId(null);
      resetForm();
    }

    setFeedback("Produto excluído.");
  }

  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Configuração interna</p>
          <h1>Produtos</h1>
        </div>
        <span className="badge">{editingProductId ? "Editando produto" : "Cadastros ativos"}</span>
      </div>

      <div className="hero-banner">
        <div>
          <p className="eyebrow">Uso diário</p>
          <h2>Altere preços e acrescente itens sem mexer em código</h2>
          <p className="hero-text">
            Cadastre aqui os produtos de congelados e as opções de encomendas. O módulo de congelados usa essa lista direto no pedido, e encomendas usa como base rápida para descrição.
          </p>
        </div>
        <div className="hero-stats">
          <div>
            <span>Congelados</span>
            <strong>{groupedProducts.congelados.length}</strong>
          </div>
          <div>
            <span>Encomendas</span>
            <strong>{groupedProducts.encomendas.length}</strong>
          </div>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Módulo</span>
          <select value={modulo} onChange={(event) => setModulo(event.target.value as ProductModule)}>
            <option value="congelados">Congelados</option>
            <option value="encomendas">Encomendas</option>
          </select>
        </label>

        <label>
          <span>Nome do produto</span>
          <input value={nome} onChange={(event) => setNome(event.target.value)} placeholder="Ex.: Lasanha de berinjela" />
        </label>

        <label>
          <span>Preço base</span>
          <input type="number" min="0" step="0.01" value={preco} onChange={(event) => setPreco(event.target.value)} />
        </label>
      </div>

      <div className="actions-row section-space">
        <button className="primary-button" type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Salvando..." : editingProductId ? "Salvar alterações" : "Adicionar produto"}
        </button>
        {editingProductId ? (
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

      <div className="settings-grid section-space">
        {(["congelados", "encomendas"] as ProductModule[]).map((currentModule) => (
          <div key={currentModule} className="product-settings-panel">
            <div className="section-heading compact">
              <div>
                <p className="eyebrow">Catálogo</p>
                <h2>{moduleLabels[currentModule]}</h2>
              </div>
            </div>

            <div className="records-list">
              {groupedProducts[currentModule].map((product) => (
                <div key={product.id} className="record-card">
                  <div>
                    <strong>{product.nome}</strong>
                    <span>{moduleLabels[product.modulo]}</span>
                  </div>
                  <div>
                    <strong>{formatCurrency(product.preco)}</strong>
                  </div>
                  <div className="inline-actions">
                    <button className="ghost-button small-button" type="button" onClick={() => startEditing(product)}>
                      Editar
                    </button>
                    <button className="ghost-button small-button" type="button" onClick={() => deleteProduct(product)}>
                      Excluir
                    </button>
                  </div>
                </div>
              ))}

              {groupedProducts[currentModule].length === 0 ? (
                <p className="empty-state">Nenhum produto cadastrado neste módulo.</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
