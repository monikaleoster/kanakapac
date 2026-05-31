import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById, getVolunteerRolesByEvent } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/format";
import VolunteerSignupSection from "@/components/VolunteerSignupSection";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const [event, roles] = await Promise.all([
    getEventById(params.id),
    getVolunteerRolesByEvent(params.id),
  ]);

  if (!event) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/events"
        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
      >
        &larr; All Events
      </Link>

      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-8 mt-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <div className="bg-primary-50 rounded-lg p-3 text-center min-w-[60px] flex-shrink-0">
            <span className="block text-2xl font-bold text-primary-700">
              {new Date(event.date + "T00:00:00").getDate()}
            </span>
            <span className="block text-xs text-primary-600 uppercase">
              {new Date(event.date + "T00:00:00").toLocaleString("en-US", { month: "short" })}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
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

        <p className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>

        <VolunteerSignupSection roles={roles} eventId={event.id} />
      </div>
    </div>
  );
}
