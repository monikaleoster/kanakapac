import { getUpcomingEvents, getPastEvents } from "@/lib/data";
import EventCard from "@/components/EventCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events - Kanaka PAC",
  description: "Upcoming and past PAC events at Kanaka Elementary.",
};

export default function EventsPage() {
  const upcoming = getUpcomingEvents();
  const past = getPastEvents();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PAC Events</h1>
      <p className="text-gray-600 mb-8">
        Stay up to date with upcoming PAC events and activities. All families
        are welcome to attend.
      </p>

      {/* Upcoming Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Upcoming Events
        </h2>
        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm">
            No upcoming events scheduled. Check back soon!
          </div>
        )}
      </section>

      {/* Past Events */}
      {past.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Past Events
          </h2>
          <div className="space-y-4 opacity-75">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
