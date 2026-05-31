import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getVolunteerSignupsByEvent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const signups = await getVolunteerSignupsByEvent(params.id);
  return NextResponse.json(signups);
}
