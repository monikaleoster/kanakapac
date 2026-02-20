import Link from "next/link";
import { getUpcomingEvents, getActiveAnnouncements } from "@/lib/data";
import EventCard from "@/components/EventCard";
import AnnouncementCard from "@/components/AnnouncementCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const upcomingEvents = (await getUpcomingEvents()).slice(0, 3);
  const announcements = (await getActiveAnnouncements()).slice(0, 3);
  const urgentAnnouncements = announcements.filter(
    (a) => a.priority === "urgent"
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to Kanaka PAC
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Empowering parents to support and enhance the educational
              experience for every student at Kanaka Elementary.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* Urgent Announcements Banner */}
      {urgentAnnouncements.length > 0 && (
        <section className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {urgentAnnouncements.map((a) => (
              <div key={a.id} className="flex items-center justify-center">
                <span className="font-bold mr-2">NOTICE:</span>
                <span>{a.title} &mdash; {a.content}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-primary-500">
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
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-primary-500">
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
          <div className="bg-white rounded-lg shadow-md p-6 text-center border-t-4 border-primary-500">
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

        {/* Upcoming Events */}
        <section className="mb-16">
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
            <p className="text-gray-500 bg-white rounded-lg p-8 text-center">
              No upcoming events at this time. Check back soon!
            </p>
          )}
        </section>

        {/* Recent Announcements */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recent Announcements
            </h2>
            <Link
              href="/announcements"
              className="text-primary-600 hover:text-primary-800 font-medium text-sm"
            >
              View All &rarr;
            </Link>
          </div>
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 bg-white rounded-lg p-8 text-center">
              No announcements at this time.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
