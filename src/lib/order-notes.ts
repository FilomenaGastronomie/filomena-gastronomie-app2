import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { createSupabaseServerClient, hasSupabaseConfigured } from "@/lib/supabase";

const FILE_NAME = "order-notes.json";

type NoteData = {
  anotacao: string;
  atualizadoEm: string | null;
};

export async function getOrderNote() {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("order_notes")
        .select("anotacao, atualizado_em")
        .eq("slug", "encomendas")
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar anotação no Supabase: ${error.message}`);
      }

      if (data) {
        return {
          anotacao: data.anotacao,
          atualizadoEm: data.atualizado_em,
        };
      }
    }
  }

  return readJsonFile<NoteData>(FILE_NAME, {
    anotacao: "",
    atualizadoEm: null,
  });
}

export async function saveOrderNote(anotacao: string) {
  const payload = {
    anotacao,
    atualizadoEm: new Date().toISOString(),
  };

  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("order_notes").upsert(
        {
          slug: "encomendas",
          anotacao: payload.anotacao,
          atualizado_em: payload.atualizadoEm,
        },
        { onConflict: "slug" },
      );

      if (error) {
        throw new Error(`Erro ao salvar anotação no Supabase: ${error.message}`);
      }

      return payload;
    }
  }

  await writeJsonFile(FILE_NAME, payload);
  return payload;
}
