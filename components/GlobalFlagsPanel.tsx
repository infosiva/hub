"use client";

import { useState, useEffect, useCallback } from "react";

// All sites in portfolio
const ALL_SITES = [
  "tutiq", "kwizzo", "quizbites", "quizbytesdaily", "speakiq",
  "trackwealth", "invoicemint", "roamplan", "resumevault", "draftcal",
  "agentlogs", "protoforge", "arcadeforge", "myvitals", "voicejournal",
  "bookingcall", "nammatamil", "worldtrends", "quicktech", "neuralos",
  "aicoachlab", "zerostaff", "pdfideas", "replydesk", "clipforge",
  "complyscan", "clawdbotai", "ninjapa", "aijobs", "weekendai",
  "meetscribe", "anylocal", "complybuddy", "pixelforge",
] as const;

type SiteId = (typeof ALL_SITES)[number];

// Flags available per site
const FLAGS = [
  { id: "pricing",  label: "💰 Pricing",  desc: "Show pricing section / upgrade CTA" },
  { id: "chatbot",  label: "🤖 Chatbot",  desc: "Show floating chat widget" },
  { id: "freemium", label: "🔓 Freemium", desc: "Enforce free-use limit gate" },
  { id: "waitlist", label: "📋 Waitlist", desc: "Replace CTA with waitlist form" },
  { id: "banner",   label: "📢 Banner",   desc: "Show top announcement banner" },
] as const;

type FlagId = (typeof FLAGS)[number]["id"];

