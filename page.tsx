import { FrozenOrderManager } from "@/components/frozen-order-manager";
import { getFrozenOrders } from "@/lib/frozen-orders";
import { getCatalogProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [orders, products] = await Promise.all([getFrozenOrders(), getCatalogProducts()]);

  return <FrozenOrderManager initialOrders={orders} initialProducts={products.filter((product) => product.modulo === "congelados")} />;
}
