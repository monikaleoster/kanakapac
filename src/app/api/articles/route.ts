import { NextRequest, NextResponse } from "next/server";
import {
  getArticles,
  saveArticle,
  deleteArticle,
} from "@/lib/data";
import { isAuthenticated } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const articles = await getArticles();
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const article = {
    id: body.id || uuidv4(),
    title: body.title,
    author: body.author,
    excerpt: body.excerpt,
    body: body.body,
    coverImageUrl: body.coverImageUrl || undefined,
    status: body.status || "draft",
    publishedAt: body.publishedAt || null,
    createdAt: body.createdAt || new Date().toISOString(),
  };

  await saveArticle(article);
  return NextResponse.json(article, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  await saveArticle(body);
  return NextResponse.json(body);
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

  await deleteArticle(id);
  return NextResponse.json({ success: true });
}
