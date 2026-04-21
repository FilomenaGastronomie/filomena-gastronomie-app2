import { NextResponse } from "next/server";
import { getOrderNote, saveOrderNote } from "@/lib/order-notes";

export async function GET() {
  const note = await getOrderNote();
  return NextResponse.json(note);
}

export async function POST(request: Request) {
  const body = (await request.json()) as { anotacao?: string };
  const saved = await saveOrderNote(body.anotacao ?? "");
  return NextResponse.json(saved);
}
