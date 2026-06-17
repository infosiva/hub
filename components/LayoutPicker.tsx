"use client";

import { useState, useEffect, useCallback } from "react";

const ALL_SITES = [
  "tutiq", "kwizzo", "quizbites", "quizbytesdaily", "speakiq",
  "trackwealth", "invoicemint", "roamplan", "resumevault", "draftcal",
  "agentlogs", "protoforge", "arcadeforge", "myvitals", "voicejournal",
  "bookingcall", "nammatamil", "worldtrends", "quicktech", "neuralos",
  "aicoachlab", "zerostaff", "pdfideas", "replydesk", "clipforge",
  "complyscan", "clawdbotai", "ninjapa", "aijobs", "weekendai",
  "meetscribe", "anylocal", "complybuddy", "pixelforge",
] as const;

const SITE_LABELS: Record<string, string> = {
  tutiq: "TutiQ", kwizzo: "Kwizzo", quizbites: "QuizBites",
  quizbytesdaily: "QuizBytes Daily", speakiq: "SpeakIQ",
  trackwealth: "TrackWealth", invoicemint: "InvoiceMint",
  roamplan: "RoamPlan", resumevault: "ResumeVault", draftcal: "DraftCal",
  agentlogs: "AgentLogs", protoforge: "ProtoForge", arcadeforge: "PixelForge",
  myvitals: "MyVitals", voicejournal: "VoiceJournal", bookingcall: "BookingCall",
  nammatamil: "NammaTamil", worldtrends: "WorldTrends", quicktech: "QuickTech",
  neuralos: "NeuralOS", aicoachlab: "AICoachLab", zerostaff: "ZeroStaff",
  pdfideas: "PDFIdeas", replydesk: "ReplyDesk", clipforge: "ClipForge",
  complyscan: "ComplyScan", clawdbotai: "ClawdBot AI", ninjapa: "NinjaPA",
  aijobs: "AI Jobs", weekendai: "WeekendAI", meetscribe: "MeetScribe",
  anylocal: "AnyLocal", complybuddy: "ComplyBuddy", pixelforge: "Pixelforge",
};

interface Layout {
  id: string;
  name: string;
  bg: string;
  accent: string;
}

type SiteId = (typeof ALL_SITES)[number];

export default function LayoutPicker() {
  const [open, setOpen] = useState(false);
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [siteLayouts, setSiteLayouts] = useState<Record<string, string | null>>({});
  const [loadState, setLoadState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const listRes = await fetch("/api/layout");
      const listData = await listRes.json();
      setLayouts(listData.layouts ?? []);

      const entries = await Promise.all(
        ALL_SITES.map(async (site) => {
          const res = await fetch(`/api/layout?siteId=${site}`);
          const data = await res.json();
          return [site, data.layoutId ?? null] as const;
        })
      );
      setSiteLayouts(Object.fromEntries(entries));
      setLoadState("done");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (open && loadState === "idle") load();
  }, [open, loadState, load]);

  const setLayout = async (site: SiteId, layoutId: string | null) => {
    setSaving((s) => new Set(s).add(site));
    setSiteLayouts((prev) => ({ ...prev, [site]: layoutId }));
    await fetch("/api/layout", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site, layoutId }),
    });
    setSaving((s) => {
      const n = new Set(s);
      n.delete(site);
      return n;
    });
  };

  const visibleSites = ALL_SITES.filter(
    (s) => !filter || SITE_LABELS[s]?.toLowerCase().includes(filter.toLowerCase()) || s.includes(filter.toLowerCase())
  );

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", padding: "12px 20px", borderRadius: 12,
          background: open ? "#0f172a" : "#1e293b",
          border: "1px solid #334155", color: "#f1f5f9",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span>🎨 Layout Picker</span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
          {open ? "▲ collapse" : "▼ swap T1-T17 layout per site — zero code changes"}
        </span>
      </button>

      {open && (
        <div style={{
          background: "#0f172a", borderRadius: "0 0 12px 12px",
          border: "1px solid #1e293b", borderTop: "none", padding: 20,
        }}>
          <p style={{ color: "#64748b", fontSize: 12, marginBottom: 14, lineHeight: 1.5 }}>
            Picks a layout archetype per site. Writes to <code>theme_&lt;site&gt;.layoutId</code> in Edge Config —
            any project using <code>theme-loader.ts</code> picks it up on next request, no redeploy needed.
            Sites not yet wired to theme-loader keep their current static design until they adopt it.
          </p>

          <input
            type="text"
            placeholder="Filter sites…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: "100%", marginBottom: 16, padding: "8px 12px", borderRadius: 8,
              background: "#1e293b", border: "1px solid #334155", color: "#f1f5f9", fontSize: 13,
            }}
          />

          {loadState === "loading" && <p style={{ color: "#64748b", fontSize: 13 }}>Loading…</p>}
          {loadState === "error" && <p style={{ color: "#ef4444", fontSize: 13 }}>Failed to load — check EDGE_CONFIG_ID / VERCEL_TOKEN env vars.</p>}

          {loadState === "done" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 480, overflowY: "auto" }}>
              {visibleSites.map((site) => {
                const current = siteLayouts[site];
                const currentLayout = layouts.find((l) => l.id === current);
                const isSaving = saving.has(site);
                return (
                  <div
                    key={site}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      background: "#1e293b", borderRadius: 8, padding: "8px 12px",
                      opacity: isSaving ? 0.6 : 1,
                    }}
                  >
                    <span style={{ flex: "0 0 140px", color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>
                      {SITE_LABELS[site] ?? site}
                    </span>

                    {currentLayout && (
                      <span style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: currentLayout.bg, border: "1px solid rgba(255,255,255,0.15)" }} />
                        <span style={{ width: 12, height: 12, borderRadius: 3, background: currentLayout.accent }} />
                      </span>
                    )}

                    <select
                      value={current ?? ""}
                      disabled={isSaving}
                      onChange={(e) => setLayout(site, e.target.value || null)}
                      style={{
                        flex: 1, background: "#0f172a", color: "#f1f5f9",
                        border: "1px solid #334155", borderRadius: 6,
                        padding: "5px 8px", fontSize: 12,
                      }}
                    >
                      <option value="">— default (site's own CSS) —</option>
                      {layouts.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.id} — {l.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
