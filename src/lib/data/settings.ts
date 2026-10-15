import { supabase } from "../supabase";
import { SchoolSettings, defaultSettings } from "../types";
import { unstable_noStore as noStore } from "next/cache";

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
