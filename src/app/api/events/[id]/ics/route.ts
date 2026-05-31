import { getEventById, getSchoolSettings } from "@/lib/data";

function escapeIcsText(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  // RFC 5545: fold lines longer than 75 octets
  if (line.length <= 75) return line;
  let result = "";
  let pos = 0;
  while (pos < line.length) {
    if (pos === 0) {
      result += line.slice(0, 75);
      pos = 75;
    } else {
      result += "\r\n " + line.slice(pos, pos + 74);
      pos += 74;
    }
  }
  return result;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const event = await getEventById(params.id);
  if (!event) {
    return new Response("Event not found", { status: 404 });
  }

  const settings = await getSchoolSettings();
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  let dtstart: string;
  if (event.time) {
    // Combine date + time as a floating local datetime (no timezone suffix)
    // so it lands correctly regardless of the subscriber's timezone
    const [h, m] = event.time.split(":");
    const datePart = event.date.replace(/-/g, "");
    dtstart = `DTSTART:${datePart}T${h.padStart(2, "0")}${m.padStart(2, "0")}00`;
  } else {
    dtstart = `DTSTART;VALUE=DATE:${event.date.replace(/-/g, "")}`;
  }

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kanaka PAC//kanakapac.com//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@kanakapac.com`,
    `DTSTAMP:${now}`,
    foldLine(`SUMMARY:${escapeIcsText(event.title)}`),
    dtstart,
    foldLine(`LOCATION:${escapeIcsText(event.location || "")}`),
    foldLine(`DESCRIPTION:${escapeIcsText(event.description || "")}`),
  ];

  if (settings.email) {
    lines.push(
      foldLine(`ORGANIZER;CN=${escapeIcsText(settings.pacName)}:mailto:${settings.email}`)
    );
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  const icsContent = lines.join("\r\n") + "\r\n";

  const slug = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return new Response(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
