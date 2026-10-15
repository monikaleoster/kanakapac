import { supabase } from "../supabase";
import { Announcement } from "../types";
import { unstable_noStore as noStore } from "next/cache";

export async function getAnnouncements(): Promise<Announcement[]> {
  noStore();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    priority: item.priority as 'normal' | 'urgent',
    publishedAt: item.published_at,
    expiresAt: item.expires_at
  }));
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  noStore();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching active announcements:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    content: item.content,
    priority: item.priority as 'normal' | 'urgent',
    publishedAt: item.published_at,
    expiresAt: item.expires_at
  }));
}

export async function getAnnouncementById(id: string): Promise<Announcement | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching announcement ${id}:`, error);
    return undefined;
  }

  return data ? {
    id: data.id,
    title: data.title,
    content: data.content,
    priority: data.priority as 'normal' | 'urgent',
    publishedAt: data.published_at,
    expiresAt: data.expires_at
  } : undefined;
}

export async function saveAnnouncement(announcement: Announcement): Promise<void> {
  const payload = {
    title: announcement.title,
    content: announcement.content,
    priority: announcement.priority,
    published_at: announcement.publishedAt || new Date().toISOString(),
    expires_at: announcement.expiresAt
  };

  const { error } = await supabase
    .from("announcements")
    .upsert({ id: announcement.id, ...payload });

  if (error) {
    console.error("Error saving announcement:", error);
    throw error;
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from("announcements")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
}
