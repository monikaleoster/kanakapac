import { getPolicies } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "PAC Policies - Kanaka PAC",
  description:
    "Bylaws, policies, and governance documents of the Kanaka Parent Advisory Council.",
};

export default async function PoliciesPage() {
  const policies = await getPolicies();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PAC Policies</h1>
      <p className="text-gray-600 mb-8">
        The following policies and bylaws govern the operation of the Kanaka
        Parent Advisory Council.
      </p>

      {/* Dynamic Policies List */}
      <div className="grid gap-6 mb-12">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{policy.title}</h2>
                <p className="text-gray-600 mb-4">{policy.description}</p>
              </div>
              <a
                href={policy.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
