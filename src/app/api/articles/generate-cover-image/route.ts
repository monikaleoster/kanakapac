import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";
import { isAuthenticated } from "@/lib/auth";
import { uploadBuffer } from "@/lib/storage";

const COVER_WIDTH = 1200;
const COVER_HEIGHT = 630;

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let prompt: unknown;
  try {
    const body = await request.json();
    prompt = body?.prompt;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1536x1024",
    });

    const b64 = result.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error("No image returned by provider");
    }

    const rawImage = Buffer.from(b64, "base64");
    const coverImage = await sharp(rawImage)
      .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const filename = `${Date.now()}-ai-cover.jpg`;
    const fileUrl = await uploadBuffer("images", filename, coverImage, "image/jpeg");

    return NextResponse.json({ fileUrl });
  } catch (e) {
    console.error("Cover image generation error:", e);
    return NextResponse.json(
      { error: "Failed to generate cover image" },
      { status: 500 }
    );
  }
}
