import { getEventById } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/format";
import RsvpForm from "@/components/RsvpForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/events"
        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
      >
        &larr; Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow-md p-8 mt-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

        <div className="space-y-1 text-gray-600 mb-6">
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(event.date)} at {formatTime(event.time)}
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {event.location}
          </p>
        </div>

        <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>

        {event.ticketUrl && (
          <div className="mt-8">
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              Buy Tickets &rarr;
            </a>
          </div>
        )}

        {event.rsvpEnabled && (
          <div className="mt-8 border-t border-gray-100 pt-8">
            <RsvpForm eventId={event.id} />
          </div>
        )}
      </div>
    </div>
  );
}
