import { getMinutesById, getMinutes } from "@/lib/data";
import { formatDate } from "@/lib/format";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const minutes = getMinutes();
  return minutes.map((m) => ({ id: m.id }));
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default async function MinutesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const minutes = getMinutesById(id);

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

        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(minutes.content) }}
        />
      </article>
    </div>
  );
}
