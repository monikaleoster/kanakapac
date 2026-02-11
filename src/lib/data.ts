import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
}

export interface Minutes {
  id: string;
  title: string;
  date: string;
  content: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "urgent";
  publishedAt: string;
  expiresAt: string | null;
}

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
