import { NextRequest, NextResponse } from "next/server";
import { getTeamMembers, getTeamMemberById, saveTeamMember, deleteTeamMember } from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
    const members = await getTeamMembers();
    return NextResponse.json(members);
}

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, role, bio, email, order } = body;

    if (!name || !role) {
        return NextResponse.json(
            { error: "Name and role are required" },
            { status: 400 }
        );
    }

    const member = {
        id: body.id || uuidv4(),
        name,
        role,
        bio: bio || "",
        email: email || "",
        order: order || 0,
    };

    await saveTeamMember(member);
    return NextResponse.json(member, { status: 201 });
}

export async function PUT(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, role, bio, email, order } = body;

    const existing = await getTeamMemberById(id);
    if (!existing) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const updatedMember = {
        ...existing,
        name: name || existing.name,
        role: role || existing.role,
        bio: bio !== undefined ? bio : existing.bio,
        email: email !== undefined ? email : existing.email,
        order: order !== undefined ? order : existing.order,
    };

    await saveTeamMember(updatedMember);
    return NextResponse.json(updatedMember);
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

    await deleteTeamMember(id);
    return NextResponse.json({ success: true });
}
