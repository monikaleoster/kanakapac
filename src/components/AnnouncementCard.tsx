import { Announcement } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export default function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  const isUrgent = announcement.priority === "urgent";

  return (
    <div
      className={`rounded-lg shadow-md border p-6 ${
        isUrgent
          ? "bg-red-50 border-red-200"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-start">
        {isUrgent && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3 mt-0.5">
            Urgent
          </span>
        )}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${
              isUrgent ? "text-red-900" : "text-gray-900"
            }`}
          >
            {announcement.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Posted {formatDateTime(announcement.publishedAt)}
          </p>
          <p className="mt-3 text-gray-700">{announcement.content}</p>
        </div>
      </div>
    </div>
  );
}
