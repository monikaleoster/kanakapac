import { NextRequest, NextResponse } from "next/server";
import { getSchoolSettings, saveSchoolSettings } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";

// Public: Get settings
export async function GET() {
    const settings = await getSchoolSettings();
    return NextResponse.json(settings);
}

// Admin: Update settings
export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Basic validation if needed

    await saveSchoolSettings(body);
    return NextResponse.json({ success: true, settings: body });
}
