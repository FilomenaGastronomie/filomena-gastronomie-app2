import { ProductSettings } from "@/components/product-settings";
import { getCatalogProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const products = await getCatalogProducts();

  return <ProductSettings initialProducts={products} />;
}
