import { NextRequest, NextResponse } from "next/server";
import { uploadBuffer } from "@/lib/storage";
import { isAuthenticated } from "@/lib/auth";

const UPLOAD_CONTEXTS = {
    image: {
        bucket: "images",
        validTypes: ["image/png", "image/jpeg", "image/jpg"],
    },
    document: {
        bucket: "minutes",
        validTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ],
    },
} as const;

export async function POST(request: NextRequest) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const url = new URL(request.url);
        const contextParam = url.searchParams.get("context") ?? "document";
        const context = contextParam === "image" ? "image" : "document";
        const { bucket, validTypes } = UPLOAD_CONTEXTS[context];

        if (!(validTypes as readonly string[]).includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type." },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        const fileUrl = await uploadBuffer(bucket, filename, buffer, file.type);

        return NextResponse.json({ fileUrl });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
