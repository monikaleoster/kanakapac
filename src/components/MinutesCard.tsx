import Link from "next/link";
import { Minutes } from "@/lib/types";
import { formatDate } from "@/lib/format";

export default function MinutesCard({ minutes }: { minutes: Minutes }) {
  return (
    <div className="relative bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
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
        <div className="flex gap-4">
          <Link
            href={`/minutes/${minutes.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Read Online
          </Link>
          <a
            href={minutes.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Minutes
          </a>
        </div>
      ) : (
        <Link href={`/minutes/${minutes.id}`}>
          <p className="text-sm text-gray-600 line-clamp-2 hover:text-primary-600">
            {minutes.content?.replace(/[#*\n]/g, " ").substring(0, 150)}...
          </p>
        </Link>
      )}
    </div>
  );
}
