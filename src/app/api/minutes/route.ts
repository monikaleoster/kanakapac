import { NextRequest, NextResponse } from "next/server";
import { getMinutes, saveMinutes, deleteMinutes } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const minutes = getMinutes();
  return NextResponse.json(minutes);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const minutes = {
    id: body.id || uuidv4(),
    title: body.title,
    date: body.date,
    content: body.content,
    createdAt: body.createdAt || new Date().toISOString(),
  };

  saveMinutes(minutes);
  return NextResponse.json(minutes, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  saveMinutes(body);
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

  deleteMinutes(id);
  return NextResponse.json({ success: true });
}
