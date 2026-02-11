import Link from "next/link";
import Navigation from "./Navigation";

export default function Header() {
  return (
    <header className="bg-primary-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary-800 font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Kanaka PAC</h1>
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
