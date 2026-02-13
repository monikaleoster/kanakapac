import Link from "next/link";
import Navigation from "./Navigation";
import { getSchoolSettings } from "@/lib/data";

export default function Header() {
  const settings = getSchoolSettings();

  return (
    <header className="bg-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover bg-white" />
            ) : (
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-primary-800 font-bold text-lg">P</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold leading-tight">{settings.pacName}</h1>
              <p className="text-xs text-primary-200 leading-tight">
                Parent Advisory Council
              </p>
            </div>
          </Link>
          <Navigation />
        </div>
      </div>
    </header>
  );
}
