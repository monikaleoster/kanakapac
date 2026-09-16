import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import ArticleCoverImage from "@/components/ArticleCoverImage";

export default function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group grid grid-cols-1 md:grid-cols-2 bg-white rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow overflow-hidden"
    >
      <ArticleCoverImage
        article={article}
        alt={article.title}
        className="w-full h-64 md:h-full object-cover"
      />
      <div className="p-8 flex flex-col justify-center">
        <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">
          Featured
        </span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 group-hover:text-primary-800">
          {article.title}
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          By {article.author}
          {article.publishedAt && ` · ${formatDateTime(article.publishedAt)}`}
        </p>
        <p className="mt-4 text-gray-700">{article.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-primary-600 font-semibold">
          Read more
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
