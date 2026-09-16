"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [status, setStatus] = useState<Status>("idle");
    const [errorMessage, setErrorMessage] = useState("");

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
            } else {
                setStatus("error");
                setErrorMessage(data.error || "Something went wrong. Please try again.");
            }
        } catch {
            setStatus("error");
            setErrorMessage("Something went wrong. Please try again.");
        }
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
                    value={formData.name}
                    onChange={handleChange}
                    required
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
                    value={formData.email}
                    onChange={handleChange}
                    required
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
                    value={formData.subject}
                    onChange={handleChange}
                    required
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
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your message..."
                />
            </div>
            {status === "error" && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
            )}
            <button
                type="submit"
                disabled={status === "loading"}
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
                {status === "loading" ? "Sending…" : "Send Message"}
            </button>
        </form>
    );
}
