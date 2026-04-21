import { DeliveryManager } from "@/components/delivery-manager";
import { getFrozenOrders } from "@/lib/frozen-orders";

export default async function EntregasPage() {
  const orders = await getFrozenOrders();

  return <DeliveryManager initialOrders={orders} />;
}
