import Link from "next/link";
import { getSchoolSettings } from "@/lib/data";

export default async function Footer() {
  const settings = await getSchoolSettings();

  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              {settings.pacName}
            </h3>
            <p className="text-sm">
              The Parent Advisory Council works to support and enhance the
              educational experience for all students. We welcome all parents
              and guardians to get involved.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link href="/minutes" className="hover:text-white transition-colors">
                  Meeting Minutes
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white transition-colors">
                  Announcements
                </Link>
              </li>
              <li>
                <Link href="/policies" className="hover:text-white transition-colors">
                  PAC Policies
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">
              Contact Info
            </h3>
            <ul className="space-y-2 text-sm">
              <li>{settings.address}</li>
              <li>{settings.city}</li>
              <li>{settings.email}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} {settings.pacName}. All rights reserved.</p>
          <Link
            href="/admin"
            className="text-gray-500 hover:text-gray-400 text-xs mt-2 inline-block"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
