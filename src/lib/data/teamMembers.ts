import { supabase } from "../supabase";
import { TeamMember } from "../types";
import { unstable_noStore as noStore } from "next/cache";

export async function getTeamMembers(): Promise<TeamMember[]> {
  noStore();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching team members:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    role: item.role,
    bio: item.bio,
    email: item.email,
    photoUrl: item.photo_url ?? undefined,
    order: item.sort_order
  }));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching team member ${id}:`, error);
    return undefined;
  }

  return data ? {
    id: data.id,
    name: data.name,
    role: data.role,
    bio: data.bio,
    email: data.email,
    photoUrl: data.photo_url ?? undefined,
    order: data.sort_order
  } : undefined;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  const payload = {
    name: member.name,
    role: member.role,
    bio: member.bio,
    email: member.email,
    photo_url: member.photoUrl ?? null,
    sort_order: member.order
  };

  const { error } = await supabase
    .from("team_members")
    .upsert({ id: member.id, ...payload });

  if (error) {
    console.error("Error saving team member:", error);
    throw error;
  }
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting team member:", error);
    throw error;
  }
}
