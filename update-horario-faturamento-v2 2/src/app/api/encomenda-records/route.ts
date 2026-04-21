import { DeliveryType } from "@/lib/types";
import { NextResponse } from "next/server";
import { deleteEncomendaRecord, getEncomendaRecords, saveEncomendaRecord, updateEncomendaRecord } from "@/lib/encomenda-records";

type RequestPayload = {
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  horario: string;
  tipoEntrega: DeliveryType;
  valor: number;
  custo: number;
  descricao: string;
};

export async function GET() {
  const records = await getEncomendaRecords();
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;

  const record = {
    id: crypto.randomUUID(),
    cliente: body.cliente,
    telefone: body.telefone,
    endereco: body.endereco,
    data: body.data,
    horario: body.horario,
    tipoEntrega: body.tipoEntrega,
    valor: body.valor,
    custo: body.custo,
    descricao: body.descricao,
    criadoEm: new Date().toISOString(),
  };

  await saveEncomendaRecord(record);

  return NextResponse.json(record, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as RequestPayload & {
    id: string;
    criadoEm: string;
  };

  const record = {
    id: body.id,
    cliente: body.cliente,
    telefone: body.telefone,
    endereco: body.endereco,
    data: body.data,
    horario: body.horario,
    tipoEntrega: body.tipoEntrega,
    valor: body.valor,
    custo: body.custo,
    descricao: body.descricao,
    criadoEm: body.criadoEm,
  };

  await updateEncomendaRecord(record);

  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id: string };

  await deleteEncomendaRecord(body.id);

  return NextResponse.json({ ok: true });
}
