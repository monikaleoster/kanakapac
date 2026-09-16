import { getArticleById } from "@/lib/data";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDateTime } from "@/lib/format";
import { getArticleCoverImage } from "@/lib/articleCover";
import { getAbsoluteUrl } from "@/lib/siteUrl";
import FacebookShareButton from "@/components/FacebookShareButton";
import ArticleCoverImage from "@/components/ArticleCoverImage";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article || article.status !== "published") {
    return {};
  }

  const articleUrl = getAbsoluteUrl(`/articles/${article.id}`);
  const imageUrl = getAbsoluteUrl(getArticleCoverImage(article));

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: articleUrl,
      type: "article",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getArticleById(id);

  if (!article || article.status !== "published") {
    notFound();
  }

  const articleUrl = getAbsoluteUrl(`/articles/${article.id}`);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/articles"
        className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-6 inline-block"
      >
        &larr; Back to Articles
      </Link>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        <ArticleCoverImage
          article={article}
          alt={article.title}
          className="w-full max-h-96 object-cover"
        />
        <div className="p-8">
          <header className="border-b border-gray-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {article.title}
            </h1>
            <p className="text-gray-500 mt-2">
              By {article.author}
              {article.publishedAt &&
                ` · ${formatDateTime(article.publishedAt)}`}
            </p>
            <div className="mt-3">
              <FacebookShareButton url={articleUrl} />
            </div>
          </header>

          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.body) }}
          />
        </div>
      </article>
    </div>
  );
}
