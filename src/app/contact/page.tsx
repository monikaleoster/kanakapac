import { getSchoolSettings } from "@/lib/data";
import ContactForm from "@/components/ContactForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact - Kanaka PAC",
  description: "Get in touch with the Kanaka Parent Advisory Council.",
};

export default async function ContactPage() {
  const settings = await getSchoolSettings();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        We&apos;d love to hear from you. Reach out with questions, suggestions,
        or to learn more about getting involved.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-primary-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  {settings.email && (
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-primary-600 hover:underline"
                    >
                      {settings.email}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-primary-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{settings.address}</p>
                  <p className="text-gray-600">{settings.city}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-primary-600 mt-0.5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-gray-900">Meeting Times</p>
                  <p className="text-gray-600">
                    {settings.meetingTime || "First Wednesday of each month"}
                  </p>
                  {/* <p className="text-gray-600">7:00 PM, School Library</p> */}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-6 border border-primary-100">
            <h3 className="font-semibold text-primary-900 mb-2">
              Executive Contact
            </h3>
            <p className="text-sm text-primary-800">
              To reach a specific executive member, please email the general
              PAC email address and your message will be forwarded to the
              appropriate person.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Send a Message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
