import { supabase } from "../supabase";
import { Rsvp } from "../types";
import { unstable_noStore as noStore } from "next/cache";

/**
 * Counts RSVPs per Event. Lives here rather than in the Events module because
 * it reads the rsvps table; the Events module consumes it to populate
 * Event.rsvpCount.
 */
export async function getRsvpCountMap(eventIds: string[]): Promise<Map<string, number>> {
  if (eventIds.length === 0) return new Map();
  const { data } = await supabase.from("rsvps").select("event_id").in("event_id", eventIds);
  const map = new Map<string, number>();
  for (const row of data ?? []) {
    map.set(row.event_id, (map.get(row.event_id) ?? 0) + 1);
  }
  return map;
}

export async function saveRsvp(rsvp: Omit<Rsvp, 'id' | 'createdAt'>): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("rsvps")
    .insert({
      event_id: rsvp.eventId,
      name: rsvp.name,
      email: rsvp.email ?? null,
    });

  if (error) {
    if (error.code === '23505') {
      return { error: 'duplicate' };
    }
    console.error("Error saving RSVP:", error);
    return { error: 'unknown' };
  }

  return {};
}

export async function getRsvpsByEvent(eventId: string): Promise<Rsvp[]> {
  noStore();
  const { data, error } = await supabase
    .from("rsvps")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(`Error fetching RSVPs for event ${eventId}:`, error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    eventId: item.event_id,
    name: item.name,
    email: item.email,
    createdAt: item.created_at,
  }));
}
