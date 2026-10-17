/** PROTOTYPE — three structurally different Superadmin consoles. Throwaway. */
import { Box, Btn, Chip, Note, SectionLabel } from "./wire";

const SCHOOLS = [
  { slug: "maple-ridge", name: "Maple Ridge Elementary", status: "Live", members: 3, last: "2 days ago" },
  { slug: "kanaka-creek", name: "Kanaka Creek Elementary", status: "Live", members: 5, last: "6 hours ago" },
  { slug: "eric-langton", name: "Eric Langton Elementary", status: "Suspended", members: 2, last: "4 months ago" },
  { slug: "westview", name: "Westview Secondary", status: "Live", members: 4, last: "3 weeks ago" },
  { slug: "golden-ears", name: "Golden Ears Elementary", status: "Invited", members: 1, last: "never" },
];

function OperatorBar() {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 bg-gray-800 px-5 py-3">
      <div className="flex items-center gap-2">
        <Chip tone="gray">Superadmin</Chip>
        <span className="text-xs text-gray-300">pacsolution.ca/admin</span>
      </div>
      <span className="text-[11px] text-gray-400">ops@vectorlocal.ca</span>
    </div>
  );
}

/** A — one dense table. Every School, every action, one screen. */
export function SuperA() {
  return (
    <div>
      <OperatorBar />
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-56 rounded border border-gray-300 bg-white" />
          {["All", "Live", "Suspended", "Invited"].map((f) => (
            <Chip key={f} tone={f === "All" ? "dark" : "outline"}>
              {f}
            </Chip>
          ))}
        </div>
        <Btn primary>Create School</Btn>
      </div>
      <table className="w-full text-left text-xs">
        <thead className="border-y border-gray-200 bg-gray-50 font-mono text-[10px] uppercase tracking-wider text-gray-400">
          <tr>
            <th className="px-5 py-2">Slug</th>
            <th className="px-5 py-2">School</th>
            <th className="px-5 py-2">Status</th>
            <th className="px-5 py-2">Members</th>
            <th className="px-5 py-2">Last publish</th>
            <th className="px-5 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {SCHOOLS.map((s) => (
            <tr key={s.slug}>
              <td className="px-5 py-3 font-mono text-[11px] text-gray-600">{s.slug}</td>
              <td className="px-5 py-3 font-medium text-gray-800">{s.name}</td>
              <td className="px-5 py-3">
                <Chip tone={s.status === "Live" ? "gray" : "outline"}>{s.status}</Chip>
              </td>
              <td className="px-5 py-3 text-gray-500">{s.members}</td>
              <td className="px-5 py-3 text-gray-500">{s.last}</td>
              <td className="px-5 py-3 text-[11px] text-gray-400">
                Impersonate · Export · Suspend · Delete
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5">
        <Note>
          The operator view that matches the job: scan all Schools, act on one row. Destructive actions
          (Delete) sit one click from routine ones (Export) — the confirm step has to carry real weight.
        </Note>
      </div>
    </div>
  );
}

/** B — a card per School, health first. Built for noticing, not for acting. */
export function SuperB() {
  return (
    <div>
      <OperatorBar />
      <div className="flex items-center justify-between px-5 py-3">
        <SectionLabel>5 Schools · 1 suspended · 1 never published</SectionLabel>
        <Btn primary>Create School</Btn>
      </div>
      <div className="grid grid-cols-2 gap-4 px-5 pb-5">
        {SCHOOLS.map((s) => (
          <div key={s.slug} className="rounded border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Box label="" h="h-8" className="w-8" />
                <div>
                  <div className="text-sm font-medium text-gray-800">{s.name}</div>
                  <div className="font-mono text-[10px] text-gray-400">{s.slug}.pacsolution.ca</div>
                </div>
              </div>
              <Chip tone={s.status === "Live" ? "dark" : "outline"}>{s.status}</Chip>
            </div>
            <div className="mt-3 flex items-end gap-1">
              {[6, 3, 8, 2, 5, 9, 4, 1, 7, 3, 6, 2].map((h, i) => (
                <div key={i} className="w-2 rounded-sm bg-gray-200" style={{ height: h * 3 }} />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
              <span>{s.members} members · last publish {s.last}</span>
              <span className="text-gray-400">Open ▸</span>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 pb-4">
        <Note>
          Answers &ldquo;which School is going quiet?&rdquo; at a glance, which a table buries. Costs a lot of
          screen per School and stops working somewhere around 20 of them.
        </Note>
      </div>
    </div>
  );
}

/** C — command-driven. One input; everything is a verb. */
export function SuperC() {
  return (
    <div>
      <OperatorBar />
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
            <span className="font-mono text-sm text-gray-400">&gt;</span>
            <span className="text-sm text-gray-400">Type a School or a command…</span>
          </div>
          <div className="p-2">
            <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-gray-400">
              Commands
            </div>
            {["Create School…", "Export School…", "Suspend School…", "Impersonate…", "Delete School…"].map((c) => (
              <div key={c} className="flex items-center justify-between rounded px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-100">
                <span>{c}</span>
                <span className="font-mono text-[10px] text-gray-400">↵</span>
              </div>
            ))}
            <div className="mt-2 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-gray-400">
              Recent Schools
            </div>
            {SCHOOLS.slice(0, 3).map((s) => (
              <div key={s.slug} className="flex items-center justify-between rounded px-2 py-1.5 text-xs">
                <span className="text-gray-700">{s.name}</span>
                <span className="font-mono text-[10px] text-gray-400">{s.slug}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[["5", "Schools"], ["1", "Suspended"], ["218", "Subscribers"]].map(([n, l]) => (
            <div key={l} className="rounded border border-gray-200 p-3">
              <div className="text-xl font-semibold text-gray-700">{n}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-gray-400">{l}</div>
            </div>
          ))}
        </div>
        <Note>
          Fastest for an operator who already knows the slug, and it scales to any number of Schools.
          Discovers nothing: you cannot see a problem you didn&rsquo;t already go looking for.
        </Note>
      </div>
    </div>
  );
}

export const superadminVariants = [
  { key: "A", name: "Schools table", Component: SuperA },
  { key: "B", name: "Fleet cards", Component: SuperB },
  { key: "C", name: "Command palette", Component: SuperC },
];
