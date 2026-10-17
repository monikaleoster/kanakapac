/** PROTOTYPE — three structurally different new-School onboarding flows. Throwaway. */
import { Box, Btn, Chip, Field, Lines, Note, SectionLabel } from "./wire";

/** A — one form, one button. Matches issue 11's "in one step". */
export function OnboardA() {
  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="text-sm font-semibold text-gray-800">Create a School</div>
      <p className="mt-1 text-xs text-gray-500">
        Creates the School, its settings, the first Owner, and emails them a sign-in link.
      </p>
      <div className="mt-6 space-y-4">
        <Field label="School name" value="Maple Ridge Elementary" />
        <Field label="PAC name" value="Maple Ridge PAC" hint="Shown alongside the School name. Often different." />
        <div>
          <Field label="Subdomain" value="maple-ridge" hint="maple-ridge.pacsolution.ca" />
          <div className="mt-1 flex items-center gap-2">
            <Chip tone="dark">Available</Chip>
            <span className="text-[10px] text-gray-400">Permanent. Cannot be changed after creation.</span>
          </div>
        </div>
        <Field label="First Owner&rsquo;s email" value="j.tam@example.com" hint="They get a sign-in link immediately." />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Btn primary>Create School</Btn>
        <span className="text-[10px] text-gray-400">4 fields · ~30 seconds</span>
      </div>
      <Note>
        The whole decision is visible at once, which matters because the slug is irreversible — you can
        see it next to the name you are naming it after. No room to explain why a slug was rejected.
      </Note>
    </div>
  );
}

/** B — a wizard. Each irreversible choice gets its own screen. */
export function OnboardB() {
  const steps = ["Identity", "Address", "First Owner", "Review"];
  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium ${
                i <= 1 ? "bg-gray-800 text-white" : "border border-gray-300 text-gray-400"
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-[11px] ${i <= 1 ? "text-gray-800" : "text-gray-400"}`}>{s}</span>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="mt-8 rounded border border-gray-200 p-5">
        <SectionLabel>Step 2 of 4 — Address</SectionLabel>
        <div className="text-sm font-medium text-gray-800">Choose this School&rsquo;s subdomain</div>
        <p className="mt-1 text-xs text-gray-500">
          Parents will reach the site here forever. It cannot be changed, and a retired subdomain is
          never reissued — so if two districts have a Maple Ridge, settle it now.
        </p>
        <div className="mt-4 flex items-end gap-2">
          <div className="flex-1">
            <Field label="Subdomain" value="maple-ridge" />
          </div>
          <span className="pb-2 font-mono text-xs text-gray-400">.pacsolution.ca</span>
        </div>
        <div className="mt-3 space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2 text-gray-500">
            <Chip tone="dark">✓</Chip> Lowercase letters, numbers and hyphens
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Chip tone="dark">✓</Chip> Not a reserved infrastructure name
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Chip tone="dark">✓</Chip> Not in use and not retired
          </div>
        </div>
        <div className="mt-5 flex justify-between">
          <Btn>Back</Btn>
          <Btn primary>Continue</Btn>
        </div>
      </div>
      <Note>
        Gives the permanent decision a screen of its own, with the rejection rules spelled out before you
        hit one. Four screens for what is genuinely four fields — tedious on the tenth School.
      </Note>
    </div>
  );
}

/** C — form on the left, the School's public site building itself on the right. */
export function OnboardC() {
  return (
    <div className="flex min-h-[520px]">
      <div className="w-80 shrink-0 border-r border-gray-200 p-5">
        <div className="text-sm font-semibold text-gray-800">New School</div>
        <div className="mt-5 space-y-4">
          <Field label="School name" value="Maple Ridge Elementary" />
          <Field label="PAC name" value="Maple Ridge PAC" />
          <Field label="Subdomain" value="maple-ridge" hint="Permanent" />
          <Field label="First Owner&rsquo;s email" value="j.tam@example.com" />
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">Brand colour</span>
            <div className="flex gap-2">
              {["bg-gray-300", "bg-gray-400", "bg-gray-500", "bg-gray-700"].map((c) => (
                <span key={c} className={`h-7 w-7 rounded ${c}`} />
              ))}
            </div>
          </div>
          <div>
            <span className="mb-1 block text-xs font-medium text-gray-600">Crest</span>
            <Box label="drop logo" h="h-16" />
          </div>
        </div>
        <div className="mt-6">
          <Btn primary>Create &amp; invite Owner</Btn>
        </div>
      </div>
      <div className="flex-1 bg-gray-50 p-5">
        <SectionLabel>Live preview — what parents will see</SectionLabel>
        <div className="overflow-hidden rounded border border-gray-300 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-3 py-1.5 font-mono text-[10px] text-gray-500">
            maple-ridge.pacsolution.ca
          </div>
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <Box label="" h="h-7" className="w-7" />
            <div>
              <div className="text-xs font-semibold text-gray-800">Maple Ridge Elementary</div>
              <div className="text-[10px] text-gray-500">Maple Ridge PAC</div>
            </div>
          </div>
          <div className="space-y-3 p-4">
            <Box label="no events yet" h="h-16" />
            <Box label="no announcements yet" h="h-12" />
            <Lines n={2} />
          </div>
        </div>
        <Note>
          Shows the empty state at the moment it is created, which is the state every new School actually
          launches in. Branding here invites fiddling during a step that should take a minute.
        </Note>
      </div>
    </div>
  );
}

export const onboardingVariants = [
  { key: "A", name: "Single form", Component: OnboardA },
  { key: "B", name: "Wizard", Component: OnboardB },
  { key: "C", name: "Split live preview", Component: OnboardC },
];
