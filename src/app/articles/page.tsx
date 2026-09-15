import { getPublishedArticles } from "@/lib/data";
import ArticleCard from "@/components/ArticleCard";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Articles - Kanaka PAC",
  description:
    "News, recaps, and longer-form updates from the Kanaka Parent Advisory Council.",
};

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
      <p className="text-gray-600 mb-8">
        News, recaps, and longer-form updates from the PAC.
      </p>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm mb-12">
          No articles published yet.
        </div>
      )}

      <SubscribeForm />
    </div>
  );
}
