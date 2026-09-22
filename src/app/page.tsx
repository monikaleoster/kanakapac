import Link from "next/link";
import {
  getUpcomingEvents,
  getActiveAnnouncements,
  getPublishedArticles,
  getSchoolSettings,
} from "@/lib/data";
import EventCard from "@/components/EventCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import FeaturedArticleCard from "@/components/FeaturedArticleCard";
import ArticleGridCard from "@/components/ArticleGridCard";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [upcomingEvents, allAnnouncements, articles, settings] = await Promise.all([
    getUpcomingEvents().then((e) => e.slice(0, 3)),
    getActiveAnnouncements(),
    getPublishedArticles().then((a) => a.slice(0, 5)),
    getSchoolSettings(),
  ]);

  const announcements = [...allAnnouncements]
    .sort((a, b) => {
      if (a.priority !== b.priority) return a.priority === "urgent" ? -1 : 1;
      return (
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
    })
    .slice(0, 4);

  const [featuredArticle, ...gridArticles] = articles;

  return (
    <div>
      {/* Hero — compact strip, meeting time replaces the old Quick Info cards */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                {settings.pacName}
              </h1>
              {settings.meetingTime && (
                <p className="text-sm text-primary-100 mt-1">
                  {settings.meetingTime}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/events"
                className="bg-white text-primary-700 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-colors text-center"
              >
                View Events
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-600 transition-colors text-center"
              >
                About PAC
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements rail — urgent first, omitted entirely when there's nothing active */}
      {announcements.length > 0 && (
        <section className="bg-primary-50 border-b border-primary-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-primary-700 hover:text-primary-900 font-medium text-sm"
              >
                View All &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Articles — featured story plus a compact grid */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
            <Link
              href="/articles"
              className="text-primary-600 hover:text-primary-800 font-medium text-sm"
            >
              View All &rarr;
            </Link>
          </div>
          {featuredArticle ? (
            <>
              <FeaturedArticleCard article={featuredArticle} />
              {gridArticles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {gridArticles.map((article) => (
                    <ArticleGridCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No news posted yet.
            </p>
          )}
        </section>

        {/* Upcoming Events — compact strip */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Upcoming Events
            </h2>
            <Link
              href="/events"
              className="text-primary-600 hover:text-primary-800 font-medium text-sm"
            >
              View All Events &rarr;
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No upcoming events at this time. Check back soon!
            </p>
          )}
        </section>

        {/* Subscribe */}
        <SubscribeForm />
      </div>
    </div>
  );
}
