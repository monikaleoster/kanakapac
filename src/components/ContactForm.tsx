"use client";

import { useState } from "react";

export default function ContactForm() {
    const [status, setStatus] = useState<"idle" | "success">("idle");

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("success");
    }

    if (status === "success") {
        return (
            <div className="bg-green-50 border border-green-200 rounded-md p-6 text-center">
                <p className="text-green-800 font-medium">
                    Thank you for your message! We&apos;ll be in touch soon.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Your Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Full name"
                />
            </div>
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="you@example.com"
                />
            </div>
            <div>
                <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Subject
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="What is this about?"
                />
            </div>
            <div>
                <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your message..."
                />
            </div>
            <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
                Send Message
            </button>
        </form>
    );
}
