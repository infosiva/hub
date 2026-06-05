"use client";

import { useEffect, useState, useCallback } from "react";
import { SITES } from "@/lib/sites";

// Default themes per site — research-recommended colour families
const SITE_DEFAULTS: Record<string, SiteTheme> = {
  speakiq:      { background: "#03080f", primary: "#06b6d4", secondary: "#22d3ee", texture: "aurora",  widgets: {} },
  roamplan:     { background: "#020b0a", primary: "#10b981", secondary: "#6ee7b7", texture: "aurora",  widgets: {} },
  trackwealth:  { background: "#04060a", primary: "#f59e0b", secondary: "#fbbf24", texture: "mesh",    widgets: {} },
  kwizzo:       { background: "#0a0412", primary: "#a855f7", secondary: "#d946ef", texture: "aurora",  widgets: {} },
  resumevault:  { background: "#03050e", primary: "#3b82f6", secondary: "#60a5fa", texture: "dotgrid", widgets: {} },
  pdfideas:     { background: "#08050f", primary: "#8b5cf6", secondary: "#a78bfa", texture: "mesh",    widgets: {} },
  pixelforge:   { background: "#04000d", primary: "#ec4899", secondary: "#f472b6", texture: "aurora",  widgets: {} },
  aicoachlab:   { background: "#040c06", primary: "#22c55e", secondary: "#4ade80", texture: "mesh",    widgets: {} },
  neuralos:     { background: "#02050f", primary: "#6366f1", secondary: "#818cf8", texture: "dotgrid", widgets: {} },
  myvitals:     { background: "#030d12", primary: "#0ea5e9", secondary: "#38bdf8", texture: "flat",    widgets: {} },
  tutiq:        { background: "#04040f", primary: "#6366f1", secondary: "#818cf8", texture: "aurora",  widgets: {} },
  quizbites:    { background: "#08010d", primary: "#ec4899", secondary: "#f472b6", texture: "aurora",  widgets: {} },
  worldtrends:  { background: "#0f0905", primary: "#D97757", secondary: "#fb923c", texture: "mesh",    widgets: {} },
  firstline:    { background: "#030810", primary: "#2D7EFF", secondary: "#60a5fa", texture: "dotgrid", widgets: {} },
  agenttrace:   { background: "#01090d", primary: "#06b6d4", secondary: "#22d3ee", texture: "dotgrid", widgets: {} },
  draftcal:     { background: "#fafaf8", primary: "#f97316", secondary: "#fb923c", texture: "flat",    widgets: {} },
  invoicemint:  { background: "#040602", primary: "#f59e0b", secondary: "#fbbf24", texture: "flat",    widgets: {} },
  flightbrain:  { background: "#01060f", primary: "#3b82f6", secondary: "#60a5fa", texture: "aurora",  widgets: {} },
  zerostaff:    { background: "#03060a", primary: "#6366f1", secondary: "#818cf8", texture: "mesh",    widgets: {} },
  mandirates:   { background: "#fafdf7", primary: "#84cc16", secondary: "#a3e635", texture: "flat",    widgets: {} },
};

const TEXTURES = [
  { value: "aurora",  label: "Aurora band" },
  { value: "mesh",    label: "Grainy mesh" },
  { value: "dotgrid", label: "Dot grid" },
  { value: "flat",    label: "Clean flat" },
];

const WIDGET_KEYS = [
  { key: "chatbot",   label: "Chatbot FAB" },
  { key: "usagePill", label: "Usage counter pill" },
  { key: "streak",    label: "Streak tracker" },
  { key: "banner",    label: "Top banner" },
];

interface SiteTheme {
  background: string;
  primary: string;
  secondary: string;
  texture: string;
  widgets: Record<string, boolean>;
}

