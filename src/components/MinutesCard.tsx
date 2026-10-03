import Link from "next/link";
import { Minutes } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function MinutesCard({ minutes }: { minutes: Minutes }) {
  return (
    <div data-testid="minutes-card" className="relative bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href={`/minutes/${minutes.id}`} className="hover:text-primary-600">
            <h3 className="text-lg font-semibold text-gray-900">
              {minutes.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(minutes.date)}
          </p>
        </div>
      </div>

      {minutes.fileUrl ? (
        <a
          href={minutes.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-600 hover:text-primary-800 font-medium"
        >
          View Document
        </a>
      ) : (
        <p className="text-sm text-gray-400 italic">No document yet</p>
      )}
    </div>
  );
}
