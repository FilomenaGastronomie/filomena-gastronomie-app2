import { EventRecord } from "@/lib/types";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { createSupabaseServerClient, hasSupabaseConfigured } from "@/lib/supabase";

const FILE_NAME = "event-records.json";

export async function getEventRecords() {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase
        .from("event_records")
        .select("id, cliente, telefone, endereco, data, pessoas, valor_por_pessoa, custo_staff, custo_extras, total, criado_em")
        .order("data", { ascending: false })
        .order("criado_em", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar eventos no Supabase: ${error.message}`);
      }

      return (data ?? []).map((record) => ({
        id: record.id,
        cliente: record.cliente,
        telefone: record.telefone ?? "",
        endereco: record.endereco ?? "",
        data: record.data,
        pessoas: record.pessoas,
        valorPorPessoa: record.valor_por_pessoa,
        custoStaff: record.custo_staff,
        custoExtras: record.custo_extras ?? 0,
        total: record.total,
        criadoEm: record.criado_em,
      })) as EventRecord[];
    }
  }

  return readJsonFile<EventRecord[]>(FILE_NAME, []);
}

export async function saveEventRecord(record: EventRecord) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("event_records").insert({
        id: record.id,
        cliente: record.cliente,
        telefone: record.telefone,
        endereco: record.endereco,
        data: record.data,
        pessoas: record.pessoas,
        valor_por_pessoa: record.valorPorPessoa,
        custo_staff: record.custoStaff,
        custo_extras: record.custoExtras,
        total: record.total,
        criado_em: record.criadoEm,
      });

      if (error) {
        throw new Error(`Erro ao salvar evento no Supabase: ${error.message}`);
      }

      return record;
    }
  }

  const records = await getEventRecords();
  await writeJsonFile(FILE_NAME, [record, ...records]);
  return record;
}

export async function updateEventRecord(updatedRecord: EventRecord) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase
        .from("event_records")
        .update({
          cliente: updatedRecord.cliente,
          telefone: updatedRecord.telefone,
          endereco: updatedRecord.endereco,
          data: updatedRecord.data,
          pessoas: updatedRecord.pessoas,
          valor_por_pessoa: updatedRecord.valorPorPessoa,
          custo_staff: updatedRecord.custoStaff,
          custo_extras: updatedRecord.custoExtras,
          total: updatedRecord.total,
        })
        .eq("id", updatedRecord.id);

      if (error) {
        throw new Error(`Erro ao atualizar evento no Supabase: ${error.message}`);
      }

      return updatedRecord;
    }
  }

  const records = await getEventRecords();
  const nextRecords = records.map((record) => (record.id === updatedRecord.id ? updatedRecord : record));
  await writeJsonFile(FILE_NAME, nextRecords);
  return updatedRecord;
}

export async function deleteEventRecord(recordId: string) {
  if (hasSupabaseConfigured()) {
    const supabase = createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.from("event_records").delete().eq("id", recordId);

      if (error) {
        throw new Error(`Erro ao excluir evento no Supabase: ${error.message}`);
      }

      return;
    }
  }

  const records = await getEventRecords();
  const nextRecords = records.filter((record) => record.id !== recordId);
  await writeJsonFile(FILE_NAME, nextRecords);
}
