"use client";

import { useEffect, useState } from "react";

function canUseStorage() {
  try {
    if (typeof window === "undefined") {
      return false;
    }

    return typeof window.localStorage?.getItem === "function";
  } catch {
    return false;
  }
}

export function InstallCard() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!canUseStorage()) {
      return;
    }

    const value = window.localStorage.getItem("filomena-install-card-hidden");
    setHidden(value === "true");
  }, []);

  function dismiss() {
    setHidden(true);

    if (canUseStorage()) {
      window.localStorage.setItem("filomena-install-card-hidden", "true");
    }
  }

  if (hidden) {
    return null;
  }

  return (
    <section className="install-card">
      <div>
        <p className="eyebrow">Uso no iPhone</p>
        <strong>Abra no Safari e toque em Compartilhar {'>'} Adicionar à Tela de Início</strong>
        <p className="install-text">
          Assim o sistema fica com ícone na tela inicial e abre com jeito de app.
        </p>
      </div>
      <button className="ghost-button" type="button" onClick={dismiss}>
        Entendi
      </button>
    </section>
  );
}
