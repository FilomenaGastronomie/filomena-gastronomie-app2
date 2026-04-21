import type { MetadataRoute } from "next";
import { COMPANY_NAME } from "@/lib/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY_NAME,
    short_name: "Filomena",
    description: "Gestão de congelados, encomendas e eventos com uso fácil no iPhone.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2eb",
    theme_color: "#b75d2a",
    lang: "pt-BR",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
