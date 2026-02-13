"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MinutesData {
  id: string;
  title: string;
  date: string;
  content: string;
  fileUrl?: string; // Add optional fileUrl
  createdAt: string;
}

const emptyMinutes = {
  title: "",
  date: "",
  content: "",
  fileUrl: "", // Add default empty fileUrl
};

export default function AdminMinutesPage() {
  const [minutes, setMinutes] = useState<MinutesData[]>([]);
  const [editing, setEditing] = useState<MinutesData | null>(null);
  const [form, setForm] = useState(emptyMinutes);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchMinutes();
  }, []);

  async function fetchMinutes() {
    const res = await fetch("/api/minutes");
    if (res.ok) {
      setMinutes(await res.json());
    }
  }

  function handleEdit(item: MinutesData) {
    setEditing(item);
    setForm({
      title: item.title,
      date: item.date,
      content: item.content,
      fileUrl: item.fileUrl || "",
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyMinutes);
    setShowForm(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setForm((prev) => ({ ...prev, fileUrl: data.fileUrl }));
    } catch (error) {
      console.error("Upload error:", error);
      alert("File upload failed. Please try again.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editing) {
      await fetch("/api/minutes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, ...form }),
      });
    } else {
      await fetch("/api/minutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }

    setShowForm(false);
    setEditing(null);
    setForm(emptyMinutes);
    fetchMinutes();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete these minutes?")) return;
    await fetch(`/api/minutes?id=${id}`, { method: "DELETE" });
    fetchMinutes();
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
            Manage Meeting Minutes
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          + New Minutes
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Edit Minutes" : "Post New Minutes"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., March 2026 General Meeting"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Minutes (PDF, DOC, DOCX, TXT)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {form.fileUrl && (
                  <p className="mt-1 text-sm text-green-600">
                    File uploaded: {form.fileUrl.split("/").pop()}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                value={form.content}
                onChange={(e) =>
                  setForm({ ...form, content: e.target.value })
                }
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                placeholder="## Attendance&#10;&#10;Present: ...&#10;&#10;## Agenda Items&#10;&#10;### 1. Treasurer's Report&#10;- ..."
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use Markdown formatting: ## for headings, - for bullet points,
                **bold**, etc.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
              >
                {editing ? "Update Minutes" : "Post Minutes"}
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

      {/* Minutes List */}
      <div className="space-y-3">
        {minutes.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.date}</p>
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
        {minutes.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No minutes posted yet. Click &quot;+ New Minutes&quot; to create one.
          </p>
        )}
      </div>
    </div>
  );
}
