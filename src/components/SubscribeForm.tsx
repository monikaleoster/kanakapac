"use client";

import { useState } from "react";

export default function SubscribeForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("You are now subscribed to updates!");
                setEmail("");
            } else {
                setStatus("error");
                setMessage(data.error || "Subscription failed. Please try again.");
            }
        } catch (error) {
            setStatus("error");
            setMessage("An error occurred. Please try again.");
        }
    }

    return (
        <div className="bg-primary-50 rounded-lg p-8 border border-primary-100 max-w-2xl mx-auto my-12 text-center">
            <h3 className="text-xl font-bold text-primary-900 mb-2">
                Stay Updated!
            </h3>
            <p className="text-primary-700 mb-6">
                Subscribe to get the latest news, events, and announcements delivered to your inbox.
            </p>

            {status === "success" ? (
                <div className="bg-green-100 text-green-800 p-4 rounded-md">
                    {message}
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-grow px-4 py-2 border border-primary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        required
                        disabled={status === "loading"}
                    />
                    <button
                        type="submit"
                        className="bg-primary-600 text-white px-6 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
                        disabled={status === "loading"}
                    >
                        {status === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                </form>
            )}
            {status === "error" && (
                <p className="text-red-500 text-sm mt-2">{message}</p>
            )}
        </div>
    );
}
