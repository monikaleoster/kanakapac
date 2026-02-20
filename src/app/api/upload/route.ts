import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const validTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/png",
            "image/jpeg",
            "image/jpg",
        ];

        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type." },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;

        const { data, error } = await supabase.storage
            .from("minutes")
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error("Supabase storage error:", error);
            return NextResponse.json({ error: "Upload to Supabase failed" }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from("minutes")
            .getPublicUrl(filename);

        return NextResponse.json({ fileUrl: publicUrl });
    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
