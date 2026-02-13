import fs from "fs";
import path from "path";
import {
  Event,
  Minutes,
  Announcement,
  Policy,
  TeamMember,
  Subscriber,
  SchoolSettings,
  defaultSettings,
} from "./types";
import { unstable_noStore as noStore } from "next/cache";

const dataDir = path.join(process.cwd(), "data");

function readJsonFile<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Events
export function getEvents(): Event[] {
  return readJsonFile<Event>("events.json").sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

export function getUpcomingEvents(): Event[] {
  const now = new Date();
  return getEvents().filter((e) => new Date(e.date) >= now);
}

export function getPastEvents(): Event[] {
  const now = new Date();
  return getEvents()
    .filter((e) => new Date(e.date) < now)
    .reverse();
}

export function getEventById(id: string): Event | undefined {
  return getEvents().find((e) => e.id === id);
}

export function saveEvent(event: Event): void {
  const events = readJsonFile<Event>("events.json");
  const index = events.findIndex((e) => e.id === event.id);
  if (index >= 0) {
    events[index] = event;
  } else {
    events.push(event);
  }
  writeJsonFile("events.json", events);
}

export function deleteEvent(id: string): void {
  const events = readJsonFile<Event>("events.json").filter((e) => e.id !== id);
  writeJsonFile("events.json", events);
}

// Minutes
export function getMinutes(): Minutes[] {
  return readJsonFile<Minutes>("minutes.json").sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getMinutesById(id: string): Minutes | undefined {
  return getMinutes().find((m) => m.id === id);
}

export function saveMinutes(minutes: Minutes): void {
  const all = readJsonFile<Minutes>("minutes.json");
  const index = all.findIndex((m) => m.id === minutes.id);
  if (index >= 0) {
    all[index] = minutes;
  } else {
    all.push(minutes);
  }
  writeJsonFile("minutes.json", all);
}

export function deleteMinutes(id: string): void {
  const all = readJsonFile<Minutes>("minutes.json").filter(
    (m) => m.id !== id
  );
  writeJsonFile("minutes.json", all);
}

// Announcements
export function getAnnouncements(): Announcement[] {
  return readJsonFile<Announcement>("announcements.json").sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getActiveAnnouncements(): Announcement[] {
  const now = new Date();
  return getAnnouncements().filter(
    (a) => !a.expiresAt || new Date(a.expiresAt) > now
  );
}

export function getAnnouncementById(id: string): Announcement | undefined {
  return getAnnouncements().find((a) => a.id === id);
}

export function saveAnnouncement(announcement: Announcement): void {
  const all = readJsonFile<Announcement>("announcements.json");
  const index = all.findIndex((a) => a.id === announcement.id);
  if (index >= 0) {
    all[index] = announcement;
  } else {
    all.push(announcement);
  }
  writeJsonFile("announcements.json", all);
}

export function deleteAnnouncement(id: string): void {
  const all = readJsonFile<Announcement>("announcements.json").filter(
    (a) => a.id !== id
  );
  writeJsonFile("announcements.json", all);
}

// Policies
export function getPolicies(): Policy[] {
  return readJsonFile<Policy>("policies.json").sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getPolicyById(id: string): Policy | undefined {
  return getPolicies().find((p) => p.id === id);
}

export function savePolicy(policy: Policy): void {
  const all = readJsonFile<Policy>("policies.json");
  const index = all.findIndex((p) => p.id === policy.id);
  if (index >= 0) {
    all[index] = policy;
  } else {
    all.push(policy);
  }
  writeJsonFile("policies.json", all);
}

export function deletePolicy(id: string): void {
  const all = readJsonFile<Policy>("policies.json").filter((p) => p.id !== id);
  writeJsonFile("policies.json", all);
}

// Team Members
export function getTeamMembers(): TeamMember[] {
  return readJsonFile<TeamMember>("team.json").sort((a, b) => a.order - b.order);
}

export function getTeamMemberById(id: string): TeamMember | undefined {
  return getTeamMembers().find((t) => t.id === id);
}

export function saveTeamMember(member: TeamMember): void {
  const all = readJsonFile<TeamMember>("team.json");
  const index = all.findIndex((t) => t.id === member.id);
  if (index >= 0) {
    all[index] = member;
  } else {
    all.push(member);
  }
  writeJsonFile("team.json", all);
}

export function deleteTeamMember(id: string): void {
  const all = readJsonFile<TeamMember>("team.json").filter((t) => t.id !== id);
  writeJsonFile("team.json", all);
}

// Subscribers
export function getSubscribers(): Subscriber[] {
  return readJsonFile<Subscriber>("subscribers.json").sort(
    (a, b) => new Date(b.subscribedAt).getTime() - new Date(a.subscribedAt).getTime()
  );
}

export function saveSubscriber(subscriber: Subscriber): void {
  const all = readJsonFile<Subscriber>("subscribers.json");
  if (!all.find((s) => s.email === subscriber.email)) {
    all.push(subscriber);
    writeJsonFile("subscribers.json", all);
  }
}

// School Settings
export function getSchoolSettings(): SchoolSettings {
  noStore();
  const settings = readJsonFile<SchoolSettings>("settings.json");
  if (settings.length === 0) {
    return defaultSettings;
  }
  return { ...defaultSettings, ...settings[0] };
}

export function saveSchoolSettings(settings: SchoolSettings): void {
  writeJsonFile("settings.json", [settings]);
}
