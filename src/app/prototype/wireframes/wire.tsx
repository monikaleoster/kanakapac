/**
 * PROTOTYPE — throwaway wireframe primitives. Not production code.
 *
 * Deliberately grey-box: no brand colour, no real typography. The question
 * these wireframes answer is "what goes where", not "what colour is it".
 */

export function Box({
  label,
  className = "",
  h = "h-24",
}: {
  label?: string;
  className?: string;
  h?: string;
}) {
  return (
    <div
      className={`${h} ${className} flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-100 px-2 text-center font-mono text-[10px] uppercase tracking-wider text-gray-400`}
    >
      {label}
    </div>
  );
}

/** A placeholder line of text. `w` is a tailwind width class. */
export function Bar({ w = "w-full", className = "" }: { w?: string; className?: string }) {
  return <div className={`h-2 rounded bg-gray-200 ${w} ${className}`} />;
}

export function Lines({ n = 3, className = "" }: { n?: number; className?: string }) {
  const widths = ["w-full", "w-11/12", "w-10/12", "w-9/12", "w-8/12"];
  return (
    <div className={`space-y-1.5 ${className}`}>
      {Array.from({ length: n }).map((_, i) => (
        <Bar key={i} w={widths[i % widths.length]} />
      ))}
    </div>
  );
}

export function Chip({ children, tone = "gray" }: { children: React.ReactNode; tone?: "gray" | "dark" | "outline" }) {
  const tones = {
    gray: "bg-gray-200 text-gray-600",
    dark: "bg-gray-700 text-white",
    outline: "border border-gray-300 text-gray-500",
  } as const;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({ children, primary = false }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded px-3 py-1.5 text-xs font-medium ${
        primary ? "bg-gray-800 text-white" : "border border-gray-300 bg-white text-gray-600"
      }`}
    >
      {children}
    </span>
  );
}

export function Field({ label, value, hint }: { label: string; value?: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      <span className="flex h-9 items-center rounded border border-gray-300 bg-white px-3 text-xs text-gray-400">
        {value ?? ""}
      </span>
      {hint && <span className="mt-1 block text-[10px] text-gray-400">{hint}</span>}
    </label>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-gray-400">{children}</h3>
  );
}

/** Fake browser chrome, so each wireframe declares which URL it lives at. */
export function Browser({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
        </div>
        <div className="ml-2 flex-1 rounded bg-white px-2 py-1 font-mono text-[11px] text-gray-500">{url}</div>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  );
}

/** Marginal note calling out an intent the boxes can't express. */
export function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-3 border-l-2 border-gray-300 pl-3 text-xs italic text-gray-500">{children}</p>
  );
}
