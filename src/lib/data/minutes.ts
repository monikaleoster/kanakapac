import { supabase } from "../supabase";
import { Minutes } from "../types";
import { unstable_noStore as noStore } from "next/cache";

export async function getMinutes(): Promise<Minutes[]> {
  noStore();
  const { data, error } = await supabase
    .from("minutes")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching minutes:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    fileUrl: item.file_url ?? "",
    createdAt: item.created_at
  }));
}

export async function getMinutesById(id: string): Promise<Minutes | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("minutes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching minutes ${id}:`, error);
    return undefined;
  }

  return data ? {
    id: data.id,
    title: data.title,
    date: data.date,
    fileUrl: data.file_url ?? "",
    createdAt: data.created_at
  } : undefined;
}

export async function saveMinutes(minutes: Minutes): Promise<void> {
  const payload = {
    title: minutes.title,
    date: minutes.date,
    file_url: minutes.fileUrl,
    created_at: minutes.createdAt || new Date().toISOString()
  };

  const { error } = await supabase
    .from("minutes")
    .upsert({ id: minutes.id, ...payload });

  if (error) {
    console.error("Error saving minutes:", error);
    throw error;
  }
}

export async function deleteMinutes(id: string): Promise<void> {
  const { error } = await supabase
    .from("minutes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting minutes:", error);
    throw error;
  }
}
