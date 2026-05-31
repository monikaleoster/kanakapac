"use client";

import { useState } from "react";

export default function RsvpForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "duplicate" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, name, email }),
    });

    if (res.status === 201) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
        <p className="text-green-800 font-medium">
          You&apos;re on the list! We&apos;ll see you there.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        RSVP for this Event
      </h2>

      {status === "duplicate" && (
        <p className="mb-4 text-red-600 text-sm">
          You&apos;ve already RSVP&apos;d for this event.
        </p>
      )}
      {status === "error" && (
        <p className="mb-4 text-red-600 text-sm">
          Something went wrong. Please try again.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="rsvp-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Name
          </label>
          <input
            id="rsvp-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Full name"
            required
          />
        </div>
        <div>
          <label
            htmlFor="rsvp-email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            id="rsvp-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="you@example.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting..." : "RSVP Now"}
        </button>
      </form>
    </div>
  );
}
