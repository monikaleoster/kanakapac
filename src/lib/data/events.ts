import { supabase } from "../supabase";
import { Event } from "../types";
import { unstable_noStore as noStore } from "next/cache";
import { getRsvpCountMap } from "./rsvps";

function mapEvent(item: Record<string, unknown>, rsvpCount = 0): Event {
  return {
    id: item.id as string,
    title: item.title as string,
    date: item.date as string,
    time: item.time as string,
    location: item.location as string,
    description: item.description as string,
    rsvpEnabled: (item.rsvp_enabled as boolean) ?? false,
    ticketUrl: (item.ticket_url as string) ?? undefined,
    rsvpCount,
    createdAt: item.created_at as string,
  };
}

export async function getEvents(): Promise<Event[]> {
  noStore();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  const counts = await getRsvpCountMap((data || []).map(e => e.id));
  return (data || []).map(item => mapEvent(item, counts.get(item.id) ?? 0));
}

export async function getUpcomingEvents(): Promise<Event[]> {
  noStore();
  const now = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("date", now)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }

  const counts = await getRsvpCountMap((data || []).map(e => e.id));
  return (data || []).map(item => mapEvent(item, counts.get(item.id) ?? 0));
}

export async function getPastEvents(): Promise<Event[]> {
  noStore();
  const now = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .lt("date", now)
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching past events:", error);
    return [];
  }

  const counts = await getRsvpCountMap((data || []).map(e => e.id));
  return (data || []).map(item => mapEvent(item, counts.get(item.id) ?? 0));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  noStore();
  const [{ data, error }, counts] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    getRsvpCountMap([id]),
  ]);

  if (error) {
    console.error(`Error fetching event ${id}:`, error);
    return undefined;
  }

  return data ? mapEvent(data, counts.get(id) ?? 0) : undefined;
}

export async function saveEvent(event: Event): Promise<void> {
  const payload = {
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    description: event.description,
    rsvp_enabled: event.rsvpEnabled ?? false,
    ticket_url: event.ticketUrl || null,
    created_at: event.createdAt || new Date().toISOString()
  };

  const { error } = await supabase
    .from("events")
    .upsert({ id: event.id, ...payload });

  if (error) {
    console.error("Error saving event:", error);
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
}
