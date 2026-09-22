import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import ArticleCoverImage from "@/components/ArticleCoverImage";

export default function ArticleGridCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group block bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden"
    >
      <ArticleCoverImage
        article={article}
        alt={article.title}
        className="w-full h-28 object-cover"
      />
      <div className="p-3">
        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-primary-800 line-clamp-2">
          {article.title}
        </h4>
        {article.publishedAt && (
          <p className="text-xs text-gray-500 mt-1">
            {formatDateTime(article.publishedAt)}
          </p>
        )}
      </div>
    </Link>
  );
}
