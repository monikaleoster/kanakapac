import { NextRequest, NextResponse } from "next/server";
import { uploadBuffer } from "@/lib/storage";
import { isAuthenticated } from "@/lib/auth";

const UPLOAD_CONTEXTS = {
    image: {
        bucket: "images",
        validTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
        maxBytes: 5 * 1024 * 1024,
    },
    pdf: {
        bucket: "minutes",
        validTypes: ["application/pdf"],
        maxBytes: 4 * 1024 * 1024,
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
        const context =
            contextParam === "image" || contextParam === "pdf" ? contextParam : "document";
        const { bucket, validTypes } = UPLOAD_CONTEXTS[context];

        if (!(validTypes as readonly string[]).includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type." },
                { status: 400 }
            );
        }

        // The host limits request bodies to ~4.5MB, so PDFs are capped at 4MB
        // in every context (including Minutes documents).
        const maxBytes =
            context === "image"
                ? UPLOAD_CONTEXTS.image.maxBytes
                : file.type === "application/pdf"
                  ? UPLOAD_CONTEXTS.pdf.maxBytes
                  : undefined;
        if (maxBytes !== undefined && file.size > maxBytes) {
            return NextResponse.json(
                { error: `File is too large (max ${maxBytes / (1024 * 1024)}MB).` },
                { status: 413 }
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
