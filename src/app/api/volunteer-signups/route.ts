import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { createVolunteerSignup, getVolunteerRolesByEvent, getEventById } from "@/lib/data";
import { getSchoolSettings } from "@/lib/data";
import { sendEmail, buildVolunteerConfirmationHtml } from "@/lib/resend";
import { formatDate, formatTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { roleId, name, email } = body;

  if (!roleId || !name || !email) {
    return NextResponse.json({ error: "roleId, name, and email are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  // Fetch the role to check slot cap and get event id
  const { data: roleData, error: roleError } = await supabase
    .from("volunteer_roles")
    .select("*, volunteer_signups(id)")
    .eq("id", roleId)
    .single();

  if (roleError || !roleData) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const signupCount = Array.isArray(roleData.volunteer_signups) ? roleData.volunteer_signups.length : 0;
  if (roleData.max_slots !== null && signupCount >= roleData.max_slots) {
    return NextResponse.json({ error: "This role is full" }, { status: 409 });
  }

  const signup = await createVolunteerSignup({ roleId, name, email });

  // Send confirmation email (non-blocking)
  try {
    const [event, settings] = await Promise.all([
      getEventById(roleData.event_id),
      getSchoolSettings(),
    ]);
    if (event) {
      await sendEmail({
        to: email,
        subject: `Volunteer confirmation: ${event.title}`,
        html: buildVolunteerConfirmationHtml({
          volunteerName: name,
          eventTitle: event.title,
          eventDate: formatDate(event.date),
          eventTime: formatTime(event.time),
          roleName: roleData.name,
          pacName: settings.pacName,
        }),
      });
    }
  } catch (err) {
    console.error("Failed to send volunteer confirmation email:", err);
  }

  return NextResponse.json({ success: true, id: signup.id }, { status: 201 });
}
