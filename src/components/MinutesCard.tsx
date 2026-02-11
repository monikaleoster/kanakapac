import Link from "next/link";
import { Minutes } from "@/lib/data";
import { formatDate } from "@/lib/format";

export default function MinutesCard({ minutes }: { minutes: Minutes }) {
  return (
    <Link
      href={`/minutes/${minutes.id}`}
      className="block bg-white rounded-lg shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {minutes.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {formatDate(minutes.date)}
          </p>
        </div>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
        {minutes.content.replace(/[#*\n]/g, " ").substring(0, 150)}...
      </p>
    </Link>
  );
}
