"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscribers();
    }, []);

    async function fetchSubscribers() {
        try {
            const res = await fetch("/api/subscribe");
            if (res.ok) {
                setSubscribers(await res.json());
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(email: string) {
        setDeleteId(email);
    }

    async function confirmDelete() {
        if (!deleteId) return;
        await fetch(`/api/subscribe?email=${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        setDeleteId(null);
        fetchSubscribers();
    }

    function handleCopyAll() {
        const emails = subscribers.map((s) => s.email).join(", ");
        navigator.clipboard.writeText(emails);
        alert("All emails copied to clipboard!");
    }

    async function handleSendUpdate() {
        // Simple alert is fine for this simulation as it's not a destructive action on data
        if (!confirm("Send an update notification to all subscribers? (Simulation)")) return;

        // Simulation of sending emails
        alert(`Simulated: Update sent to ${subscribers.length} subscribers!`);
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
                        Manage Subscribers
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Total Subscribers: {subscribers.length}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopyAll}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
                        disabled={subscribers.length === 0}
                    >
                        Copy All Emails
                    </button>
                    <button
                        onClick={handleSendUpdate}
                        className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
                        disabled={subscribers.length === 0}
                    >
                        Send Update
                    </button>
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">

                    {subscribers.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscribers.map((s) => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(s.subscribedAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(s.email)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-8 text-center text-gray-500">No subscribers yet.</div>
                    )}
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Removal</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to remove <strong>{deleteId}</strong>?
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
