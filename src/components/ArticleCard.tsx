import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="block bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden"
    >
      {article.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImageUrl}
          alt={article.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
        <p className="text-sm text-gray-500 mt-1">
          By {article.author}
          {article.publishedAt && ` · ${formatDateTime(article.publishedAt)}`}
        </p>
        <p className="mt-3 text-gray-700">{article.excerpt}</p>
      </div>
    </Link>
  );
}
