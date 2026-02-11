import { NextRequest, NextResponse } from "next/server";
import { getEvents, saveEvent, deleteEvent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const events = getEvents();
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const event = {
    id: body.id || uuidv4(),
    title: body.title,
    date: body.date,
    time: body.time,
    location: body.location,
    description: body.description,
    createdAt: body.createdAt || new Date().toISOString(),
  };

  saveEvent(event);
  return NextResponse.json(event, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  saveEvent(body);
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

  deleteEvent(id);
  return NextResponse.json({ success: true });
}
