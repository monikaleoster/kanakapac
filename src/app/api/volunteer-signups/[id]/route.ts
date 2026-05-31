import { NextRequest, NextResponse } from "next/server";
import { deleteVolunteerSignup } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await deleteVolunteerSignup(params.id);
  return new NextResponse(null, { status: 204 });
}
