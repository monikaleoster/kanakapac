import { getPublishedArticles } from "@/lib/data";
import FeaturedArticleCard from "@/components/FeaturedArticleCard";
import ArticleListItem from "@/components/ArticleListItem";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles - Kanaka PAC",
  description:
    "News, recaps, and longer-form updates from the Kanaka Parent Advisory Council.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  const [featured, ...rest] = articles;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-baseline justify-between border-b-2 border-gray-900 pb-4 mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Latest first
        </span>
      </div>

      {featured ? (
        <>
          <FeaturedArticleCard article={featured} />

          {rest.length > 0 && (
            <div className="mt-4 mb-12">
              {rest.map((article) => (
                <ArticleListItem key={article.id} article={article} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm mb-12">
          No articles published yet.
        </div>
      )}

      <SubscribeForm />
    </div>
  );
}
