"use client";

import { useState } from "react";

interface RsvpModalProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RsvpModal({ eventId, eventTitle, isOpen, onClose }: RsvpModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "duplicate" | "error">("idle");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");

    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, name, email: email || undefined }),
    });

    if (res.status === 201) {
      setStatus("success");
    } else if (res.status === 409) {
      setStatus("duplicate");
    } else {
      setStatus("error");
    }
  }

  function handleClose() {
    setName("");
    setEmail("");
    setStatus("idle");
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">RSVP — {eventTitle}</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {status === "success" ? (
          <div className="text-center py-4">
            <p className="text-green-700 font-medium mb-4">
              You&apos;re going! See you there.
            </p>
            <button
              onClick={handleClose}
              className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status === "duplicate" && (
              <p className="text-red-600 text-sm">
                You&apos;ve already marked yourself as going.
              </p>
            )}
            {status === "error" && (
              <p className="text-red-600 text-sm">
                Something went wrong. Please try again.
              </p>
            )}

            <div>
              <label htmlFor="modal-rsvp-name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                id="modal-rsvp-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Full name"
                required
              />
            </div>

            <div>
              <label htmlFor="modal-rsvp-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email (optional)
              </label>
              <input
                id="modal-rsvp-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="For event updates"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {status === "submitting" ? "Submitting..." : "RSVP Now"}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
