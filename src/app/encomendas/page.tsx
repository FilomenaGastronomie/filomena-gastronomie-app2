import { OrderNotes } from "@/components/order-notes";
import { getEncomendaRecords } from "@/lib/encomenda-records";
import { getOrderNote } from "@/lib/order-notes";
import { getCatalogProducts } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export default async function EncomendasPage() {
  const [note, records, products] = await Promise.all([getOrderNote(), getEncomendaRecords(), getCatalogProducts()]);

  return (
    <OrderNotes
      initialText={note.anotacao}
      updatedAt={note.atualizadoEm}
      initialRecords={records}
      catalogProducts={products.filter((product) => product.modulo === "encomendas")}
    />
  );
}
