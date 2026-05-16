"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    email?: string;
    order: number;
}

const emptyMember = {
    name: "",
    role: "",
    bio: "",
    email: "",
    order: 0,
};

export default function AdminTeamPage() {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [editing, setEditing] = useState<TeamMember | null>(null);
    const [form, setForm] = useState(emptyMember);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchMembers();
    }, []);

    async function fetchMembers() {
        const res = await fetch("/api/team");
        if (res.ok) {
            const data = await res.json();
            // Ensure sorted by order
            setMembers(data.sort((a: TeamMember, b: TeamMember) => a.order - b.order));
        }
    }

    function handleEdit(item: TeamMember) {
        setEditing(item);
        setForm({
            name: item.name,
            role: item.role,
            bio: item.bio,
            email: item.email || "",
            order: item.order,
        });
        setShowForm(true);
    }

    function handleNew() {
        setEditing(null);
        setForm({ ...emptyMember, order: members.length + 1 });
        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (editing) {
            await fetch("/api/team", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editing, ...form }),
            });
        } else {
            await fetch("/api/team", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
        }

        setShowForm(false);
        setEditing(null);
        setForm(emptyMember);
        fetchMembers();
    }

    function handleDelete(id: string) {
        setDeleteId(id);
    }

    async function handleConfirmDelete() {
        if (!deleteId) return;
        await fetch(`/api/team?id=${deleteId}`, { method: "DELETE" });
        setDeleteId(null);
        fetchMembers();
    }

    async function handleMove(id: string, direction: 'up' | 'down') {
        const index = members.findIndex(m => m.id === id);
        if (index === -1) return;

        const newMembers = [...members];
        if (direction === 'up' && index > 0) {
            const temp = newMembers[index].order;
            newMembers[index].order = newMembers[index - 1].order;
            newMembers[index - 1].order = temp;

            // Optimistic update
            newMembers.sort((a, b) => a.order - b.order);
            setMembers(newMembers);

            // server update (ideally batch, but one by one for now)
            await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMembers[index]) });
            await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMembers[index - 1]) });
        } else if (direction === 'down' && index < members.length - 1) {
            const temp = newMembers[index].order;
            newMembers[index].order = newMembers[index + 1].order;
            newMembers[index + 1].order = temp;

            // Optimistic update
            newMembers.sort((a, b) => a.order - b.order);
            setMembers(newMembers);

            await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMembers[index]) });
            await fetch("/api/team", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newMembers[index + 1]) });
        }
        fetchMembers();
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
                        Manage Executive Team
                    </h1>
                </div>
                <button
                    onClick={handleNew}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                >
                    + Add Member
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete this team member? This action cannot be undone.</p>
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
                        {editing ? "Edit Team Member" : "Add New Team Member"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <input
                                    id="team-name"
                                    type="text"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({ ...form, name: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., Jane Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="team-role" className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <input
                                    id="team-role"
                                    type="text"
                                    value={form.role}
                                    onChange={(e) =>
                                        setForm({ ...form, role: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="e.g., Chairperson"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="team-bio" className="block text-sm font-medium text-gray-700 mb-1">
                                Bio
                            </label>
                            <textarea
                                id="team-bio"
                                value={form.bio}
                                onChange={(e) =>
                                    setForm({ ...form, bio: e.target.value })
                                }
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Brief bio..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="team-email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (Optional)
                                </label>
                                <input
                                    id="team-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({ ...form, email: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder="contact@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="team-order" className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    id="team-order"
                                    type="number"
                                    value={form.order}
                                    onChange={(e) =>
                                        setForm({ ...form, order: parseInt(e.target.value) || 0 })
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700"
                            >
                                {editing ? "Update Member" : "Add Member"}
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

            {/* Team List */}
            <div className="space-y-3">
                {members.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-medium text-gray-900">{item.name}</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.role}</span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-1">{item.bio}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            <div className="flex flex-col mr-2">
                                <button onClick={() => handleMove(item.id, 'up')} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">▲</button>
                                <button onClick={() => handleMove(item.id, 'down')} disabled={index === members.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30">▼</button>
                            </div>
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
                {members.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                        No team members added yet. Click &quot;+ Add Member&quot; to add one.
                    </p>
                )}
            </div>
        </div>
    );
}
