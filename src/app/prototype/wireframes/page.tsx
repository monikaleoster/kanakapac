"use client";

/**
 * PROTOTYPE — THROWAWAY. Not production code, not a real route for users.
 *
 * Question: what should the multi-school platform look like, across its four
 * surfaces? Three structurally different variants per surface, switchable via
 * ?surface=&variant= and the floating bar at the bottom.
 *
 *   /prototype/wireframes?surface=public&variant=A
 *
 * Grey-box on purpose: these answer "what goes where", not "what colour".
 */
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PrototypeSwitcher from "@/components/PrototypeSwitcher";
import { Browser } from "./wire";
import { publicVariants } from "./public-variants";
import { memberVariants } from "./member-variants";
import { superadminVariants } from "./superadmin-variants";
import { onboardingVariants } from "./onboarding-variants";

const SURFACES = {
  public: {
    label: "Public school site",
    url: "maple-ridge.pacplatform.ca",
    blurb: "What a parent sees. No account, one School's content only.",
    variants: publicVariants,
  },
  member: {
    label: "Member admin",
    url: "maple-ridge.pacplatform.ca/admin",
    blurb: "An Owner or Editor working inside their own School.",
    variants: memberVariants,
  },
  superadmin: {
    label: "Superadmin console",
    url: "pacplatform.ca/admin",
    blurb: "The platform operator, across every School. Never a Member of one.",
    variants: superadminVariants,
  },
  onboarding: {
    label: "New School onboarding",
    url: "pacplatform.ca/admin/schools/new",
    blurb: "Nothing to a live School: name, permanent slug, first Owner.",
    variants: onboardingVariants,
  },
} as const;

type SurfaceKey = keyof typeof SURFACES;

function Wireframes() {
  const router = useRouter();
  const params = useSearchParams();

  const surfaceKey = ((params.get("surface") as SurfaceKey) in SURFACES
    ? (params.get("surface") as SurfaceKey)
    : "public") as SurfaceKey;
  const surface = SURFACES[surfaceKey];

  const variantKey = surface.variants.some((v) => v.key === params.get("variant"))
    ? (params.get("variant") as string)
    : "A";
  const Active =
    surface.variants.find((v) => v.key === variantKey)?.Component ?? surface.variants[0].Component;

  const go = (next: Partial<{ surface: string; variant: string }>) => {
    const q = new URLSearchParams({ surface: surfaceKey, variant: variantKey, ...next });
    router.replace(`/prototype/wireframes?${q.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-200/60 pb-28">
      <div className="mx-auto max-w-5xl px-5 py-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
              Prototype · throwaway wireframes
            </div>
            <h1 className="text-lg font-semibold text-gray-800">{surface.label}</h1>
            <p className="text-xs text-gray-600">{surface.blurb}</p>
          </div>
          <div className="text-right font-mono text-[10px] text-gray-500">
            {surface.variants.length} variants · ← → to flip
          </div>
        </div>

        <Browser url={surface.url}>
          <Active />
        </Browser>
      </div>

      <PrototypeSwitcher
        variants={surface.variants.map(({ key, name }) => ({ key, name }))}
        current={variantKey}
        onChange={(key) => go({ variant: key })}
      >
        <select
          value={surfaceKey}
          onChange={(e) => go({ surface: e.target.value, variant: "A" })}
          className="rounded-full bg-white/15 px-3 py-1.5 text-xs text-white outline-none"
          aria-label="Surface"
        >
          {Object.entries(SURFACES).map(([key, s]) => (
            <option key={key} value={key} className="text-black">
              {s.label}
            </option>
          ))}
        </select>
      </PrototypeSwitcher>
    </div>
  );
}

export default function WireframesPage() {
  return (
    <Suspense>
      <Wireframes />
    </Suspense>
  );
}