// Friendly labels
const SITE_LABELS: Partial<Record<SiteId, string>> = {
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

type FlagState = Record<SiteId, Record<FlagId, boolean>>;
type LoadState = "idle" | "loading" | "saving" | "done" | "error";

const DEFAULT_FLAGS: Record<FlagId, boolean> = {
  pricing: false,
  chatbot: true,
  freemium: true,
  waitlist: false,
  banner: false,
};

export default function GlobalFlagsPanel() {
  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState<FlagState>(() => {
    const init = {} as FlagState;
    for (const site of ALL_SITES) {
      init[site] = { ...DEFAULT_FLAGS };
    }
    return init;
  });
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [activeFlag, setActiveFlag] = useState<FlagId>("pricing");
  const [globalValue, setGlobalValue] = useState<boolean>(false);
  const [applyStatus, setApplyStatus] = useState<"idle" | "saving" | "done" | "error">("idle");

  // Load current flags from Edge Config
  const loadFlags = useCallback(async () => {
    setLoadState("loading");
    try {
      const res = await fetch("/api/flags");
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      // data.flags: Record<string, boolean> — keys like "toggle_kwizzo_pricing"
      setFlags((prev) => {
        const next = { ...prev };
        for (const [key, val] of Object.entries(data.flags ?? {})) {
          const m = key.match(/^toggle_([a-z0-9-]+)_([a-z]+)$/);
          if (!m) continue;
          const [, site, flag] = m;
          if (ALL_SITES.includes(site as SiteId) && FLAGS.some((f) => f.id === flag)) {
            next[site as SiteId] = { ...next[site as SiteId], [flag]: val as boolean };
          }
        }
        return next;
      });
      setLoadState("done");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    if (open) loadFlags();
  }, [open, loadFlags]);

  // Toggle single site+flag
  const toggle = async (site: SiteId, flag: FlagId, value: boolean) => {
    const k = `${site}__${flag}`;
    setSaving((s) => new Set(s).add(k));
    setFlags((prev) => ({
      ...prev,
      [site]: { ...prev[site], [flag]: value },
    }));
    await fetch("/api/toggle", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteId: site, key: flag, value }),
    });
    setSaving((s) => {
      const n = new Set(s);
      n.delete(k);
      return n;
    });
  };

  // Apply one flag to ALL sites
  const applyGlobal = async () => {
    setApplyStatus("saving");
    await Promise.all(
      ALL_SITES.map((site) =>
        fetch("/api/toggle", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId: site, key: activeFlag, value: globalValue }),
        })
      )
    );
    setFlags((prev) => {
      const next = { ...prev };
      for (const site of ALL_SITES) {
        next[site] = { ...next[site], [activeFlag]: globalValue };
      }
      return next;
    });
    setApplyStatus("done");
    setTimeout(() => setApplyStatus("idle"), 2000);
  };

  const flagInfo = FLAGS.find((f) => f.id === activeFlag)!;

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
        <span>🚩 Feature Flags</span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
          {open ? "▲ collapse" : "▼ toggle pricing · chatbot · freemium per site"}
        </span>
      </button>

      {open && (
        <div style={{
          background: "#0f172a", borderRadius: "0 0 12px 12px",
          border: "1px solid #1e293b", borderTop: "none", padding: 20,
        }}>
          {/* Global apply row */}
          <div style={{
            background: "#1e293b", borderRadius: 10, padding: "12px 16px",
            marginBottom: 20, display: "flex", alignItems: "center",
            gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>GLOBAL APPLY:</span>
            <select
              value={activeFlag}
              onChange={(e) => setActiveFlag(e.target.value as FlagId)}
              style={{
                background: "#0f172a", color: "#f1f5f9", border: "1px solid #334155",
                borderRadius: 6, padding: "4px 8px", fontSize: 13,
              }}
            >
              {FLAGS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <span style={{ color: "#64748b", fontSize: 12 }}>→</span>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Toggle
                value={globalValue}
                onChange={setGlobalValue}
                color={globalValue ? "#22c55e" : "#ef4444"}
              />
              <span style={{ color: globalValue ? "#22c55e" : "#ef4444", fontSize: 12, fontWeight: 700 }}>
                {globalValue ? "ON" : "OFF"} all sites
              </span>
            </label>
            <button
              onClick={applyGlobal}
              disabled={applyStatus === "saving"}
              style={{
                padding: "5px 14px", borderRadius: 6, border: "none",
                background: applyStatus === "done" ? "#22c55e" : "#6366f1",
                color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}
            >
              {applyStatus === "saving" ? "Saving…" : applyStatus === "done" ? "✓ Done" : "Apply to All"}
            </button>
            <span style={{ fontSize: 11, color: "#475569" }}>{flagInfo.desc}</span>
          </div>

          {/* Per-site table */}
          {loadState === "loading" && (
            <p style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>Loading flags…</p>
          )}
          {loadState !== "loading" && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", color: "#64748b", padding: "4px 8px", fontWeight: 600 }}>Site</th>
                    {FLAGS.map((f) => (
                      <th key={f.id} style={{ textAlign: "center", color: "#64748b", padding: "4px 8px", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_SITES.map((site, i) => (
                    <tr
                      key={site}
                      style={{ background: i % 2 === 0 ? "transparent" : "#ffffff05" }}
                    >
                      <td style={{ padding: "5px 8px", color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {SITE_LABELS[site] ?? site}
                      </td>
                      {FLAGS.map((f) => {
                        const k = `${site}__${f.id}`;
                        const val = flags[site]?.[f.id] ?? false;
                        const isSaving = saving.has(k);
                        return (
                          <td key={f.id} style={{ padding: "5px 8px", textAlign: "center" }}>
                            {isSaving ? (
                              <span style={{ fontSize: 10, color: "#64748b" }}>…</span>
                            ) : (
                              <Toggle
                                value={val}
                                onChange={(v) => toggle(site, f.id, v)}
                                color={val ? "#22c55e" : "#334155"}
                                small
                              />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({
  value, onChange, color, small,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color: string;
  small?: boolean;
}) {
  const w = small ? 28 : 36;
  const h = small ? 16 : 20;
  const d = small ? 12 : 16;
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: w, height: h, borderRadius: h, border: "none",
        background: value ? color : "#1e293b",
        position: "relative", cursor: "pointer",
        transition: "background 0.15s",
        outline: "none",
        flexShrink: 0,
      }}
      aria-checked={value}
      role="switch"
    >
      <span style={{
        position: "absolute",
        top: (h - d) / 2, left: value ? w - d - (h - d) / 2 : (h - d) / 2,
        width: d, height: d, borderRadius: "50%",
        background: "#fff",
        transition: "left 0.15s",
        display: "block",
      }} />
    </button>
  );
}
