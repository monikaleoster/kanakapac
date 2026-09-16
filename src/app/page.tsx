import Link from "next/link";
import {
  getUpcomingEvents,
  getActiveAnnouncements,
  getPublishedArticles,
  getSchoolSettings,
} from "@/lib/data";
import EventCard from "@/components/EventCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import NewsPreviewItem from "@/components/NewsPreviewItem";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [upcomingEvents, allAnnouncements, articles, settings] = await Promise.all([
    getUpcomingEvents().then((e) => e.slice(0, 3)),
    getActiveAnnouncements(),
    getPublishedArticles().then((a) => a.slice(0, 3)),
    getSchoolSettings(),
  ]);
  const urgentAnnouncements = allAnnouncements.filter((a) => a.priority === "urgent");
  const recentAnnouncements = allAnnouncements
    .filter((a) => a.priority !== "urgent")
    .slice(0, 3);

  return (
    <div>
      {/* Hero Section — trimmed on mobile so the urgent banner clears the fold */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">
              Welcome to {settings.pacName}
            </h1>
            <p className="text-base sm:text-xl text-primary-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Empowering parents to support and enhance the educational
              experience for every student at {settings.schoolName}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/events"
                className="bg-white text-primary-700 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                View Upcoming Events
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"
              >
                Learn About PAC
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Urgent Announcements Banner — inset panel overlapping the hero */}
        {urgentAnnouncements.length > 0 && (
          <div className="-mt-6 sm:-mt-8 relative z-10 bg-red-600 text-white rounded-2xl shadow-lg px-5 py-4 sm:px-7 sm:py-5">
            {urgentAnnouncements.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v3.75m0 3.75h.007M10.29 3.86L1.82 18a1.5 1.5 0 001.3 2.25h17.76a1.5 1.5 0 001.3-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z"
                  />
                </svg>
                <div>
                  <p className="font-bold text-sm">NOTICE</p>
                  <p className="text-sm sm:text-base">
                    {a.title} &mdash; {a.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="py-10 sm:py-12">
          {/* Quick Info Cards — tinted panel */}
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 sm:p-8 mb-8 sm:mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <svg
                  className="w-10 h-10 mx-auto text-primary-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900">Next Meeting</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {upcomingEvents.length > 0
                    ? `${upcomingEvents[0].title} - ${new Date(upcomingEvents[0].date + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
                    : "No upcoming meetings scheduled"}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <svg
                  className="w-10 h-10 mx-auto text-primary-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900">Get Involved</h3>
                <p className="text-sm text-gray-600 mt-1">
                  All parents and guardians are welcome to join PAC meetings and
                  volunteer for events.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 text-center">
                <svg
                  className="w-10 h-10 mx-auto text-primary-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="font-semibold text-gray-900">Stay Connected</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check announcements regularly and subscribe to updates from the
                  PAC.
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Events — bordered panel */}
          <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 mb-8">
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
              <div className="space-y-4">
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

          {/* Recent Announcements — bordered panel, excludes items already shown in the urgent banner */}
          <section className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-red-700 hover:text-red-900 font-medium text-sm"
              >
                View All &rarr;
              </Link>
            </div>
            {recentAnnouncements.length > 0 ? (
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No announcements at this time.
              </p>
            )}
          </section>

          {/* Latest News — bordered panel */}
          <section className="bg-gray-50 border border-gray-200 rounded-2xl p-5 sm:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Latest News</h2>
              <Link
                href="/articles"
                className="text-primary-600 hover:text-primary-800 font-medium text-sm"
              >
                View All &rarr;
              </Link>
            </div>
            {articles.length > 0 ? (
              <div className="bg-white rounded-xl px-5 sm:px-6">
                {articles.map((article) => (
                  <NewsPreviewItem key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No news posted yet.
              </p>
            )}
          </section>

          {/* Subscribe */}
          <SubscribeForm />
        </div>
      </div>
    </div>
  );
}
