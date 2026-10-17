import { supabase } from "../supabase";
import { Policy } from "../types";
import { unstable_noStore as noStore } from "next/cache";

export async function getPolicies(): Promise<Policy[]> {
  noStore();
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching policies:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    fileUrl: item.file_url,
    updatedAt: item.updated_at
  }));
}

export async function getPolicyById(id: string): Promise<Policy | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("policies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching policy ${id}:`, error);
    return undefined;
  }

  return data ? {
    id: data.id,
    title: data.title,
    description: data.description,
    fileUrl: data.file_url,
    updatedAt: data.updated_at
  } : undefined;
}

export async function savePolicy(policy: Policy): Promise<void> {
  const payload = {
    title: policy.title,
    description: policy.description,
    file_url: policy.fileUrl,
    updated_at: policy.updatedAt || new Date().toISOString()
  };

  const { error } = await supabase
    .from("policies")
    .upsert({ id: policy.id, ...payload });

  if (error) {
    console.error("Error saving policy:", error);
    throw error;
  }
}

export async function deletePolicy(id: string): Promise<void> {
  const { error } = await supabase
    .from("policies")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting policy:", error);
    throw error;
  }
}
