import { ProductionManager } from "@/components/production-manager";
import { getEncomendaRecords } from "@/lib/encomenda-records";
import { getEventRecords } from "@/lib/event-records";
import { getFrozenOrders } from "@/lib/frozen-orders";

export default async function ProducaoPage() {
  const [frozenOrders, encomendas, eventos] = await Promise.all([
    getFrozenOrders(),
    getEncomendaRecords(),
    getEventRecords(),
  ]);

  return <ProductionManager frozenOrders={frozenOrders} encomendas={encomendas} eventos={eventos} />;
}
