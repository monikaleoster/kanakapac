import { supabase } from "@/lib/supabase";

export async function uploadBuffer(
  bucket: string,
  filename: string,
  buffer: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType, upsert: true });

  if (error) {
    throw error;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filename);

  return publicUrl;
}
