"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface PolicyData {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    updatedAt: string;
}

const emptyPolicy = {
    title: "",
    description: "",
    fileUrl: "",
};

export default function AdminPoliciesPage() {
    const [policies, setPolicies] = useState<PolicyData[]>([]);
    const [editing, setEditing] = useState<PolicyData | null>(null);
    const [form, setForm] = useState(emptyPolicy);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    async function fetchPolicies() {
        const res = await fetch("/api/policies");
        if (res.ok) {
            setPolicies(await res.json());
        }
    }

    function handleEdit(item: PolicyData) {
        setEditing(item);
        setForm({
            title: item.title,
            description: item.description,
            fileUrl: item.fileUrl,
        });
        setShowForm(true);
    }

    function handleNew() {
        setEditing(null);
        setForm(emptyPolicy);
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
            await fetch("/api/policies", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, ...form }),
            });
        } else {
            await fetch("/api/policies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        }

        setShowForm(false);
        setEditing(null);
        setForm(emptyPolicy);
        fetchPolicies();
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this policy?")) return;
        await fetch(`/api/policies?id=${id}`, { method: "DELETE" });
        fetchPolicies();
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
                        Manage Policies
                    </h1>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                    + New Policy
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-4">
                        {editing ? "Edit Policy" : "Upload New Policy"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="e.g., Constitution & Bylaws"
                                required
                            />
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
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Brief description of the document..."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Document (PDF, DOC, DOCX, TXT)
                            </label>
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                required={!form.fileUrl} // Required if no file url (new) or if we cleared it (edit) - actually logic is simple: if empty and not editing, required.
                            />
                            {form.fileUrl && (
                                <p className="mt-1 text-sm text-green-600">
                                    File uploaded: {form.fileUrl.split("/").pop()}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
                                disabled={!form.fileUrl}
                            >
                                {editing ? "Update Policy" : "Upload Policy"}
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

            {/* Policies List */}
            <div className="space-y-3">
                {policies.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between"
                    >
                        <div>
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.description}</p>
                            <a href={item.fileUrl} target="_blank" className="text-xs text-primary-600 hover:underline mt-1 inline-block">View Document</a>
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
                {policies.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        No policies uploaded yet. Click &quot;+ New Policy&quot; to add one.
                    </p>
                )}
            </div>
        </div>
    );
}
