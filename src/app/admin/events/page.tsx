"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
}

const emptyEvent = {
  title: "",
  date: "",
  time: "",
  location: "",
  description: "",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [editing, setEditing] = useState<EventData | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    if (res.ok) {
      setEvents(await res.json());
    }
  }

  function handleEdit(event: EventData) {
    setEditing(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyEvent);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editing) {
      await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, ...form }),
      });
    } else {
      await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyEvent);
    fetchEvents();
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/events?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchEvents();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ... (keep existing header) */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Manage Events
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Event" : "Create New Event"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  // Clean up date value if needed or keep as is
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
              >
                {editing ? "Update Event" : "Create Event"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">
                {event.date} at {event.time} - {event.location}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(event)}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteClick(event.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No events yet. Click &quot;+ New Event&quot; to create one.
          </p>
        )}
      </div>
    </div>
  );
}
