import { getMinutes } from "@/lib/data";
import MinutesCard from "@/components/MinutesCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meeting Minutes - Kanaka PAC",
  description: "Archive of PAC meeting minutes from Kanaka Elementary.",
};

export default async function MinutesPage() {
  const minutes = await getMinutes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Meeting Minutes
      </h1>
      <p className="text-gray-600 mb-8">
        Browse the archive of PAC meeting minutes. Click on any meeting to read
        the full minutes.
      </p>

      {minutes.length > 0 ? (
        <div className="space-y-4">
          {minutes.map((m) => (
            <MinutesCard key={m.id} minutes={m} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow-sm">
          No meeting minutes have been posted yet.
        </div>
      )}
    </div>
  );
}
