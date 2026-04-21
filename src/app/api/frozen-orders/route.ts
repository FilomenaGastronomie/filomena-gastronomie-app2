import { NextResponse } from "next/server";
import { deleteFrozenOrder, saveFrozenOrder, getFrozenOrders, updateFrozenOrder, updateFrozenOrderStatus } from "@/lib/frozen-orders";
import { FrozenOrderItem, DeliveryType, FrozenOrderStatus } from "@/lib/types";

type RequestPayload = {
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  tipoEntrega: DeliveryType;
  status?: FrozenOrderStatus;
  taxaEntrega: number;
  custoTotal: number;
  itens: FrozenOrderItem[];
  subtotal: number;
  total: number;
};

export async function GET() {
  const orders = await getFrozenOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;

  const order = {
    id: crypto.randomUUID(),
    ...body,
    status: body.status ?? "pendente",
    criadoEm: new Date().toISOString(),
  };

  await saveFrozenOrder(order);

  return NextResponse.json(order, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as { id: string; status: FrozenOrderStatus };

  await updateFrozenOrderStatus(body.id, body.status);

  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as RequestPayload & {
    id: string;
    criadoEm: string;
  };

  const updatedOrder = {
    id: body.id,
    cliente: body.cliente,
    telefone: body.telefone,
    endereco: body.endereco,
    data: body.data,
    tipoEntrega: body.tipoEntrega,
    status: body.status ?? "pendente",
    taxaEntrega: body.taxaEntrega,
    custoTotal: body.custoTotal,
    itens: body.itens,
    subtotal: body.subtotal,
    total: body.total,
    criadoEm: body.criadoEm,
  };

  await updateFrozenOrder(updatedOrder);

  return NextResponse.json(updatedOrder);
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id: string };

  await deleteFrozenOrder(body.id);

  return NextResponse.json({ ok: true });
}
