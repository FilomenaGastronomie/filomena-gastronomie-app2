"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COMPANY_NAME } from "@/lib/brand";

const items = [
  { href: "/", label: "Congelados" },
  { href: "/entregas", label: "Entregas" },
  { href: "/producao", label: "Produção do Dia" },
  { href: "/encomendas", label: "Encomendas" },
  { href: "/eventos", label: "Eventos" },
  { href: "/configuracoes", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo-wrap">
          <Image
            src="/filomena-logo.png"
            alt={COMPANY_NAME}
            width={220}
            height={150}
            className="brand-logo"
            priority
          />
        </div>
        <span className="brand-kicker">Painel interno</span>
        <strong className="brand-title">{COMPANY_NAME}</strong>
        <p className="brand-note">Operação diária com foco em agilidade, clareza e impressão rápida.</p>
      </div>

      <nav className="nav">
        {items.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? "nav-link active" : "nav-link"}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
