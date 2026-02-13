import { NextRequest, NextResponse } from "next/server";
import { getPolicies, getPolicyById, savePolicy, deletePolicy } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const policies = getPolicies();
    return NextResponse.json(policies);
}

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, fileUrl } = body;

    if (!title || !description || !fileUrl) {
        return NextResponse.json(
            { error: "Title, description, and file are required" },
            { status: 400 }
        );
    }

    const policy = {
        id: body.id || uuidv4(),
        title,
        description,
        fileUrl,
        updatedAt: new Date().toISOString(),
    };

    savePolicy(policy);
    return NextResponse.json(policy, { status: 201 });
}

export async function PUT(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, fileUrl } = body;

    const existing = getPolicyById(id);
    if (!existing) {
        return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const updatedPolicy = {
        ...existing,
        title: title || existing.title,
        description: description || existing.description,
        fileUrl: fileUrl || existing.fileUrl,
        updatedAt: new Date().toISOString(),
    };

    savePolicy(updatedPolicy);
    return NextResponse.json(updatedPolicy);
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

    deletePolicy(id);
    return NextResponse.json({ success: true });
}
