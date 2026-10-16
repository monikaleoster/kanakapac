/** PROTOTYPE — three structurally different public School sites. Throwaway. */
import { Bar, Box, Btn, Chip, Field, Lines, Note, SectionLabel } from "./wire";

const SCHOOL = "Maple Ridge Elementary";
const PAC = "Maple Ridge PAC";

function Masthead({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-3">
        <Box label="logo" h="h-9" className="w-9 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-gray-800">{SCHOOL}</div>
          <div className="text-[11px] text-gray-500">{PAC}</div>
        </div>
      </div>
      {!compact && (
        <nav className="hidden gap-4 text-xs text-gray-500 md:flex">
          <span>Events</span>
          <span>Minutes</span>
          <span>News</span>
          <span>About</span>
          <span>Contact</span>
        </nav>
      )}
      <Btn>Member sign in</Btn>
    </div>
  );
}

/** A — one chronological feed. Everything the PAC publishes, newest first. */
export function PublicA() {
  const feed = [
    { kind: "Announcement", title: "Hot lunch orders close Friday", meta: "urgent · 2 days ago" },
    { kind: "Event", title: "Spring Carnival", meta: "May 24 · 11:00 · Field" },
    { kind: "Minutes", title: "April general meeting", meta: "PDF · Apr 9" },
    { kind: "Article", title: "Where your fundraising went this year", meta: "by J. Tam · Apr 2" },
    { kind: "Event", title: "PAC general meeting", meta: "May 8 · 19:00 · Library" },
    { kind: "Announcement", title: "Volunteers needed for track day", meta: "Mar 28" },
  ];
  return (
    <div>
      <Masthead />
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center gap-2">
          <Chip tone="dark">Urgent</Chip>
          <Bar w="w-64" />
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-6 py-6">
        <div className="mb-4 flex gap-2">
          {["All", "Events", "Minutes", "News"].map((f) => (
            <Chip key={f} tone={f === "All" ? "dark" : "outline"}>
              {f}
            </Chip>
          ))}
        </div>
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          {feed.map((item) => (
            <div key={item.title} className="flex gap-4 py-4">
              <Box label={item.kind.slice(0, 4)} h="h-12" className="w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Chip>{item.kind}</Chip>
                  <span className="text-[10px] text-gray-400">{item.meta}</span>
                </div>
                <div className="mt-1 text-sm font-medium text-gray-800">{item.title}</div>
                <Lines n={1} className="mt-2" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded border border-gray-200 bg-gray-50 p-4">
          <div className="text-xs font-medium text-gray-700">Get this by email</div>
          <div className="mt-2 flex gap-2">
            <div className="h-8 flex-1 rounded border border-gray-300 bg-white" />
            <Btn primary>Subscribe</Btn>
          </div>
        </div>
      </div>
      <Note>
        One stream, no hierarchy. A parent who visits once a month sees everything that happened since.
        Cheapest for a PAC with thin content — an empty School still looks intentional.
      </Note>
    </div>
  );
}

/** B — magazine. The Article is the hero; events live in a rail. */
export function PublicB() {
  return (
    <div>
      <Masthead />
      <div className="px-6 py-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Box label="cover image" h="h-48" />
            <div className="mt-3">
              <Chip>Featured article</Chip>
              <div className="mt-2 text-lg font-semibold text-gray-800">
                Where your fundraising went this year
              </div>
              <Lines n={2} className="mt-2" />
            </div>
            <SectionLabel>More from the PAC</SectionLabel>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i}>
                  <Box label="cover" h="h-20" />
                  <Bar w="w-full" className="mt-2" />
                  <Bar w="w-8/12" className="mt-1.5" />
                </div>
              ))}
            </div>
          </div>
          <aside className="space-y-5">
            <div className="rounded border border-gray-200 p-3">
              <SectionLabel>Next up</SectionLabel>
              <div className="text-sm font-medium text-gray-800">Spring Carnival</div>
              <div className="text-[11px] text-gray-500">May 24 · 11:00 · Field</div>
              <div className="mt-2">
                <Btn primary>RSVP</Btn>
              </div>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <SectionLabel>Announcements</SectionLabel>
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />
                    <Lines n={1} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded border border-gray-200 p-3">
              <SectionLabel>Minutes</SectionLabel>
              <div className="space-y-1.5 text-[11px] text-gray-500">
                <div>April general meeting</div>
                <div>March general meeting</div>
                <div>February general meeting</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Note>
        Bets the School has long-form Articles worth leading with. Looks great for an active PAC and
        conspicuously empty for a new one — the cover-image slot is load-bearing.
      </Note>
    </div>
  );
}

/** C — sticky identity rail, tabbed content. The CTA is always on screen. */
export function PublicC() {
  return (
    <div className="flex min-h-[520px]">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-gray-50 p-5">
        <Box label="crest" h="h-16" className="w-16" />
        <div className="mt-3 text-sm font-semibold text-gray-800">{SCHOOL}</div>
        <div className="text-[11px] text-gray-500">{PAC}</div>
        <div className="mt-5 rounded border border-gray-300 bg-white p-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-gray-400">Next meeting</div>
          <div className="mt-1 text-xs font-medium text-gray-800">May 8, 19:00</div>
          <div className="text-[11px] text-gray-500">Library</div>
          <div className="mt-2">
            <Btn primary>Add to calendar</Btn>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Field label="Email updates" />
          <Btn primary>Subscribe</Btn>
        </div>
        <div className="mt-5 space-y-1 text-[11px] text-gray-500">
          <div>About the PAC</div>
          <div>Contact</div>
          <div>Policies</div>
          <div>Member sign in</div>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex gap-5 border-b border-gray-200 px-6 py-3 text-xs">
          <span className="border-b-2 border-gray-800 pb-2 font-medium text-gray-800">Events</span>
          <span className="pb-2 text-gray-500">Minutes</span>
          <span className="pb-2 text-gray-500">News</span>
          <span className="pb-2 text-gray-500">Announcements</span>
        </div>
        <div className="space-y-3 p-6">
          {[
            { d: "MAY 24", t: "Spring Carnival", m: "11:00 · Field · 42 going" },
            { d: "MAY 08", t: "PAC general meeting", m: "19:00 · Library" },
            { d: "JUN 12", t: "Year-end picnic", m: "16:00 · Field" },
          ].map((e) => (
            <div key={e.t} className="flex items-center gap-4 rounded border border-gray-200 p-3">
              <div className="w-14 shrink-0 text-center">
                <div className="font-mono text-[10px] text-gray-400">{e.d.split(" ")[0]}</div>
                <div className="text-lg font-semibold leading-none text-gray-700">{e.d.split(" ")[1]}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-800">{e.t}</div>
                <div className="text-[11px] text-gray-500">{e.m}</div>
              </div>
              <Btn>RSVP</Btn>
            </div>
          ))}
        </div>
        <div className="px-6 pb-5">
          <Note>
            The School&rsquo;s identity and the one thing you want a parent to do never scroll away. Tabs
            hide three quarters of the content behind a click, so a parent only sees what they came for.
          </Note>
        </div>
      </div>
    </div>
  );
}

export const publicVariants = [
  { key: "A", name: "Noticeboard feed", Component: PublicA },
  { key: "B", name: "Magazine", Component: PublicB },
  { key: "C", name: "Identity rail + tabs", Component: PublicC },
];
