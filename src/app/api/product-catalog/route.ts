import { NextResponse } from "next/server";
import { deleteCatalogProduct, getCatalogProducts, saveCatalogProduct, updateCatalogProduct } from "@/lib/product-catalog";
import { ProductModule } from "@/lib/types";

type RequestPayload = {
  id?: string;
  nome: string;
  preco: number;
  modulo: ProductModule;
  criadoEm?: string;
};

export async function GET() {
  const products = await getCatalogProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = (await request.json()) as RequestPayload;

  const product = {
    id: crypto.randomUUID(),
    nome: body.nome,
    preco: body.preco,
    modulo: body.modulo,
    criadoEm: new Date().toISOString(),
  };

  await saveCatalogProduct(product);

  return NextResponse.json(product, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as RequestPayload & { id: string; criadoEm: string };

  const product = {
    id: body.id,
    nome: body.nome,
    preco: body.preco,
    modulo: body.modulo,
    criadoEm: body.criadoEm,
  };

  await updateCatalogProduct(product);

  return NextResponse.json(product);
}

export async function DELETE(request: Request) {
  const body = (await request.json()) as { id: string };

  await deleteCatalogProduct(body.id);

  return NextResponse.json({ ok: true });
}
