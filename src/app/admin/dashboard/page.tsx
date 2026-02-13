"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminDashboardPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage PAC website content</p>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/admin" })}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors"
                >
                    Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    href="/admin/events"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">Events</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Create, edit, and delete PAC events.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Events &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/minutes"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">
                        Meeting Minutes
                    </h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Post and manage meeting minutes.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Minutes &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/announcements"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Post and manage announcements.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Announcements &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/policies"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-purple-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">Policies</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Upload and manage PAC policies.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Policies &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/team"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-pink-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">Executive Team</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Manage executive team members.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Team &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/subscribers"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-orange-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">Subscribers</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        Manage email subscribers.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Manage Subscribers &rarr;
                    </span>
                </Link>

                <Link
                    href="/admin/settings"
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-gray-500"
                >
                    <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        School name, contact info, logo.
                    </p>
                    <span className="text-primary-600 text-sm font-medium mt-4 inline-block">
                        Edit Settings &rarr;
                    </span>
                </Link>
            </div>
        </div>
    );
}
