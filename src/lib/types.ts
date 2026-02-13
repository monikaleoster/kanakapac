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
    content?: string;
    fileUrl?: string;
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

export interface Policy {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    updatedAt: string;
}

export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    email?: string;
    order: number;
}

export interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

export interface SchoolSettings {
    schoolName: string;
    pacName: string;
    address: string;
    city: string;
    email: string;
    logoUrl?: string;
    meetingTime?: string;
}

export const defaultSettings: SchoolSettings = {
    schoolName: "Kanaka Elementary School",
    pacName: "Kanaka PAC",
    address: "Kanaka Elementary School",
    city: "Maple Ridge, BC",
    email: "pac@kanakaelementary.ca",
    meetingTime: "First Wednesday of each month, 7:00 PM",
};
