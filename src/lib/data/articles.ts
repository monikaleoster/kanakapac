import { supabase } from "../supabase";
import { Article } from "../types";
import { unstable_noStore as noStore } from "next/cache";

function mapArticle(item: Record<string, unknown>): Article {
  return {
    id: item.id as string,
    title: item.title as string,
    author: item.author as string,
    excerpt: item.excerpt as string,
    body: item.body as string,
    coverImageUrl: (item.cover_image_url as string) ?? undefined,
    status: item.status as "draft" | "published",
    publishedAt: (item.published_at as string) ?? null,
    createdAt: item.created_at as string,
  };
}

export async function getArticles(): Promise<Article[]> {
  noStore();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (data || []).map(mapArticle);
}

export async function getPublishedArticles(): Promise<Article[]> {
  noStore();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching published articles:", error);
    return [];
  }

  return (data || []).map(mapArticle);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  noStore();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching article ${id}:`, error);
    return undefined;
  }

  return data ? mapArticle(data) : undefined;
}

export async function saveArticle(article: Article): Promise<void> {
  // publishedAt is stamped the moment status transitions from 'draft' to
  // 'published', and must stay untouched on subsequent saves of an
  // already-published Article. Since this is a single upsert-based function
  // (matching the rest of the data layer), we look up the article's currently
  // persisted status/publishedAt to detect the transition.
  let publishedAt = article.publishedAt ?? null;

  if (article.status === "published") {
    const { data: existing, error: fetchError } = await supabase
      .from("articles")
      .select("status, published_at")
      .eq("id", article.id)
      .single();

    if (!fetchError && existing) {
      const wasAlreadyPublished = existing.status === "published";
      publishedAt = wasAlreadyPublished
        ? (existing.published_at as string)
        : (article.publishedAt || new Date().toISOString());
    } else if (!article.publishedAt) {
      // No existing row found (e.g. a brand-new Article being published
      // directly) and the incoming Article carries no publishedAt of its
      // own — this is a fresh publish, so stamp it now.
      publishedAt = new Date().toISOString();
    }
    // Otherwise the lookup failed (e.g. a transient DB error) but the
    // incoming Article already carries a publishedAt value — leave it as
    // initialized above rather than risk re-stamping an already-published
    // Article on a failed status check.
  }

  const payload = {
    title: article.title,
    author: article.author,
    excerpt: article.excerpt,
    body: article.body,
    cover_image_url: article.coverImageUrl || null,
    status: article.status,
    published_at: publishedAt,
    created_at: article.createdAt || new Date().toISOString(),
  };

  const { error } = await supabase
    .from("articles")
    .upsert({ id: article.id, ...payload });

  if (error) {
    console.error("Error saving article:", error);
    throw error;
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting article:", error);
    throw error;
  }
}
