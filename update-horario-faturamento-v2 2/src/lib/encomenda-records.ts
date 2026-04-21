import { EncomendaRevenueRecord } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { createSupabaseServerClient, hasSupabaseConfigured } from "@/lib/supabase";

const FILE_NAME = "encomenda-records.json";

export async function getEncomendaRecords() {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("encomenda_records")
        .select("id, cliente, telefone, endereco, data, horario, tipo_entrega, valor, custo, descricao, criado_em")
        .order("data", { ascending: false })
        .order("criado_em", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar registros de encomendas no Supabase: ${error.message}`);
      }

      return (data ?? []).map((record) => ({
        id: record.id,
        cliente: record.cliente,
        telefone: record.telefone ?? "",
        endereco: record.endereco ?? "",
        data: record.data,
        horario: record.horario ?? "",
        tipoEntrega: record.tipo_entrega ?? "retirada",
        valor: record.valor,
        custo: record.custo ?? 0,
        descricao: record.descricao,
        criadoEm: record.criado_em,
      })) as EncomendaRevenueRecord[];
    }
  }

  return readJsonFile<EncomendaRevenueRecord[]>(FILE_NAME, []);
}

export async function saveEncomendaRecord(record: EncomendaRevenueRecord) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("encomenda_records").insert({
        id: record.id,
        cliente: record.cliente,
        telefone: record.telefone,
        endereco: record.endereco,
        data: record.data,
        horario: record.horario,
        tipo_entrega: record.tipoEntrega,
        valor: record.valor,
        custo: record.custo,
        descricao: record.descricao,
        criado_em: record.criadoEm,
      });

      if (error) {
        throw new Error(`Erro ao salvar registro de encomendas no Supabase: ${error.message}`);
      }

      return record;
    }
  }

  const records = await getEncomendaRecords();
  await writeJsonFile(FILE_NAME, [record, ...records]);
  return record;
}

export async function updateEncomendaRecord(updatedRecord: EncomendaRevenueRecord) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase
        .from("encomenda_records")
        .update({
          cliente: updatedRecord.cliente,
          telefone: updatedRecord.telefone,
          endereco: updatedRecord.endereco,
          data: updatedRecord.data,
          horario: updatedRecord.horario,
          tipo_entrega: updatedRecord.tipoEntrega,
          valor: updatedRecord.valor,
          custo: updatedRecord.custo,
          descricao: updatedRecord.descricao,
        })
        .eq("id", updatedRecord.id);

      if (error) {
        throw new Error(`Erro ao atualizar registro de encomendas no Supabase: ${error.message}`);
      }

      return updatedRecord;
    }
  }

  const records = await getEncomendaRecords();
  const nextRecords = records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record));
  await writeJsonFile(FILE_NAME, nextRecords);
  return updatedRecord;
}

export async function deleteEncomendaRecord(recordId: string) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("encomenda_records").delete().eq("id", recordId);

      if (error) {
        throw new Error(`Erro ao excluir registro de encomendas no Supabase: ${error.message}`);
      }

      return;
    }
  }

  const records = await getEncomendaRecords();
  const nextRecords = records.filter((record) => record.id !== recordId);
  await writeJsonFile(FILE_NAME, nextRecords);
}
