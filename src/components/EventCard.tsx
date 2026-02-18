import { Event } from "@/lib/types";
import { formatDate, formatTime } from "@/lib/format";

export default function EventCard({ event }: { event: Event }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {event.title}
          </h3>
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-primary-600"
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
              {formatDate(event.date)} at {formatTime(event.time)}
            </p>
            <p className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-primary-600"
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
          </div>
          <p className="mt-3 text-gray-700 text-sm">{event.description}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <div className="bg-primary-50 rounded-lg p-3 text-center min-w-[60px]">
            <span className="block text-2xl font-bold text-primary-700">
              {new Date(event.date + "T00:00:00").getDate()}
            </span>
            <span className="block text-xs text-primary-600 uppercase">
              {new Date(event.date + "T00:00:00").toLocaleString("en-US", {
                month: "short",
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
