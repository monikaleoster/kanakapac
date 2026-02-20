import { NextRequest, NextResponse } from "next/server";
import {
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
} from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const announcements = await getAnnouncements();
  return NextResponse.json(announcements);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const announcement = {
    id: body.id || uuidv4(),
    title: body.title,
    content: body.content,
    priority: body.priority || "normal",
    publishedAt: body.publishedAt || new Date().toISOString(),
    expiresAt: body.expiresAt || null,
  };

  await saveAnnouncement(announcement);
  return NextResponse.json(announcement, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  await saveAnnouncement(body);
  return NextResponse.json(body);
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 });
  }

  await deleteAnnouncement(id);
  return NextResponse.json({ success: true });
}
