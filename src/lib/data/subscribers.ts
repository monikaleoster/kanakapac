import { supabase } from "../supabase";
import { Subscriber } from "../types";
import { unstable_noStore as noStore } from "next/cache";

export async function getSubscribers(): Promise<Subscriber[]> {
  noStore();
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  if (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    email: item.email,
    subscribedAt: item.subscribed_at
  }));
}

export async function saveSubscriber(subscriber: Subscriber): Promise<void> {
  const { error } = await supabase
    .from("subscribers")
    .insert({ email: subscriber.email, subscribed_at: subscriber.subscribedAt || new Date().toISOString() });

  if (error && error.code !== '23505') { // Ignore unique constraint violation
    console.error("Error saving subscriber:", error);
    throw error;
  }
}

export async function deleteSubscriber(email: string): Promise<void> {
  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("email", email);

  if (error) {
    console.error("Error deleting subscriber:", error);
    throw error;
  }
}
