import { Article } from "@/lib/types";

export const DEFAULT_COVER_IMAGE_PATH = "/images/article-cover-placeholder.jpg";

export function getArticleCoverImage(article: Pick<Article, "coverImageUrl">): string {
  return article.coverImageUrl || DEFAULT_COVER_IMAGE_PATH;
}
