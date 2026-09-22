"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Article } from "@/lib/types";
import { uploadImage } from "@/lib/uploadImage";
import ArticleCoverImage from "@/components/ArticleCoverImage";

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

const MAX_COVER_GENERATIONS = 5;

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifyArticle, setNotifyArticle] = useState<Article | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverPrompt, setCoverPrompt] = useState("");
  const [coverPromptEdited, setCoverPromptEdited] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [coverGenerationCount, setCoverGenerationCount] = useState(0);
  const [coverGenerationError, setCoverGenerationError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const res = await fetch("/api/articles");
    if (res.ok) {
      setArticles(await res.json());
    }
  }

  function seedCoverGeneration(titleForPrompt: string) {
    setCoverPrompt(titleForPrompt);
    setCoverPromptEdited(false);
    setCoverGenerationCount(0);
    setCoverGenerationError(null);
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
    seedCoverGeneration(item.title);
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyForm);
    seedCoverGeneration("");
    setShowForm(true);
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title }));
    if (!coverPromptEdited) {
      setCoverPrompt(title);
    }
  }

  function handleCoverPromptChange(prompt: string) {
    setCoverPrompt(prompt);
    setCoverPromptEdited(true);
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

  async function handleGenerateCoverImage() {
    if (generatingCover || coverGenerationCount >= MAX_COVER_GENERATIONS) return;

    setGeneratingCover(true);
    setCoverGenerationError(null);
    setCoverGenerationCount((c) => c + 1);

    try {
      const res = await fetch("/api/articles/generate-cover-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: coverPrompt }),
      });

      if (!res.ok) {
        throw new Error("Cover image generation failed");
      }

      const data = await res.json();
      setForm((f) => ({ ...f, coverImageUrl: data.fileUrl }));
    } catch {
      setCoverGenerationError(
        "Couldn't generate a cover image. Try again, or upload your own instead."
      );
    } finally {
      setGeneratingCover(false);
    }
  }

  async function handleConfirmNotify() {
    if (!notifyArticle) return;
    setNotifying(true);
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          subject: `New Article: ${notifyArticle.title}`,
          title: notifyArticle.title,
          author: notifyArticle.author,
          body: notifyArticle.body,
        }),
      });
    } finally {
      setNotifying(false);
      setNotifyArticle(null);
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
          setNotifyArticle(updated);
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

      setNotifyArticle(published);
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

      {/* Notify Subscribers Modal */}
      {notifyArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Article Published!</h3>
            <p className="text-gray-600 mb-6">Would you like to email this to all subscribers?</p>
            <div className="flex justify-end gap-3">
              <button
                data-testid="skip-notify-btn"
                onClick={() => setNotifyArticle(null)}
                disabled={notifying}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors disabled:opacity-50"
              >
                No Thanks
              </button>
              <button
                data-testid="confirm-notify-btn"
                onClick={handleConfirmNotify}
                disabled={notifying}
                className="px-4 py-2 bg-primary-600 text-white rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
              >
                {notifying ? "Sending..." : "Yes, Notify Subscribers"}
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
                  onChange={(e) => handleTitleChange(e.target.value)}
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
              <ArticleCoverImage
                article={{ coverImageUrl: form.coverImageUrl || undefined }}
                alt="Cover preview"
                className="w-full max-h-48 object-cover rounded-md mb-2"
              />

              <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
                <label htmlFor="article-cover-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                  AI cover image prompt
                </label>
                <textarea
                  id="article-cover-prompt"
                  value={coverPrompt}
                  onChange={(e) => handleCoverPromptChange(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={handleGenerateCoverImage}
                    disabled={
                      generatingCover ||
                      coverGenerationCount >= MAX_COVER_GENERATIONS ||
                      !coverPrompt.trim()
                    }
                    className="bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                  >
                    {generatingCover
                      ? "Generating..."
                      : coverGenerationCount === 0
                        ? "Generate Cover Image"
                        : "Regenerate Cover Image"}
                  </button>
                  <span className="text-xs text-gray-500">
                    {MAX_COVER_GENERATIONS - coverGenerationCount} generation
                    {MAX_COVER_GENERATIONS - coverGenerationCount === 1 ? "" : "s"} left
                  </span>
                </div>
                {coverGenerationError && (
                  <p className="text-sm text-red-600 mt-2">{coverGenerationError}</p>
                )}
              </div>

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
