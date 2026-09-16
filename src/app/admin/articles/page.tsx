"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Article } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";

const ArticleEditor = dynamic(() => import("@/components/ArticleEditor"), {
  ssr: false,
});

const emptyForm = {
  title: "",
  author: "",
  excerpt: "",
  body: "",
  coverImageUrl: "",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const res = await fetch("/api/articles");
    if (res.ok) {
      setArticles(await res.json());
    }
  }

  function handleEdit(item: Article) {
    setEditing(item);
    setForm({
      title: item.title,
      author: item.author,
      excerpt: item.excerpt,
      body: item.body,
      coverImageUrl: item.coverImageUrl || "",
    });
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleCoverImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setCoverUploading(true);
    try {
      const fileUrl = await uploadImage(file);
      if (fileUrl) {
        setForm((f) => ({ ...f, coverImageUrl: fileUrl }));
      }
    } finally {
      setCoverUploading(false);
    }
  }

  async function notifySubscribersIfConfirmed(article: Article) {
    const shouldNotify = confirm(
      "Article published! Would you like to email this to all subscribers?"
    );
    if (shouldNotify) {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          subject: `New Article: ${article.title}`,
          title: article.title,
          author: article.author,
          body: article.body,
        }),
      });
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const publishing = submitter?.value === "publish";
    setSaving(true);

    try {
      const payload = {
        ...form,
        coverImageUrl: form.coverImageUrl || undefined,
      };

      if (editing) {
        const updated: Article = {
          ...editing,
          ...payload,
          ...(publishing ? { status: "published" as const } : {}),
        };
        await fetch("/api/articles", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });

        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
        await fetchArticles();

        if (publishing) {
          await notifySubscribersIfConfirmed(updated);
        }
      } else {
        await fetch("/api/articles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, status: "draft" }),
        });

        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
        fetchArticles();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(article: Article) {
    setSaving(true);
    try {
      const published: Article = { ...article, status: "published" };
      await fetch("/api/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(published),
      });

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      await fetchArticles();

      await notifySubscribersIfConfirmed(published);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(id: string) {
    setDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/articles?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchArticles();
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
            Manage Articles
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          + New Article
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this article? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                data-testid="cancel-delete-btn"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="confirm-delete-btn"
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
            {editing ? "Edit Article" : "New Article"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="article-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  id="article-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="article-author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  id="article-author"
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="article-excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="article-excerpt"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label htmlFor="article-cover" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image (optional)
              </label>
              {form.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.coverImageUrl}
                  alt="Cover preview"
                  className="w-full max-h-48 object-cover rounded-md mb-2"
                />
              )}
              <input
                id="article-cover"
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleCoverImageChange}
                disabled={coverUploading}
                className="w-full text-sm text-gray-600"
              />
              {coverUploading && (
                <p className="text-sm text-gray-500 mt-1">Uploading...</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body
              </label>
              <ArticleEditor
                key={editing?.id ?? "new"}
                content={form.body}
                onChange={(html) => setForm((f) => ({ ...f, body: html }))}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing?.status === "published"
                    ? "Save Changes"
                    : editing
                      ? "Update Draft"
                      : "Save as Draft"}
              </button>
              {editing?.status === "draft" && (
                <button
                  type="submit"
                  name="intent"
                  value="publish"
                  disabled={saving}
                  className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Publish
                </button>
              )}
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

      {/* Articles List */}
      <div className="space-y-3">
        {articles.map((item) => (
          <div
            key={item.id}
            className="rounded-lg shadow-sm border border-gray-100 bg-white p-4 flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{item.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    item.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {item.status === "published" ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-gray-500">By {item.author}</p>
            </div>
            <div className="flex gap-2">
              {item.status === "draft" && (
                <button
                  onClick={() => handlePublish(item)}
                  className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1"
                >
                  Publish
                </button>
              )}
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
        {articles.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No articles yet. Click &quot;+ New Article&quot; to create one.
          </p>
        )}
      </div>
    </div>
  );
}
