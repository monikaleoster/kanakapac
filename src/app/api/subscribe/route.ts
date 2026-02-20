import { NextRequest, NextResponse } from "next/server";
import { saveSubscriber, getSubscribers, deleteSubscriber } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

// Admin: Get all subscribers
export async function GET() {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const subscribers = await getSubscribers();
    return NextResponse.json(subscribers);
}

// Public: Subscribe
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
        return NextResponse.json(
            { error: "Valid email is required" },
            { status: 400 }
        );
    }

    const subscriber = {
        id: uuidv4(),
        email,
        subscribedAt: new Date().toISOString(),
    };

    await saveSubscriber(subscriber);
    return NextResponse.json({ success: true, message: "Subscribed successfully" });
}

// Admin: Unsubscribe/Delete
export async function DELETE(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await deleteSubscriber(email);
    return NextResponse.json({ success: true });
}
