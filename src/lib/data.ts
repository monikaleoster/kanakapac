import { supabase } from "./supabase";
import {
  Event,
  Minutes,
  Announcement,
  Policy,
  TeamMember,
  Subscriber,
  SchoolSettings,
  defaultSettings,
  VolunteerRole,
  VolunteerRoleWithCount,
  VolunteerSignup,
  VolunteerSignupWithRole,
} from "./types";
import { unstable_noStore as noStore } from "next/cache";

// Helper for snake_case to camelCase conversion if needed, 
// but I'll try to select columns to match the types.

// Events
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    location: item.location,
    description: item.description,
    createdAt: item.created_at
  }));
}

export async function getUpcomingEvents(): Promise<Event[]> {
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

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    location: item.location,
    description: item.description,
    createdAt: item.created_at
  }));
}

export async function getPastEvents(): Promise<Event[]> {
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

  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    date: item.date,
    time: item.time,
    location: item.location,
    description: item.description,
    createdAt: item.created_at
  }));
}

export async function getEventById(id: string): Promise<Event | undefined> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching event ${id}:`, error);
    return undefined;
  }

  return data ? {
    id: data.id,
    title: data.title,
    date: data.date,
    time: data.time,
    location: data.location,
    description: data.description,
    createdAt: data.created_at
  } : undefined;
}

export async function saveEvent(event: Event): Promise<void> {
  const payload = {
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    description: event.description,
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

// Minutes
export async function getMinutes(): Promise<Minutes[]> {
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
    content: item.content,
    createdAt: item.created_at
  }));
}

export async function getMinutesById(id: string): Promise<Minutes | undefined> {
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
    content: data.content,
    createdAt: data.created_at
  } : undefined;
}

export async function saveMinutes(minutes: Minutes): Promise<void> {
  const payload = {
    title: minutes.title,
    date: minutes.date,
    content: minutes.content,
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

// Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
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

// Policies
export async function getPolicies(): Promise<Policy[]> {
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

// Team Members
export async function getTeamMembers(): Promise<TeamMember[]> {
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
    order: item.sort_order
  }));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
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
    order: data.sort_order
  } : undefined;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  const payload = {
    name: member.name,
    role: member.role,
    bio: member.bio,
    email: member.email,
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

// Subscribers
export async function getSubscribers(): Promise<Subscriber[]> {
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

// School Settings
export async function getSchoolSettings(): Promise<SchoolSettings> {
  noStore();
  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("Error fetching school settings:", error);
    return defaultSettings;
  }

  if (!data) return defaultSettings;

  return {
    schoolName: data.school_name,
    pacName: data.pac_name,
    address: data.address,
    city: data.city,
    email: data.email,
    meetingTime: data.meeting_time,
    logoUrl: data.logo_url
  };
}

// Volunteer Roles
export async function getVolunteerRolesByEvent(eventId: string): Promise<VolunteerRoleWithCount[]> {
  const { data, error } = await supabase
    .from("volunteer_roles")
    .select("*, volunteer_signups(id)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching volunteer roles:", error);
    return [];
  }

  return (data || []).map(item => {
    const signupCount = Array.isArray(item.volunteer_signups) ? item.volunteer_signups.length : 0;
    const isFull = item.max_slots !== null && signupCount >= item.max_slots;
    return {
      id: item.id,
      eventId: item.event_id,
      name: item.name,
      maxSlots: item.max_slots,
      createdAt: item.created_at,
      signupCount,
      isFull,
    };
  });
}

export async function saveVolunteerRole(role: { id?: string; eventId: string; name: string; maxSlots: number | null }): Promise<VolunteerRole> {
  const payload = {
    event_id: role.eventId,
    name: role.name,
    max_slots: role.maxSlots,
  };

  if (role.id) {
    const { data, error } = await supabase
      .from("volunteer_roles")
      .update(payload)
      .eq("id", role.id)
      .select()
      .single();
    if (error) {
      console.error("Error updating volunteer role:", error);
      throw error;
    }
    return { id: data.id, eventId: data.event_id, name: data.name, maxSlots: data.max_slots, createdAt: data.created_at };
  } else {
    const { data, error } = await supabase
      .from("volunteer_roles")
      .insert(payload)
      .select()
      .single();
    if (error) {
      console.error("Error creating volunteer role:", error);
      throw error;
    }
    return { id: data.id, eventId: data.event_id, name: data.name, maxSlots: data.max_slots, createdAt: data.created_at };
  }
}

export async function deleteVolunteerRole(id: string): Promise<void> {
  const { error } = await supabase
    .from("volunteer_roles")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting volunteer role:", error);
    throw error;
  }
}

// Volunteer Signups
export async function createVolunteerSignup(signup: { roleId: string; name: string; email: string }): Promise<VolunteerSignup> {
  const { data, error } = await supabase
    .from("volunteer_signups")
    .insert({ role_id: signup.roleId, name: signup.name, email: signup.email })
    .select()
    .single();
  if (error) {
    console.error("Error creating volunteer signup:", error);
    throw error;
  }
  return { id: data.id, roleId: data.role_id, name: data.name, email: data.email, createdAt: data.created_at };
}

export async function deleteVolunteerSignup(id: string): Promise<void> {
  const { error } = await supabase
    .from("volunteer_signups")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Error deleting volunteer signup:", error);
    throw error;
  }
}

export async function getVolunteerSignupsByEvent(eventId: string): Promise<VolunteerSignupWithRole[]> {
  const { data, error } = await supabase
    .from("volunteer_signups")
    .select("*, volunteer_roles!inner(name, event_id)")
    .eq("volunteer_roles.event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching volunteer signups:", error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    roleId: item.role_id,
    name: item.name,
    email: item.email,
    createdAt: item.created_at,
    roleName: item.volunteer_roles.name,
  }));
}

export async function saveSchoolSettings(settings: SchoolSettings): Promise<void> {
  const payload = {
    school_name: settings.schoolName,
    pac_name: settings.pacName,
    address: settings.address,
    city: settings.city,
    email: settings.email,
    meeting_time: settings.meetingTime,
    logo_url: settings.logoUrl
  };

  const { error } = await supabase
    .from("settings")
    .upsert({ id: 1, ...payload });

  if (error) {
    console.error("Error saving school settings:", error);
    throw error;
  }
}
