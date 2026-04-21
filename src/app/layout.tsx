import type { Metadata } from "next";
import { COMPANY_NAME, COMPANY_TAGLINE } from "@/lib/brand";
import { InstallCard } from "@/components/install-card";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: COMPANY_NAME,
  description: `Sistema de ${COMPANY_TAGLINE}.`,
  applicationName: COMPANY_NAME,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: COMPANY_NAME,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="app-shell">
          <Sidebar />
          <main className="content">
            <InstallCard />
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
