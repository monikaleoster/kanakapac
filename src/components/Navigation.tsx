"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/minutes", label: "Minutes" },
  { href: "/announcements", label: "Announcements" },
  { href: "/policies", label: "Policies" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav>
      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 rounded-md hover:bg-primary-700"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Desktop navigation */}
      <div className="hidden md:flex md:items-center md:space-x-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              pathname === link.href
                ? "bg-primary-900 text-white"
                : "text-primary-100 hover:bg-primary-700 hover:text-white"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-primary-800 border-t border-primary-700 shadow-lg z-50">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === link.href
                    ? "bg-primary-900 text-white"
                    : "text-primary-100 hover:bg-primary-700 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
