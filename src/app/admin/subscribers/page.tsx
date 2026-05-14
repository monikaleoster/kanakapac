"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Subscriber {
    id: string;
    email: string;
    subscribedAt: string;
}

interface SendResult {
    sentCount: number;
    totalSubscribers: number;
    errors?: string[];
}

export default function AdminSubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailForm, setEmailForm] = useState({ subject: "", content: "", type: "announcement" });
    const [sending, setSending] = useState(false);
    const [sendResult, setSendResult] = useState<SendResult | null>(null);

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

    function openEmailModal() {
        setSendResult(null);
        setEmailForm({ subject: "", content: "", type: "announcement" });
        setShowEmailModal(true);
    }

    async function handleSendEmail(e: React.FormEvent) {
        e.preventDefault();
        setSending(true);
        setSendResult(null);
        try {
            const res = await fetch("/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: emailForm.type,
                    subject: emailForm.subject,
                    title: emailForm.subject,
                    content: emailForm.content,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSendResult(data);
            } else {
                alert(data.error || "Failed to send emails.");
            }
        } catch {
            alert("An error occurred while sending emails.");
        } finally {
            setSending(false);
        }
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
                        onClick={openEmailModal}
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

            {/* Email Compose Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-auto shadow-xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Send Email to Subscribers</h3>

                        {sendResult ? (
                            <div className="text-center py-4">
                                <p className="text-green-700 font-medium text-lg mb-1">
                                    Sent to {sendResult.sentCount} / {sendResult.totalSubscribers} subscribers
                                </p>
                                {sendResult.errors && sendResult.errors.length > 0 && (
                                    <div className="mt-3 text-left bg-red-50 border border-red-200 rounded p-3">
                                        <p className="text-red-700 text-sm font-medium mb-1">Failed to send to:</p>
                                        <ul className="text-red-600 text-sm list-disc list-inside">
                                            {sendResult.errors.map(e => <li key={e}>{e}</li>)}
                                        </ul>
                                    </div>
                                )}
                                <button
                                    onClick={() => setShowEmailModal(false)}
                                    className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSendEmail} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={emailForm.type}
                                        onChange={(e) => setEmailForm({ ...emailForm, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        <option value="announcement">Announcement</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        value={emailForm.subject}
                                        onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                        placeholder="Email subject line"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        value={emailForm.content}
                                        onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                                        rows={6}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                        placeholder="Write your message here..."
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    This will send to all {subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""}.
                                </p>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmailModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                                        disabled={sending}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                                        disabled={sending}
                                    >
                                        {sending ? "Sending..." : `Send to ${subscribers.length} subscriber${subscribers.length !== 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}