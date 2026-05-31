import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getVolunteerRolesByEvent, saveVolunteerRole, deleteVolunteerRole } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const roles = await getVolunteerRolesByEvent(params.id);
  return NextResponse.json(roles);
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const role = await saveVolunteerRole({
    eventId: params.id,
    name: body.name,
    maxSlots: body.maxSlots ?? null,
  });
  return NextResponse.json(role, { status: 201 });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "Role ID required" }, { status: 400 });
  }
  const role = await saveVolunteerRole({
    id: body.id,
    eventId: params.id,
    name: body.name,
    maxSlots: body.maxSlots ?? null,
  });
  return NextResponse.json(role);
}

export async function DELETE(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const roleId = searchParams.get("roleId");
  if (!roleId) {
    return NextResponse.json({ error: "roleId required" }, { status: 400 });
  }
  await deleteVolunteerRole(roleId);
  return NextResponse.json({ success: true });
}
