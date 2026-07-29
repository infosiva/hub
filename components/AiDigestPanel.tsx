"use client";

import { useState, useEffect, useCallback } from "react";

type DigestLevel = "beginner" | "intermediate" | "advanced";

type DigestState = {
  freq: number;
  level: DigestLevel;
  lastTopicIndex: number;
  lastTopic: string | null;
  lastAnswer: string | null;
  lastSentDate: string | null;
  sentToday: number;
};

const LEVELS: { id: DigestLevel; label: string }[] = [
  { id: "beginner", label: "🌱 Beginner" },
  { id: "intermediate", label: "🔧 Intermediate" },
  { id: "advanced", label: "🚀 Advanced" },
];

export default function AiDigestPanel() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DigestState | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/ai-digest-settings");
      if (!res.ok) return;
      setState(await res.json());
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const patch = async (body: Partial<Pick<DigestState, "freq" | "level">>) => {
    setSaving(true);
    setState((s) => (s ? { ...s, ...body } : s));
    await fetch("/api/ai-digest-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: "100%", padding: "12px 20px", borderRadius: 12,
          background: open ? "#0f172a" : "#1e293b",
          border: "1px solid #334155", color: "#f1f5f9",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span>🎓 AI Daily Digest — @LetsLearnAIBot</span>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>
          {open ? "▲ collapse" : "▼ frequency · level"}
        </span>
      </button>

      {open && (
        <div style={{
          background: "#0f172a", borderRadius: "0 0 12px 12px",
          border: "1px solid #1e293b", borderTop: "none", padding: 20,
          display: "flex", flexDirection: "column", gap: 16,
        }}>
          {!state ? (
            <p style={{ color: "#64748b", fontSize: 12, textAlign: "center" }}>Loading…</p>
          ) : (
            <>
              <div>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>MESSAGES PER DAY</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {[1, 2, 3].map((n) => (
                    <button
                      key={n}
                      onClick={() => patch({ freq: n })}
                      disabled={saving}
                      style={{
                        padding: "6px 16px", borderRadius: 8, border: "1px solid #334155",
                        background: state.freq === n ? "#6366f1" : "#1e293b",
                        color: "#f1f5f9", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {n}/day
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>LEVEL</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  {LEVELS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => patch({ level: l.id })}
                      disabled={saving}
                      style={{
                        padding: "6px 16px", borderRadius: 8, border: "1px solid #334155",
                        background: state.level === l.id ? "#6366f1" : "#1e293b",
                        color: "#f1f5f9", fontSize: 13, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ fontSize: 12, color: "#64748b", borderTop: "1px solid #1e293b", paddingTop: 12 }}>
                Progress: topic #{state.lastTopicIndex + 1} — <span style={{ color: "#e2e8f0" }}>{state.lastTopic ?? "none sent yet"}</span>
                <br />
                Sent today: {state.sentToday}/{state.freq} {state.lastSentDate ? `(as of ${state.lastSentDate})` : ""}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
