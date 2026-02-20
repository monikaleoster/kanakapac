import { getAnnouncements } from "@/lib/data";
import AnnouncementCard from "@/components/AnnouncementCard";
import SubscribeForm from "@/components/SubscribeForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Announcements - Kanaka PAC",
  description: "Latest announcements from the Kanaka Parent Advisory Council.",
};

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements</h1>
      <p className="text-gray-600 mb-8">
        Stay informed with the latest news and announcements from the PAC.
      </p>

      {announcements.length > 0 ? (
        <div className="space-y-4 mb-12">
          {announcements.map((a) => (
            <AnnouncementCard key={a.id} announcement={a} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm mb-12">
          No announcements at this time.
        </div>
      )}

      {/* Subscription */}
      <SubscribeForm />
    </div>
  );
}


