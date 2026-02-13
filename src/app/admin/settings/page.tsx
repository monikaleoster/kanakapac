"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SchoolSettings, defaultSettings } from "@/lib/types";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SchoolSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                setSettings(await res.json());
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            let logoUrl = settings.logoUrl;

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    logoUrl = data.url;
                } else {
                    throw new Error("Logo upload failed");
                }
            }

            const updatedSettings = { ...settings, logoUrl };

            const res = await fetch("/api/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedSettings),
            });

            if (res.ok) {
                setSettings(updatedSettings);
                setMessage("Settings saved successfully!");
                setFile(null);
            } else {
                setMessage("Failed to save settings.");
            }
        } catch (error) {
            console.error(error);
            setMessage("An error occurred.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
                <Link
                    href="/admin"
                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                    &larr; Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mt-2">
                    General Settings
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Manage school information and website branding.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                School Name
                            </label>
                            <input
                                type="text"
                                value={settings.schoolName}
                                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                PAC Name
                            </label>
                            <input
                                type="text"
                                value={settings.pacName}
                                onChange={(e) => setSettings({ ...settings, pacName: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                School Logo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                            />
                            {settings.logoUrl && (
                                <p className="mt-1 text-xs text-gray-500">Current: {settings.logoUrl.split('/').pop()}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                value={settings.address}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City, Province
                            </label>
                            <input
                                type="text"
                                value={settings.city}
                                onChange={(e) => setSettings({ ...settings, city: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Meeting Time
                        </label>
                        <input
                            type="text"
                            value={settings.meetingTime || ""}
                            onChange={(e) => setSettings({ ...settings, meetingTime: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="e.g. First Wednesday of each month, 7:00 PM"
                        />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                        {message && (
                            <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                                {message}
                            </p>
                        )}
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-auto bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
