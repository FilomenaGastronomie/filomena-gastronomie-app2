import { CatalogProduct } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { createSupabaseServerClient, hasSupabaseConfigured } from "@/lib/supabase";
import { frozenProducts as defaultFrozenProducts } from "@/data/frozen-products";

const FILE_NAME = "product-catalog.json";

const defaultProducts: CatalogProduct[] = [
  ...defaultFrozenProducts.map((product) => ({
    id: product.id,
    nome: product.nome,
    preco: product.preco,
    modulo: "congelados" as const,
    criadoEm: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  })),
  {
    id: "bolo-festa",
    nome: "Bolo de festa",
    preco: 0,
    modulo: "encomendas",
    criadoEm: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
  {
    id: "docinhos",
    nome: "Docinhos",
    preco: 0,
    modulo: "encomendas",
    criadoEm: new Date("2026-01-01T00:00:00.000Z").toISOString(),
  },
];

function sortProducts(products: CatalogProduct[]) {
  return [...products].sort((a, b) => {
    if (a.modulo !== b.modulo) {
      return a.modulo.localeCompare(b.modulo);
    }

    return a.nome.localeCompare(b.nome);
  });
}

export async function getCatalogProducts() {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("product_catalog")
        .select("id, nome, preco, modulo, criado_em")
        .order("modulo", { ascending: true })
        .order("nome", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar produtos no Supabase: ${error.message}`);
      }

      if ((data ?? []).length === 0) {
        return defaultProducts;
      }

      return (data ?? []).map((product) => ({
        id: product.id,
        nome: product.nome,
        preco: product.preco ?? 0,
        modulo: product.modulo,
        criadoEm: product.criado_em,
      })) as CatalogProduct[];
    }
  }

  const products = await readJsonFile<CatalogProduct[]>(FILE_NAME, []);
  return products.length > 0 ? sortProducts(products) : sortProducts(defaultProducts);
}

export async function saveCatalogProduct(product: CatalogProduct) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("product_catalog").insert({
        id: product.id,
        nome: product.nome,
        preco: product.preco,
        modulo: product.modulo,
        criado_em: product.criadoEm,
      });

      if (error) {
        throw new Error(`Erro ao salvar produto no Supabase: ${error.message}`);
      }

      return product;
    }
  }

  const products = await getCatalogProducts();
  await writeJsonFile(FILE_NAME, sortProducts([product, ...products]));
  return product;
}

export async function updateCatalogProduct(updatedProduct: CatalogProduct) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase
        .from("product_catalog")
        .update({
          nome: updatedProduct.nome,
          preco: updatedProduct.preco,
          modulo: updatedProduct.modulo,
        })
        .eq("id", updatedProduct.id);

      if (error) {
        throw new Error(`Erro ao atualizar produto no Supabase: ${error.message}`);
      }

      return updatedProduct;
    }
  }

  const products = await getCatalogProducts();
  const nextProducts = products.map((product) => (product.id === updatedProduct.id ? updatedProduct : product));
  await writeJsonFile(FILE_NAME, sortProducts(nextProducts));
  return updatedProduct;
}

export async function deleteCatalogProduct(productId: string) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("product_catalog").delete().eq("id", productId);

      if (error) {
        throw new Error(`Erro ao excluir produto no Supabase: ${error.message}`);
      }

      return;
    }
  }

  const products = await getCatalogProducts();
  const nextProducts = products.filter((product) => product.id !== productId);
  await writeJsonFile(FILE_NAME, sortProducts(nextProducts));
}
