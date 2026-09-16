"use client";

import { useState, useEffect, useCallback } from "react";
import type { DomainCheckResult, DomainStatus } from "@/lib/domainCheck";

interface Snapshot {
  checkedAt: string;
  results: DomainCheckResult[];
}

const GROUPS: { key: DomainStatus; label: string; color: string; hint: string }[] = [
  { key: "working", label: "Working", color: "#059669", hint: "Live and serving AdSense" },
  { key: "needs_adsense", label: "Live — Needs AdSense", color: "#0284c7", hint: "Site works fine, just missing the AdSense script" },
  { key: "broken", label: "Not Working", color: "#dc2626", hint: "Actual failure — non-200, DNS, timeout, SSL" },
  { key: "unregistered", label: "Not Registered / Parked", color: "#d97706", hint: "Never pointed at the app — DNS/registrar issue" },
];

export default function StatusPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/status/domains", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSnapshot(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function refreshNow() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/status/domains", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSnapshot(await res.json());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "refresh failed");
    } finally {
      setRefreshing(false);
    }
  }

  const results = snapshot?.results ?? [];
  const grouped = GROUPS.map((g) => ({ ...g, items: results.filter((r) => r.status === g.key) }));

  return (
    <main style={{ background: "#07060f", minHeight: "100vh", color: "#e5e5e5", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "1rem", marginBottom: "0.5rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: 700 }}>Portfolio Domain Status</h1>
          <button
            onClick={refreshNow}
            disabled={refreshing}
            style={{
              background: refreshing ? "#333" : "#0284c7",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.5rem 1rem",
              cursor: refreshing ? "default" : "pointer",
              fontSize: "0.9rem",
            }}
          >
            {refreshing ? "Checking all sites…" : "Refresh now"}
          </button>
        </div>

        <p style={{ color: "#888", marginBottom: "2rem", fontSize: "0.9rem" }}>
          {snapshot ? `Last checked ${new Date(snapshot.checkedAt).toLocaleString()}` : "Loading…"}
          {" · auto-checked hourly via cron"}
        </p>

        {error && <p style={{ color: "#dc2626", marginBottom: "1rem" }}>{error}</p>}
        {loading && <p style={{ color: "#888" }}>Loading…</p>}

        {!loading && (
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2.5rem", flexWrap: "wrap" }}>
            {grouped.map((g) => (
              <div key={g.key} style={{ background: "#111", border: `1px solid ${g.color}44`, borderRadius: 12, padding: "1rem 1.5rem", flex: "1 1 200px" }}>
                <div style={{ fontSize: "2rem", fontWeight: 700, color: g.color }}>{g.items.length}</div>
                <div style={{ fontSize: "0.85rem", color: "#aaa" }}>{g.label}</div>
              </div>
            ))}
          </div>
        )}

        {!loading &&
          grouped.map((g) => (
            <section key={g.key} style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.1rem", color: g.color, marginBottom: "0.25rem" }}>
                {g.label} ({g.items.length})
              </h2>
              <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: "0.75rem" }}>{g.hint}</p>
              {g.items.length === 0 ? (
                <p style={{ color: "#555", fontSize: "0.85rem" }}>None.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {g.items.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#0d0d15",
                        border: "1px solid #222",
                        borderRadius: 8,
                        padding: "0.6rem 1rem",
                        fontSize: "0.85rem",
                      }}
                    >
                      <a href={r.url} target="_blank" rel="noreferrer" style={{ color: "#e5e5e5", textDecoration: "none", fontWeight: 500 }}>
                        {r.name}
                      </a>
                      <span style={{ color: "#888" }}>{r.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
      </div>
    </main>
  );
}
