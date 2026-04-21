import { FrozenOrder } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { createSupabaseServerClient, hasSupabaseConfigured } from "@/lib/supabase";

const FILE_NAME = "frozen-orders.json";

export async function getFrozenOrders() {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("frozen_orders")
        .select("id, cliente, telefone, endereco, data, horario, tipo_entrega, status, taxa_entrega, custo_total, itens, subtotal, total, criado_em")
        .order("data", { ascending: false })
        .order("criado_em", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar pedidos no Supabase: ${error.message}`);
      }

      return (data ?? []).map((order) => ({
        id: order.id,
        cliente: order.cliente,
        telefone: order.telefone ?? "",
        endereco: order.endereco ?? "",
        data: order.data,
        horario: order.horario ?? "",
        tipoEntrega: order.tipo_entrega,
        status: order.status ?? "pendente",
        taxaEntrega: order.taxa_entrega,
        custoTotal: order.custo_total ?? 0,
        itens: order.itens,
        subtotal: order.subtotal,
        total: order.total,
        criadoEm: order.criado_em,
      })) as FrozenOrder[];
    }
  }

  return readJsonFile<FrozenOrder[]>(FILE_NAME, []);
}

export async function saveFrozenOrder(order: FrozenOrder) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("frozen_orders").insert({
        id: order.id,
        cliente: order.cliente,
        telefone: order.telefone,
        endereco: order.endereco,
        data: order.data,
        horario: order.horario,
        tipo_entrega: order.tipoEntrega,
        status: order.status,
        taxa_entrega: order.taxaEntrega,
        custo_total: order.custoTotal,
        itens: order.itens,
        subtotal: order.subtotal,
        total: order.total,
        criado_em: order.criadoEm,
      });

      if (error) {
        throw new Error(`Erro ao salvar pedido no Supabase: ${error.message}`);
      }

      return order;
    }
  }

  const orders = await getFrozenOrders();
  const updatedOrders = [order, ...orders];
  await writeJsonFile(FILE_NAME, updatedOrders);
  return order;
}

export async function updateFrozenOrder(updatedOrder: FrozenOrder) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase
        .from("frozen_orders")
        .update({
          cliente: updatedOrder.cliente,
          telefone: updatedOrder.telefone,
          endereco: updatedOrder.endereco,
          data: updatedOrder.data,
          horario: updatedOrder.horario,
          tipo_entrega: updatedOrder.tipoEntrega,
          status: updatedOrder.status,
          taxa_entrega: updatedOrder.taxaEntrega,
          custo_total: updatedOrder.custoTotal,
          itens: updatedOrder.itens,
          subtotal: updatedOrder.subtotal,
          total: updatedOrder.total,
        })
        .eq("id", updatedOrder.id);

      if (error) {
        throw new Error(`Erro ao atualizar pedido no Supabase: ${error.message}`);
      }

      return updatedOrder;
    }
  }

  const orders = await getFrozenOrders();
  const nextOrders = orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order));
  await writeJsonFile(FILE_NAME, nextOrders);
  return updatedOrder;
}

export async function updateFrozenOrderStatus(orderId: string, status: FrozenOrder["status"]) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("frozen_orders").update({ status }).eq("id", orderId);

      if (error) {
        throw new Error(`Erro ao atualizar status do pedido no Supabase: ${error.message}`);
      }

      return;
    }
  }

  const orders = await getFrozenOrders();
  const updatedOrders = orders.map((order) => (order.id === orderId ? { ...order, status } : order));
  await writeJsonFile(FILE_NAME, updatedOrders);
}

export async function deleteFrozenOrder(orderId: string) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("frozen_orders").delete().eq("id", orderId);

      if (error) {
        throw new Error(`Erro ao excluir pedido no Supabase: ${error.message}`);
      }

      return;
    }
  }

  const orders = await getFrozenOrders();
  const nextOrders = orders.filter((order) => order.id !== orderId);
  await writeJsonFile(FILE_NAME, nextOrders);
}
