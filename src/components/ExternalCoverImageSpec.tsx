"use client";

import { useState } from "react";
import { buildExternalCoverImageSpec } from "@/lib/externalCoverImageSpec";

export default function ExternalCoverImageSpec({ title }: { title: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const spec = buildExternalCoverImageSpec(title);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(spec);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the text below remains manually selectable.
    }
  }

  return (
    <div className="mb-3 p-3 border border-gray-200 rounded-md bg-gray-50">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="text-sm font-medium text-gray-700 flex items-center gap-1"
        aria-expanded={expanded}
      >
        <span>{expanded ? "▾" : "▸"}</span>
        Generate with an external AI tool (free)
      </button>

      {expanded && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-2">
            Copy this into ChatGPT, Gemini, Midjourney, or any other AI tool, then
            upload the result below.
          </p>
          <pre className="whitespace-pre-wrap text-xs text-gray-700 bg-white border border-gray-200 rounded-md p-2 mb-2">
            {spec}
          </pre>
          <button
            type="button"
            onClick={handleCopy}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-100"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      )}
    </div>
  );
}
