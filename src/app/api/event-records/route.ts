import { NextResponse } from "next/server";
import { deleteEventRecord, getEventRecords, saveEventRecord, updateEventRecord } from "@/lib/event-records";

type RequestPayload = {
  cliente: string;
  telefone: string;
  endereco: string;
  data: string;
  pessoas: number;
  valorPorPessoa: number;
  custoStaff: number;
  custoExtras: number;
  total: number;
};

export async function GET() {
  const records = await getEventRecords();
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
    pessoas: body.pessoas,
    valorPorPessoa: body.valorPorPessoa,
    custoStaff: body.custoStaff,
    custoExtras: body.custoExtras,
    total: body.total,
    criadoEm: new Date().toISOString(),
  };

  await saveEventRecord(record);

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
    pessoas: body.pessoas,
    valorPorPessoa: body.valorPorPessoa,
    custoStaff: body.custoStaff,
    custoExtras: body.custoExtras,
    total: body.total,
    criadoEm: body.criadoEm,
  };

  await updateEventRecord(record);

  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id: string };

  await deleteEventRecord(body.id);

  return NextResponse.json({ ok: true });
}
