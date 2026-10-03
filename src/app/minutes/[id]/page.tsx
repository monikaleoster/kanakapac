import { getMinutesById, getMinutes } from "@/lib/data";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const minutes = await getMinutes();
  return minutes.map((m) => ({ id: m.id }));
}

export default async function MinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const minutes = await getMinutesById(id);

  if (!minutes) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/minutes"
        className="text-primary-600 hover:text-primary-800 text-sm font-medium mb-6 inline-block"
      >
        &larr; Back to Meeting Minutes
      </Link>

      <article className="bg-white rounded-lg shadow-md p-8">
        <header className="border-b border-gray-200 pb-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {minutes.title}
          </h1>
          <p className="text-gray-500 mt-2">{formatDate(minutes.date)}</p>
        </header>

        <div className="prose prose-gray max-w-none">
          {minutes.fileUrl ? (
            <a
              href={minutes.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-800 font-medium"
            >
              View Document
            </a>
          ) : (
            <p className="text-gray-400 italic">No document yet</p>
          )}
        </div>
      </article>
    </div>
  );
}
