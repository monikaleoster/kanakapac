/** PROTOTYPE — three structurally different Member admin surfaces. Throwaway. */
import { Bar, Box, Btn, Lines, Note, SectionLabel } from "./wire";

const RESOURCES = ["Events", "Announcements", "Minutes", "Articles", "Team", "Subscribers", "Policies", "Settings"];

function SchoolSwitcher() {
  return (
    <div className="flex items-center gap-2 rounded border border-gray-300 bg-white px-2 py-1">
      <Box label="" h="h-5" className="w-5" />
      <span className="text-xs text-gray-700">Maple Ridge</span>
      <span className="text-gray-400">▾</span>
    </div>
  );
}

/** A — resource sidebar + table. The familiar CMS console. */
export function MemberA() {
  return (
    <div className="flex min-h-[520px]">
      <aside className="w-52 shrink-0 border-r border-gray-200 bg-gray-50 p-4">
        <SchoolSwitcher />
        <nav className="mt-4 space-y-1">
          {RESOURCES.map((r, i) => (
            <div
              key={r}
              className={`rounded px-2 py-1.5 text-xs ${i === 0 ? "bg-gray-200 font-medium text-gray-800" : "text-gray-500"}`}
            >
              {r}
            </div>
          ))}
        </nav>
        <div className="mt-6 border-t border-gray-200 pt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-gray-400">Owner</div>
          <div className="mt-1 text-[11px] text-gray-500">j.tam@example.com</div>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
          <div className="text-sm font-semibold text-gray-800">Events</div>
          <Btn primary>New event</Btn>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50 font-mono text-[10px] uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-5 py-2">Title</th>
              <th className="px-5 py-2">Date</th>
              <th className="px-5 py-2">RSVPs</th>
              <th className="px-5 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              ["Spring Carnival", "May 24", "42"],
              ["PAC general meeting", "May 8", "11"],
              ["Year-end picnic", "Jun 12", "3"],
              ["Track day", "Apr 30", "68"],
            ].map((row) => (
              <tr key={row[0]}>
                <td className="px-5 py-3 font-medium text-gray-800">{row[0]}</td>
                <td className="px-5 py-3 text-gray-500">{row[1]}</td>
                <td className="px-5 py-3 text-gray-500">{row[2]}</td>
                <td className="px-5 py-3 text-right text-gray-400">Edit · Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Note>
          Scales to every resource without redesign, and the School switcher in the corner is the only
          thing that says this is multi-school. Says nothing about what needs doing today.
        </Note>
      </div>
    </div>
  );
}

/** B — what needs attention first; content is secondary. */
export function MemberB() {
  const tasks = [
    { t: "3 Articles still in Draft", a: "Review", urgent: false },
    { t: "Hot lunch announcement expires tomorrow", a: "Extend", urgent: true },
    { t: "April Minutes not uploaded (meeting was 6 days ago)", a: "Upload", urgent: true },
    { t: "Spring Carnival has 42 RSVPs — capacity 40", a: "Open", urgent: false },
  ];
  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-3">
          <SchoolSwitcher />
          <nav className="flex gap-4 text-xs text-gray-500">
            <span className="font-medium text-gray-800">Today</span>
            {RESOURCES.slice(0, 4).map((r) => (
              <span key={r}>{r}</span>
            ))}
            <span>More ▾</span>
          </nav>
        </div>
        <Btn primary>Publish something</Btn>
      </div>
      <div className="p-5">
        <SectionLabel>Needs you</SectionLabel>
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.t}
              className="flex items-center gap-3 rounded border border-gray-200 bg-white p-3"
            >
              <span className={`h-2 w-2 shrink-0 rounded-full ${task.urgent ? "bg-gray-700" : "bg-gray-300"}`} />
              <div className="flex-1 text-xs text-gray-700">{task.t}</div>
              <Btn>{task.a}</Btn>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded border border-gray-200 p-3">
            <SectionLabel>Recently published</SectionLabel>
            <Lines n={3} />
          </div>
          <div className="rounded border border-gray-200 p-3">
            <SectionLabel>Subscribers</SectionLabel>
            <div className="text-2xl font-semibold text-gray-700">218</div>
            <Bar w="w-20" className="mt-2" />
          </div>
          <div className="rounded border border-gray-200 p-3">
            <SectionLabel>Members</SectionLabel>
            <div className="space-y-1.5 text-[11px] text-gray-500">
              <div>J. Tam — Owner</div>
              <div>P. Singh — Editor</div>
              <div>A. Lopez — Editor</div>
            </div>
            <div className="mt-2">
              <Btn>Invite</Btn>
            </div>
          </div>
        </div>
      </div>
      <Note>
        Built for the volunteer who opens this twice a month and has forgotten where they left off.
        Risk: the task list is only as good as the rules behind it, and a quiet month looks broken.
      </Note>
    </div>
  );
}

/** C — no nav at all. Pick a content type, go full-screen. */
export function MemberC() {
  const cards = [
    ["Events", "4 upcoming", "Add event"],
    ["Announcements", "2 live, 1 expiring", "Post notice"],
    ["Minutes", "Last: April 9", "Upload minutes"],
    ["Articles", "12 published, 3 drafts", "Write article"],
    ["Team", "7 listed", "Edit team"],
    ["Subscribers", "218", "Export"],
  ];
  return (
    <div>
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <div className="text-sm font-semibold text-gray-800">Maple Ridge PAC</div>
          <div className="text-[11px] text-gray-500">Signed in as J. Tam · Owner · switch School</div>
        </div>
        <Btn>Settings</Btn>
      </div>
      <div className="grid grid-cols-3 gap-4 p-5">
        {cards.map(([title, meta, action]) => (
          <div key={title} className="rounded border border-gray-200 p-4">
            <Box label={title.slice(0, 3)} h="h-10" className="w-10" />
            <div className="mt-3 text-sm font-medium text-gray-800">{title}</div>
            <div className="text-[11px] text-gray-500">{meta}</div>
            <div className="mt-3 flex gap-2">
              <Btn primary>{action}</Btn>
              <Btn>View all</Btn>
            </div>
          </div>
        ))}
      </div>
      <Note>
        Each card is one job, and the primary action is on the card rather than behind a list. Fewest
        concepts to teach a new Editor; worst of the three once a School has hundreds of items.
      </Note>
    </div>
  );
}

export const memberVariants = [
  { key: "A", name: "Sidebar console", Component: MemberA },
  { key: "B", name: "Needs-you workbench", Component: MemberB },
  { key: "C", name: "Job cards", Component: MemberC },
];
