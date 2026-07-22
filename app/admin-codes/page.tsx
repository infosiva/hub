"use client";

import { useState, useEffect } from "react";
import { SITES } from "@/lib/sites";

type GenResult = {
  code: string;
  project: string;
  tier: string;
  aiLimit: number | null;
  expiresAt: number;
};

export default function AdminCodesPage() {
  const [project, setProject] = useState(SITES[0]?.id ?? "");
  const [tier, setTier] = useState("admin");
  const [aiLimit, setAiLimit] = useState("");
  const [result, setResult] = useState<GenResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [guestEnabled, setGuestEnabled] = useState<Record<string, boolean>>({});
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [togglingProject, setTogglingProject] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin-codes/settings")
      .then((r) => r.json())
      .then((data) => {
        const map: Record<string, boolean> = {};
        for (const s of data.settings ?? []) map[s.project] = s.guestEnabled;
        setGuestEnabled(map);
      })
      .catch(() => {})
      .finally(() => setSettingsLoading(false));
  }, []);

  async function toggleGuest(id: string, next: boolean) {
    setTogglingProject(id);
    // optimistic update
    setGuestEnabled((prev) => ({ ...prev, [id]: next }));
    try {
      const res = await fetch("/api/admin-codes/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: id, guestEnabled: next }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      // revert on failure
      setGuestEnabled((prev) => ({ ...prev, [id]: !next }));
    } finally {
      setTogglingProject(null);
    }
  }

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          tier,
          aiLimit: aiLimit ? Number(aiLimit) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate code");
        return;
      }
      setResult(data);
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Guest / Admin Codes</h1>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 24 }}>
        Generates a one-time, project-scoped code. Valid 24h, single use.
      </p>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Project</label>
      <select
        value={project}
        onChange={(e) => setProject(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 16, borderRadius: 6, border: "1px solid #ddd" }}
      >
        {SITES.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Tier</label>
      <select
        value={tier}
        onChange={(e) => setTier(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 16, borderRadius: 6, border: "1px solid #ddd" }}
      >
        <option value="admin">admin</option>
        <option value="guest">guest</option>
      </select>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
        AI limit (optional — max AI calls while code active)
      </label>
      <input
        type="number"
        value={aiLimit}
        onChange={(e) => setAiLimit(e.target.value)}
        placeholder="unlimited"
        style={{ width: "100%", padding: 8, marginBottom: 20, borderRadius: 6, border: "1px solid #ddd" }}
      />

      <button
        onClick={generate}
        disabled={loading}
        style={{
          width: "100%", padding: "10px 0", borderRadius: 6, border: "none",
          background: "#111", color: "#fff", fontWeight: 600, cursor: "pointer",
        }}
      >
        {loading ? "Generating…" : "Generate code"}
      </button>

      {error && <p style={{ color: "#c0392b", marginTop: 16, fontSize: 13 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 24, padding: 16, background: "#f4f4f5", borderRadius: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1, wordBreak: "break-all" }}>
            {result.code}
          </div>
          <div style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
            project: {result.project} · tier: {result.tier} · aiLimit: {result.aiLimit ?? "unlimited"}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            expires: {new Date(result.expiresAt).toLocaleString()}
          </div>
          <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>
            Shown once — copy now. Not retrievable again (stored as hash only).
          </p>
        </div>
      )}

      <hr style={{ margin: "32px 0", border: "none", borderTop: "1px solid #eee" }} />

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Guest access — per project</h2>
      <p style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>
        Off = codes rejected server-side for that project, even if already issued.
      </p>

      {settingsLoading ? (
        <p style={{ fontSize: 13, color: "#999" }}>Loading…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SITES.map((s) => {
            const enabled = guestEnabled[s.id] ?? true;
            return (
              <div
                key={s.id}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 12px", borderRadius: 6, border: "1px solid #eee",
                  opacity: togglingProject === s.id ? 0.6 : 1,
                }}
              >
                <span style={{ fontSize: 13 }}>{s.name}</span>
                <button
                  onClick={() => toggleGuest(s.id, !enabled)}
                  disabled={togglingProject === s.id}
                  aria-label={`${enabled ? "Disable" : "Enable"} guest access for ${s.name}`}
                  aria-pressed={enabled}
                  style={{
                    width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
                    background: enabled ? "#16a34a" : "#ccc", position: "relative", padding: 0,
                    transition: "background 150ms",
                  }}
                >
                  <span
                    style={{
                      position: "absolute", top: 2, left: enabled ? 20 : 2,
                      width: 18, height: 18, borderRadius: "50%", background: "#fff",
                      transition: "left 150ms",
                    }}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
