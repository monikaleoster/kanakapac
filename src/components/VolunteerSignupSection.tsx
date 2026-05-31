"use client";

import { useState } from "react";
import { VolunteerRoleWithCount } from "@/lib/types";

interface Props {
  roles: VolunteerRoleWithCount[];
  eventId: string;
}

interface RoleState {
  open: boolean;
  name: string;
  email: string;
  submitting: boolean;
  success: boolean;
  error: string;
  full: boolean;
}

export default function VolunteerSignupSection({ roles: initialRoles, eventId }: Props) {
  const [roles, setRoles] = useState(initialRoles);
  const [states, setStates] = useState<Record<string, RoleState>>(() =>
    Object.fromEntries(
      initialRoles.map(r => [
        r.id,
        { open: false, name: "", email: "", submitting: false, success: false, error: "", full: r.isFull },
      ])
    )
  );

  if (roles.length === 0) return null;

  function setRoleState(roleId: string, patch: Partial<RoleState>) {
    setStates(prev => ({ ...prev, [roleId]: { ...prev[roleId], ...patch } }));
  }

  async function handleSubmit(e: React.FormEvent, roleId: string) {
    e.preventDefault();
    const s = states[roleId];
    setRoleState(roleId, { submitting: true, error: "" });

    const res = await fetch("/api/volunteer-signups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId, name: s.name, email: s.email }),
    });

    if (res.status === 409) {
      setRoleState(roleId, { submitting: false, full: true, open: false, error: "" });
      setRoles(prev => prev.map(r => r.id === roleId ? { ...r, isFull: true, signupCount: r.signupCount + 1 } : r));
      return;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setRoleState(roleId, { submitting: false, error: data.error || "Something went wrong. Please try again." });
      return;
    }

    setRoleState(roleId, { submitting: false, success: true, open: false });
    setRoles(prev =>
      prev.map(r => {
        if (r.id !== roleId) return r;
        const newCount = r.signupCount + 1;
        return { ...r, signupCount: newCount, isFull: r.maxSlots !== null && newCount >= r.maxSlots };
      })
    );
  }

  return (
    <section className="mt-8 border-t border-gray-200 pt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Volunteer for This Event</h2>
      <p className="text-gray-600 text-sm mb-6">
        Sign up to help out. We appreciate every hand — no experience needed!
      </p>
      <div className="space-y-4">
        {roles.map(role => {
          const s = states[role.id];
          if (!s) return null;
          const slotsLabel =
            role.maxSlots === null
              ? "Unlimited spots"
              : role.isFull || s.full
              ? "Full"
              : `${role.maxSlots - role.signupCount} of ${role.maxSlots} spot${role.maxSlots !== 1 ? "s" : ""} remaining`;

          return (
            <div key={role.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{slotsLabel}</p>
                </div>
                {s.success ? (
                  <span className="text-green-600 text-sm font-medium">Signed up!</span>
                ) : role.isFull || s.full ? (
                  <span className="inline-block bg-gray-200 text-gray-500 text-sm font-medium px-3 py-1.5 rounded-md">
                    Full
                  </span>
                ) : (
                  <button
                    onClick={() => setRoleState(role.id, { open: !s.open })}
                    className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {s.open ? "Cancel" : "Sign up"}
                  </button>
                )}
              </div>

              {s.success && (
                <p className="mt-2 text-sm text-green-700">
                  Thanks, {s.name}! Check your email for a confirmation.
                </p>
              )}

              {s.open && (
                <form onSubmit={e => handleSubmit(e, role.id)} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Your name
                      </label>
                      <input
                        type="text"
                        value={s.name}
                        onChange={e => setRoleState(role.id, { name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                        placeholder="Jane Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={s.email}
                        onChange={e => setRoleState(role.id, { email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                        placeholder="jane@example.com"
                      />
                    </div>
                  </div>
                  {s.error && <p className="text-red-600 text-sm">{s.error}</p>}
                  <button
                    type="submit"
                    disabled={s.submitting}
                    className="bg-primary-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {s.submitting ? "Submitting…" : "Confirm sign-up"}
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
