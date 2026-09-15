import { getArticleById } from "@/lib/data";
import { sanitizeHtml } from "@/lib/sanitize";
import { formatDateTime } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/articles"
        className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-6 inline-block"
      >
        &larr; Back to Articles
      </Link>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {article.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full max-h-96 object-cover"
          />
        )}
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
