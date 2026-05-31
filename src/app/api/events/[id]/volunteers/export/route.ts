import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getVolunteerSignupsByEvent } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signups = await getVolunteerSignupsByEvent(params.id);

  const rows = [
    ["Role", "Name", "Email", "SignedUpAt"],
    ...signups.map(s => [s.roleName, s.name, s.email, s.createdAt]),
  ];

  const csv = rows
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="volunteers-${params.id}.csv"`,
    },
  });
}
