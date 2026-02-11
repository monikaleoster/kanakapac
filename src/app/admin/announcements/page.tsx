"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AnnouncementData {
  id: string;
  title: string;
  content: string;
  priority: "normal" | "urgent";
  publishedAt: string;
  expiresAt: string | null;
}

const emptyAnnouncement: {
  title: string;
  content: string;
  priority: "normal" | "urgent";
  expiresAt: string;
} = {
  title: "",
  content: "",
  priority: "normal",
  expiresAt: "",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [editing, setEditing] = useState<AnnouncementData | null>(null);
  const [form, setForm] = useState(emptyAnnouncement);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    const res = await fetch("/api/announcements");
    if (res.ok) {
      setAnnouncements(await res.json());
    }
  }

  function handleEdit(item: AnnouncementData) {
    setEditing(item);
    setForm({
      title: item.title,
      content: item.content,
      priority: item.priority,
      expiresAt: item.expiresAt
        ? new Date(item.expiresAt).toISOString().split("T")[0]
        : "",
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyAnnouncement);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      ...form,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt + "T23:59:59").toISOString()
        : null,
    };

    if (editing) {
      await fetch("/api/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, ...payload }),
      });
    } else {
      await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyAnnouncement);
    fetchAnnouncements();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    await fetch(`/api/announcements?id=${id}`, { method: "DELETE" });
    fetchAnnouncements();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/admin"
            className="text-primary-600 hover:text-primary-800 text-sm font-medium"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            Manage Announcements
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          + New Announcement
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Announcement" : "Post New Announcement"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      priority: e.target.value as "normal" | "urgent",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires On (optional)
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
              >
                {editing ? "Update Announcement" : "Post Announcement"}
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

      {/* Announcements List */}
      <div className="space-y-3">
        {announcements.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg shadow-sm border p-4 flex items-center justify-between ${
              item.priority === "urgent"
                ? "bg-red-50 border-red-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                {item.priority === "urgent" && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                    Urgent
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Published:{" "}
                {new Date(item.publishedAt).toLocaleDateString()}
                {item.expiresAt &&
                  ` | Expires: ${new Date(item.expiresAt).toLocaleDateString()}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="text-primary-600 hover:text-primary-800 text-sm font-medium px-3 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No announcements yet. Click &quot;+ New Announcement&quot; to create
            one.
          </p>
        )}
      </div>
    </div>
  );
}
