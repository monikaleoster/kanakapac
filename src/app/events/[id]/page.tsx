import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEventById(params.id);
  if (!event) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/events"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mb-6"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Events
      </Link>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

        <div className="space-y-2 text-sm text-gray-600 mb-6">
          <p className="flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0"
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
            {formatDate(event.date)}
            {event.time && <span className="ml-1">at {formatTime(event.time)}</span>}
          </p>
          {event.location && (
            <p className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {event.location}
            </p>
          )}
        </div>

        {event.description && (
          <p className="text-gray-700 leading-relaxed mb-8">{event.description}</p>
        )}

        <a
          href={`/api/events/${event.id}/ics`}
          download
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
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
          Add to Calendar
        </a>
      </div>
    </div>
  );
}
