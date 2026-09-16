import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import ArticleCoverImage from "@/components/ArticleCoverImage";

export default function ArticleListItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group flex gap-6 py-6 border-t border-gray-200 first:border-t-0"
    >
      <ArticleCoverImage
        article={article}
        alt={article.title}
        className="w-40 h-28 rounded-md object-cover flex-shrink-0"
      />
      <div className="min-w-0">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-800">
          {article.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          By {article.author}
          {article.publishedAt && ` · ${formatDateTime(article.publishedAt)}`}
        </p>
        <p className="mt-2 text-gray-600 line-clamp-2">{article.excerpt}</p>
      </div>
    </Link>
  );
}
