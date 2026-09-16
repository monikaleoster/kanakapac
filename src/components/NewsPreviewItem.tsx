import Link from "next/link";
import { Article } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

export default function NewsPreviewItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/articles/${article.id}`}
      className="group block py-5 border-t border-gray-200 first:border-t-0"
    >
      <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary-800">
        {article.title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">
        By {article.author}
        {article.publishedAt && ` · ${formatDateTime(article.publishedAt)}`}
      </p>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{article.excerpt}</p>
    </Link>
  );
}
