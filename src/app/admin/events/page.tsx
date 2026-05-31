"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EventData {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  createdAt: string;
}

interface RoleForm {
  id?: string;
  name: string;
  maxSlots: string;
}

interface VolunteerRow {
  id: string;
  roleName: string;
  name: string;
  email: string;
  createdAt: string;
}

const emptyEvent = { title: "", date: "", time: "", location: "", description: "" };

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [editing, setEditing] = useState<EventData | null>(null);
  const [form, setForm] = useState(emptyEvent);
  const [roles, setRoles] = useState<RoleForm[]>([]);
  const [deletedRoleIds, setDeletedRoleIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [volunteersEventId, setVolunteersEventId] = useState<string | null>(null);
  const [volunteers, setVolunteers] = useState<VolunteerRow[]>([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  async function fetchEvents() {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }

  async function handleEdit(event: EventData) {
    setEditing(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
    });
    setDeletedRoleIds([]);
    const res = await fetch(`/api/events/${event.id}/volunteer-roles`);
    const existingRoles = res.ok ? await res.json() : [];
    setRoles(existingRoles.map((r: { id: string; name: string; maxSlots: number | null }) => ({
      id: r.id,
      name: r.name,
      maxSlots: r.maxSlots !== null ? String(r.maxSlots) : "",
    })));
    setShowForm(true);
  }

  function handleNew() {
    setEditing(null);
    setForm(emptyEvent);
    setRoles([]);
    setDeletedRoleIds([]);
    setShowForm(true);
  }

  function addRole() {
    setRoles(prev => [...prev, { name: "", maxSlots: "" }]);
  }

  function updateRole(index: number, patch: Partial<RoleForm>) {
    setRoles(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));
  }

  function removeRole(index: number) {
    const role = roles[index];
    if (role.id) setDeletedRoleIds(prev => [...prev, role.id!]);
    setRoles(prev => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    let eventId: string;
    if (editing) {
      await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, ...form }),
      });
      eventId = editing.id;
    } else {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      eventId = created.id;
    }

    // Sync roles: delete removed, save remaining
    await Promise.all(deletedRoleIds.map(id =>
      fetch(`/api/events/${eventId}/volunteer-roles?roleId=${id}`, { method: "DELETE" })
    ));

    await Promise.all(roles.map(role => {
      const body = {
        id: role.id,
        name: role.name,
        maxSlots: role.maxSlots !== "" ? parseInt(role.maxSlots) : null,
      };
      return fetch(`/api/events/${eventId}/volunteer-roles`, {
        method: role.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }));

    setShowForm(false);
    setEditing(null);
    setForm(emptyEvent);
    setRoles([]);
    setDeletedRoleIds([]);
    fetchEvents();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/events?id=${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchEvents();
  }

  async function openVolunteers(eventId: string) {
    setVolunteersEventId(eventId);
    setVolunteersLoading(true);
    setVolunteers([]);
    const res = await fetch(`/api/events/${eventId}/volunteers`);
    if (res.ok) {
      const data = await res.json();
      setVolunteers(data.map((s: { id: string; roleName: string; name: string; email: string; createdAt: string }) => ({
        id: s.id,
        roleName: s.roleName,
        name: s.name,
        email: s.email,
        createdAt: s.createdAt,
      })));
    }
    setVolunteersLoading(false);
  }

  async function removeVolunteer(volunteerId: string) {
    await fetch(`/api/volunteer-signups/${volunteerId}`, { method: "DELETE" });
    if (volunteersEventId) openVolunteers(volunteersEventId);
  }

  function downloadCsv(eventId: string) {
    window.location.href = `/api/events/${eventId}/volunteers/export`;
  }

  const volunteersEvent = events.find(e => e.id === volunteersEventId);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/dashboard" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Manage Events</h1>
        </div>
        <button
          onClick={handleNew}
          className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700 transition-colors"
        >
          + New Event
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this event? All volunteer roles and sign-ups will also be deleted.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Volunteers Modal */}
      {volunteersEventId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Volunteers</h3>
                {volunteersEvent && <p className="text-sm text-gray-500 mt-0.5">{volunteersEvent.title}</p>}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadCsv(volunteersEventId)}
                  className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  Export CSV
                </button>
                <button onClick={() => setVolunteersEventId(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
              </div>
            </div>
            <div className="overflow-auto flex-1">
              {volunteersLoading ? (
                <p className="text-gray-500 text-center py-8">Loading…</p>
              ) : volunteers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sign-ups yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
                      <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {volunteers.map((v, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 text-gray-700">{v.roleName}</td>
                        <td className="px-4 py-3 text-gray-900">{v.name}</td>
                        <td className="px-4 py-3 text-gray-600">{v.email}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeVolunteer(v.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Event Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Event" : "Create New Event"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="event-title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                id="event-title"
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input id="event-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label htmlFor="event-time" className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input id="event-time" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
              <div>
                <label htmlFor="event-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input id="event-location" type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
              </div>
            </div>
            <div>
              <label htmlFor="event-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="event-description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
            </div>

            {/* Volunteer Roles */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Volunteer Roles</h3>
                <button type="button" onClick={addRole} className="text-sm text-primary-600 hover:text-primary-800 font-medium">
                  + Add role
                </button>
              </div>
              {roles.length === 0 && (
                <p className="text-sm text-gray-400">No volunteer roles. Add one above if you need helpers.</p>
              )}
              <div className="space-y-2">
                {roles.map((role, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      type="text"
                      value={role.name}
                      onChange={e => updateRole(i, { name: e.target.value })}
                      placeholder="Role name (e.g. Setup crew)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      required
                    />
                    <input
                      type="number"
                      min="1"
                      value={role.maxSlots}
                      onChange={e => updateRole(i, { maxSlots: e.target.value })}
                      placeholder="Max slots (optional)"
                      className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button type="button" onClick={() => removeRole(i)} className="text-red-400 hover:text-red-600 text-sm font-medium px-2">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md font-medium hover:bg-primary-700">
                {editing ? "Update Event" : "Create Event"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {events.map(event => (
          <div key={event.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.date} at {event.time} — {event.location}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openVolunteers(event.id)} className="text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-1">
                Volunteers
              </button>
              <button onClick={() => handleEdit(event)} className="text-primary-600 hover:text-primary-800 text-sm font-medium px-3 py-1">
                Edit
              </button>
              <button onClick={() => setDeleteId(event.id)} className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1">
                Delete
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-gray-500 text-center py-8">No events yet. Click &quot;+ New Event&quot; to create one.</p>
        )}
      </div>
    </div>
  );
}
