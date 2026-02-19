"use client";

import { useState } from "react";

export default function FloatingPromo() {
    const [showTooltip, setShowTooltip] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Tooltip */}
            {showTooltip && (
                <div className="mb-3 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 w-64 animate-fade-in">
                    <p className="text-sm text-gray-800 font-medium mb-1">
                        ✨ Built by <span className="text-primary-600 font-bold">Vector Local</span>
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                        Need a stunning website for your organization? Let&apos;s talk!
                    </p>
                    <a
                        href="https://www.vectorlocal.ca"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white text-sm font-semibold text-center py-2 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
                    >
                        Book a Free Consultation
                    </a>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="group relative w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
                aria-label="Website built by Vector Local"
            >
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-20" />

                {/* Icon: rocket / code symbol */}
                <svg
                    className="w-7 h-7 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.841m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                    />
                </svg>
            </button>
        </div>
    );
}
