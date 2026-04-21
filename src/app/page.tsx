import { FrozenOrderManager } from "@/components/frozen-order-manager";
import { getEncomendaRecords } from "@/lib/encomenda-records";
import { getEventRecords } from "@/lib/event-records";
import { getFrozenOrders } from "@/lib/frozen-orders";
import { getCatalogProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [orders, products, encomendas, eventos] = await Promise.all([
    getFrozenOrders(),
    getCatalogProducts(),
    getEncomendaRecords(),
    getEventRecords(),
  ]);

  return (
    <FrozenOrderManager
      initialOrders={orders}
      initialProducts={products.filter((product) => product.modulo === "congelados")}
      initialEncomendas={encomendas}
      initialEventos={eventos}
    />
  );
}

