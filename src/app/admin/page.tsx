"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if already authenticated by trying to fetch a protected resource
    fetch("/api/events")
      .then(() => {
        // Try a simple auth check
        setLoading(false);
        // We'll check auth status via cookie presence
        return fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: "" }) });
      })
      .catch(() => setLoading(false));

    // Simple check: see if the admin cookie exists
    setAuthenticated(document.cookie.includes("pac_admin_session"));
    setLoading(false);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthenticated(true);
    } else {
      setError("Invalid password. Please try again.");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setAuthenticated(false);
    setPassword("");
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Admin Login
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Enter the PAC admin password to manage content.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage PAC website content
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/events"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <h2 className="text-lg font-semibold text-gray-900">Events</h2>
          <p className="text-sm text-gray-600 mt-2">
            Create, edit, and delete PAC events.
          </p>
          <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
            Manage Events &rarr;
          </span>
        </Link>

        <Link
          href="/admin/minutes"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Meeting Minutes
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Post and manage meeting minutes.
          </p>
          <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
            Manage Minutes &rarr;
          </span>
        </Link>

        <Link
          href="/admin/announcements"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Announcements
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Post and manage announcements.
          </p>
          <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
            Manage Announcements &rarr;
          </span>
        </Link>
      </div>
    </div>
  );
}
