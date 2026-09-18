"use client";

import { useState, useEffect } from "react";

type AccessCode = {
  id: string;
  code: string;
  project: string | null;
  daysUnlocked: number;
  feature: string;
  createdAt: string;
  revokedAt: string | null;
};

export default function AccessCodesPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState("");
  const [project, setProject] = useState("");
  const [daysUnlocked, setDaysUnlocked] = useState("30");
  const [feature, setFeature] = useState("pro");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/access-codes");
    if (res.status === 401) {
      setAuthed(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setCodes(data.codes ?? []);
    setAuthed(true);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      load();
    } else {
      setAuthError("Wrong password");
    }
  }

  async function createCode(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          project: project.trim() || null,
          daysUnlocked: Number(daysUnlocked),
          feature: feature.trim() || "pro",
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "failed");
      }
      setCode("");
      setProject("");
      setDaysUnlocked("30");
      setFeature("pro");
      load();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "failed");
    } finally {
      setCreating(false);
    }
  }

  async function revoke(id: string) {
    await fetch("/api/access-codes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  }

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "system-ui" }}>Loading…</div>;
  }

  if (!authed) {
    return (
      <div style={{ padding: 40, fontFamily: "system-ui", maxWidth: 360 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Access Codes — Admin</h1>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d4d4d8", marginBottom: 8 }}
          />
          <button
            type="submit"
            style={{ width: "100%", padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff", border: "none", cursor: "pointer" }}
          >
            Log in
          </button>
          {authError && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{authError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "system-ui", maxWidth: 720 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Access Codes</h1>
      <p style={{ color: "#71717a", fontSize: 13, marginBottom: 24 }}>
        Trial/beta codes, validated by any project via <code>/api/access-codes/validate</code>. No signup, no paywall.
      </p>

      <form
        onSubmit={createCode}
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12, padding: 16, border: "1px solid #e4e4e7", borderRadius: 8 }}
      >
        <input
          placeholder="CODE (e.g. LAUNCH50)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          required
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d4d4d8" }}
        />
        <input
          placeholder="project id (blank = all)"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d4d4d8" }}
        />
        <input
          type="number"
          placeholder="days unlocked"
          value={daysUnlocked}
          onChange={(e) => setDaysUnlocked(e.target.value)}
          required
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d4d4d8" }}
        />
        <input
          placeholder="feature (default: pro)"
          value={feature}
          onChange={(e) => setFeature(e.target.value)}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #d4d4d8" }}
        />
        <button
          type="submit"
          disabled={creating}
          style={{ gridColumn: "1 / -1", padding: "8px 10px", borderRadius: 6, background: "#111827", color: "#fff", border: "none", cursor: "pointer" }}
        >
          {creating ? "Creating…" : "Create code"}
        </button>
        {createError && <p style={{ gridColumn: "1 / -1", color: "#dc2626", fontSize: 13 }}>{createError}</p>}
      </form>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #e4e4e7" }}>
            <th style={{ padding: "6px 4px" }}>Code</th>
            <th style={{ padding: "6px 4px" }}>Project</th>
            <th style={{ padding: "6px 4px" }}>Days</th>
            <th style={{ padding: "6px 4px" }}>Feature</th>
            <th style={{ padding: "6px 4px" }}>Status</th>
            <th style={{ padding: "6px 4px" }}></th>
          </tr>
        </thead>
        <tbody>
          {codes.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #f4f4f5" }}>
              <td style={{ padding: "6px 4px", fontFamily: "monospace" }}>{c.code}</td>
              <td style={{ padding: "6px 4px" }}>{c.project ?? "all"}</td>
              <td style={{ padding: "6px 4px" }}>{c.daysUnlocked}</td>
              <td style={{ padding: "6px 4px" }}>{c.feature}</td>
              <td style={{ padding: "6px 4px" }}>
                {c.revokedAt ? <span style={{ color: "#dc2626" }}>revoked</span> : <span style={{ color: "#16a34a" }}>active</span>}
              </td>
              <td style={{ padding: "6px 4px" }}>
                {!c.revokedAt && (
                  <button
                    onClick={() => revoke(c.id)}
                    style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #dc2626", color: "#dc2626", background: "none", cursor: "pointer", fontSize: 12 }}
                  >
                    Revoke
                  </button>
                )}
              </td>
            </tr>
          ))}
          {codes.length === 0 && (
            <tr>
              <td colSpan={6} style={{ padding: "16px 4px", color: "#a1a1aa" }}>
                No codes yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
