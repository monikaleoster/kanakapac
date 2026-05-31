import { NextRequest, NextResponse } from "next/server";
import { saveRsvp, getRsvpsByEvent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { eventId, name, email } = body;

  if (!eventId || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await saveRsvp({ eventId, name, email });

  if (result.error === "duplicate") {
    return NextResponse.json({ error: "Already registered" }, { status: 409 });
  }

  if (result.error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (!eventId) {
    return NextResponse.json({ error: "eventId required" }, { status: 400 });
  }

  const rsvps = await getRsvpsByEvent(eventId);
  return NextResponse.json(rsvps);
}