function getDefault(siteId: string): SiteTheme {
  return SITE_DEFAULTS[siteId] ?? {
    background: "#07060f",
    primary: "#7c3aed",
    secondary: "#a78bfa",
    texture: "aurora",
    widgets: {},
  };
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Record<string, SiteTheme>>({});
  const [selected, setSelected] = useState<string>(SITES[0]?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then((data) => {
        setThemes(data.themes ?? {});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = themes[selected] ?? getDefault(selected);

  function setField(field: keyof Omit<SiteTheme, "widgets">, value: string) {
    setThemes((prev) => ({
      ...prev,
      [selected]: { ...getDefault(selected), ...prev[selected], [field]: value },
    }));
    setSaved(false);
  }

  function setWidget(key: string, value: boolean) {
    setThemes((prev) => {
      const existing = prev[selected] ?? getDefault(selected);
      return {
        ...prev,
        [selected]: {
          ...existing,
          widgets: { ...existing.widgets, [key]: value },
        },
      };
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/themes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId: selected, theme: current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function resetToDefault() {
    setRemoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/themes?siteId=${selected}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Remove from local state — will fall back to defaults
      setThemes((prev) => {
        const next = { ...prev };
        delete next[selected];
        return next;
      });
      setSaved(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setRemoving(false);
    }
  }

  const site = SITES.find((s) => s.id === selected);

  return (
    <div className="min-h-screen bg-[#07060f] text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <a href="/" className="text-white/40 text-sm hover:text-white/70 transition-colors">← Dashboard</a>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Theme Editor</h1>
            <p className="text-white/50 text-sm mt-0.5">Tune any site's colours without deploying. Saved to Edge Config, applied live.</p>
          </div>
          <div className="text-xs text-white/30 bg-white/5 rounded-lg px-3 py-2">
            Password: <span className="text-white/60 font-mono">siva2026</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Site selector */}
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/[0.06] text-xs font-semibold text-white/50 uppercase tracking-widest">
              Sites
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              {SITES.map((s) => {
                const hasOverride = Boolean(themes[s.id]);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSelected(s.id); setSaved(false); setError(null); }}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors border-b border-white/[0.04] last:border-0 ${
                      selected === s.id
                        ? "bg-violet-600/20 text-white"
                        : "text-white/70 hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{s.name}</div>
                      <div className="text-xs text-white/40 truncate">{s.id}</div>
                    </div>
                    {hasOverride && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Custom theme set" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor panel */}
          <div className="space-y-4">
            {/* Site header */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">{site?.emoji}</span>
                <div>
                  <h2 className="text-lg font-semibold">{site?.name}</h2>
                  <a href={site?.url} target="_blank" rel="noopener noreferrer"
                     className="text-xs text-white/40 hover:text-white/70 transition-colors">
                    {site?.url}
                  </a>
                </div>
              </div>
              {!themes[selected] && (
                <p className="text-xs text-amber-400/80 mt-2">Using recommended defaults — save to apply.</p>
              )}
              {themes[selected] && (
                <p className="text-xs text-emerald-400/80 mt-2">Custom theme active.</p>
              )}
            </div>

            {/* Colours */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-4">Colours</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <ColorPicker
                  label="Background"
                  value={current.background}
                  onChange={(v) => setField("background", v)}
                />
                <ColorPicker
                  label="Primary accent"
                  value={current.primary}
                  onChange={(v) => setField("primary", v)}
                />
                <ColorPicker
                  label="Secondary accent"
                  value={current.secondary}
                  onChange={(v) => setField("secondary", v)}
                />
              </div>
            </div>

            {/* Live preview strip */}
            <div
              className="rounded-xl p-5 border border-white/10 transition-all duration-300"
              style={{ background: current.background }}
            >
              <h3 className="text-xs font-semibold text-white/50 mb-3 uppercase tracking-widest">Preview</h3>
              <div className="flex gap-3 flex-wrap">
                <div
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: current.primary }}
                >
                  Primary button
                </div>
                <div
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ background: current.secondary }}
                >
                  Secondary
                </div>
                <div
                  className="rounded-lg px-4 py-2 text-sm border"
                  style={{
                    borderColor: current.primary + "44",
                    color: current.primary,
                    background: current.primary + "15",
                  }}
                >
                  Glass chip
                </div>
                <div
                  className="w-8 h-8 rounded-full"
                  style={{
                    boxShadow: `0 0 20px 4px ${current.primary}66`,
                    background: current.primary,
                  }}
                />
              </div>
              <p className="text-xs mt-3" style={{ color: current.primary + "aa" }}>
                Accent text — headings, links, highlights
              </p>
            </div>

            {/* Background texture */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Background texture</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {TEXTURES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setField("texture", t.value)}
                    className={`px-3 py-2.5 rounded-lg text-sm border transition-colors ${
                      current.texture === t.value
                        ? "bg-violet-600/30 border-violet-500/50 text-white"
                        : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget visibility */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-1">Widget visibility</h3>
              <p className="text-xs text-white/40 mb-4">Hide widgets you don't want on this site. Site reads this from Edge Config.</p>
              <div className="space-y-3">
                {WIDGET_KEYS.map(({ key, label }) => {
                  const isOn = current.widgets[key] !== false; // default shown
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-white/80">{label}</span>
                      <button
                        onClick={() => setWidget(key, !isOn)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          isOn ? "bg-violet-600" : "bg-white/10"
                        }`}
                        title={isOn ? "Shown — click to hide" : "Hidden — click to show"}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            isOn ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-colors active:scale-[0.97]"
              >
                {saving ? "Saving…" : saved ? "✓ Saved to Edge Config" : "Save theme"}
              </button>
              <button
                onClick={resetToDefault}
                disabled={removing || !themes[selected]}
                className="px-4 py-2.5 border border-white/10 hover:border-red-500/40 disabled:opacity-30 text-white/60 hover:text-red-400 rounded-lg text-sm transition-colors"
                title="Remove override — site reverts to code defaults"
              >
                {removing ? "Removing…" : "Remove override"}
              </button>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            {/* How to use */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-xs text-white/40 space-y-1">
              <p className="font-semibold text-white/60 mb-2">How it works</p>
              <p>1. Pick a site, adjust colours + texture + widget visibility.</p>
              <p>2. Click <strong className="text-white/60">Save theme</strong> — writes <code className="bg-white/10 px-1 rounded">theme_{"{siteId}"}</code> key to Edge Config.</p>
              <p>3. Site reads Edge Config at request time and injects CSS vars — no deploy needed.</p>
              <p>4. Click <strong className="text-white/60">Remove override</strong> to delete the key — site reverts to its code defaults.</p>
              <p className="mt-2">Green dot in site list = custom theme active.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-white/50 block mb-2">{label}</label>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-10 h-10 rounded-lg cursor-pointer border border-white/10 bg-transparent p-0.5"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
          }}
          className="flex-1 bg-white/5 border border-white/10 text-white font-mono text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500 transition-colors"
          maxLength={7}
          spellCheck={false}
        />
      </div>
      <div
        className="mt-2 h-6 rounded-md border border-white/10 transition-all"
        style={{ background: value }}
      />
    </div>
  );
}
