"use client";

import { useState, useEffect } from "react";
import { SITES } from "@/lib/sites";

type LoginEvent = {
  id: string;
  project: string;
  userEmail: string | null;
  event: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
};

export default function LoginEventsPage() {
  const [project, setProject] = useState("");
  const [events, setEvents] = useState<LoginEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = project ? `/api/login-events?project=${project}` : "/api/login-events";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [project]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-semibold mb-4">Login Events</h1>

      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-6"
      >
        <option value="">All projects</option>
        {SITES.map((s) => (
          <option key={s.id} value={s.id}>{s.id}</option>
        ))}
      </select>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : events.length === 0 ? (
        <p className="text-white/50">No events yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50 border-b border-white/10">
              <th className="py-2 pr-4">Project</th>
              <th className="py-2 pr-4">Event</th>
              <th className="py-2 pr-4">User</th>
              <th className="py-2 pr-4">IP</th>
              <th className="py-2 pr-4">When</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-white/5">
                <td className="py-2 pr-4">{e.project}</td>
                <td className="py-2 pr-4">{e.event}</td>
                <td className="py-2 pr-4">{e.userEmail ?? "—"}</td>
                <td className="py-2 pr-4">{e.ip ?? "—"}</td>
                <td className="py-2 pr-4 text-white/50">{new Date(e.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
