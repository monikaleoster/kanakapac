"use client";

/**
 * PROTOTYPE — floating variant switcher. Throwaway; never ships to users.
 * Deliberately styled nothing like the app so it can't be mistaken for the
 * design being evaluated.
 */
import { useEffect } from "react";

export type PrototypeVariant = { key: string; name: string };

export default function PrototypeSwitcher({
  variants,
  current,
  onChange,
  children,
}: {
  variants: PrototypeVariant[];
  current: string;
  onChange: (key: string) => void;
  /** Optional extra control rendered to the left of the variant pill. */
  children?: React.ReactNode;
}) {
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === current)
  );
  const cycle = (delta: number) => {
    const next = (index + delta + variants.length) % variants.length;
    onChange(variants[next].key);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.key === "ArrowLeft") cycle(-1);
      if (e.key === "ArrowRight") cycle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  const variant = variants[index];

  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/90 p-1.5 pl-2 text-white shadow-2xl ring-1 ring-white/20 backdrop-blur">
      {children}
      <button
        onClick={() => cycle(-1)}
        aria-label="Previous variant"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"
      >
        ←
      </button>
      <span className="min-w-[13rem] px-2 text-center font-mono text-xs">
        <span className="font-bold">{variant.key}</span>
        <span className="text-white/60"> · {variant.name}</span>
      </span>
      <button
        onClick={() => cycle(1)}
        aria-label="Next variant"
        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/15"
      >
        →
      </button>
    </div>
  );
}
