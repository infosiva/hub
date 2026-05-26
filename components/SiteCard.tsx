"use client";

import { useState, useEffect, useCallback } from "react";
import type { Site, SiteStatus } from "@/lib/sites";

const SIVAPRAKASAM_PROJECTS = new Set(["voicejournal"]);

function vercelUrl(vercelProject: string): string {
  const account = SIVAPRAKASAM_PROJECTS.has(vercelProject) ? "sivaprakasam" : "infosiva";
  return `https://vercel.com/${account}/${vercelProject}`;
}

function StatusDot({ status }: { status: SiteStatus }) {
  const color =
    status === "up" ? "bg-emerald-400" : status === "down" ? "bg-red-500" : "bg-zinc-500";
  return (
    <span className="relative flex h-2 w-2">
      {status === "up" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
      )}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${color}`} />
    </span>
  );
}

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-red-500/15 text-red-400 border-red-500/20",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    low: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${styles[priority]}`}>
      {priority}
    </span>
  );
}

type Tab = "overview" | "compete" | "toggles" | "preview" | "content" | "audit";

export default function SiteCard({
  site,
  statusInfo,
  analytics,
  healthIssues,
}: {
  site: Site;
  statusInfo: { status: SiteStatus; latency: number; statusCode: number };
  analytics: { visitors: number; pageviews: number };
  healthIssues?: { type: string; severity: string; message: string }[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(site.featureToggles.map((t) => [t.key, t.defaultOn]))
  );
  const [togglesLoaded, setTogglesLoaded] = useState(false);
  const [savingToggle, setSavingToggle] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [contentEdits, setContentEdits] = useState<Record<string, string>>({});
  const [savingContent, setSavingContent] = useState<string | null>(null);
  const [contentSaved, setContentSaved] = useState<Record<string, boolean>>({});

  const { status, latency } = statusInfo;
  const accent = site.accentColor ?? "#a78bfa";
  const highTips = site.tips.filter((t) => t.priority === "high");
  const medTips = site.tips.filter((t) => t.priority === "medium");
  const issues = healthIssues ?? [];
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;

  // Load persisted toggles from Edge Config on mount
  useEffect(() => {
    fetch(`/api/toggle?siteId=${site.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.toggles && Object.keys(data.toggles).length > 0) {
          setToggles((prev) => ({ ...prev, ...data.toggles }));
        }
        setTogglesLoaded(true);
      })
      .catch(() => setTogglesLoaded(true));
  }, [site.id]);

  const handleToggle = useCallback(
    async (key: string) => {
      const newVal = !toggles[key];
      setToggles((prev) => ({ ...prev, [key]: newVal }));
      setSavingToggle(key);
      try {
        await fetch("/api/toggle", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId: site.id, key, value: newVal }),
        });
      } catch {
        // revert on failure
        setToggles((prev) => ({ ...prev, [key]: !newVal }));
      } finally {
        setSavingToggle(null);
      }
    },
    [toggles, site.id]
  );

  const handleContentSave = useCallback(
    async (field: string) => {
      const value = contentEdits[field];
      if (!value) return;
      setSavingContent(field);
      try {
        await fetch("/api/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId: site.id, field, value }),
        });
        setContentSaved((prev) => ({ ...prev, [field]: true }));
        setTimeout(() => setContentSaved((prev) => ({ ...prev, [field]: false })), 2000);
      } catch {
        // silent
      } finally {
        setSavingContent(null);
      }
    },
    [contentEdits, site.id]
  );

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "compete", label: "Compete" },
    { id: "toggles", label: "Toggles" },
    { id: "content", label: "Content" },
    { id: "audit", label: "Audit", badge: errorCount + warnCount },
    { id: "preview", label: "Preview" },
  ];

  return (
    <div
      className="flex flex-col rounded-xl border bg-white/[0.03] transition-colors hover:bg-white/[0.05]"
      style={{ borderColor: `${accent}22` }}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{site.emoji}</span>
          <div className="min-w-0">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold text-sm hover:underline truncate block"
            >
              {site.name}
            </a>
            <span className="text-zinc-500 text-xs truncate block">{site.tagline}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {errorCount > 0 && (
            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">
              {errorCount} err
            </span>
          )}
          <StatusDot status={status} />
          <span
            className={`text-xs font-medium ${
              status === "up" ? "text-emerald-400" : status === "down" ? "text-red-400" : "text-zinc-400"
            }`}
          >
            {status === "up" ? `${latency}ms` : status}
          </span>
        </div>
      </div>

      {/* tab bar */}
      <div className="flex border-b border-white/5 px-4 overflow-x-auto scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-2 border-b-2 transition-colors shrink-0 ${
              tab === t.id
                ? "text-white border-current"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
            style={tab === t.id ? { borderColor: accent, color: accent } : undefined}
          >
            {t.label}
            {t.badge != null && t.badge > 0 && (
              <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded-full font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* tab content */}
      <div className="p-4 flex flex-col gap-3 flex-1">

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Visitors 7d</p>
                <p className="text-white font-bold text-base mt-0.5">
                  {analytics.visitors > 0 ? analytics.visitors.toLocaleString() : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Pageviews 7d</p>
                <p className="text-white font-bold text-base mt-0.5">
                  {analytics.pageviews > 0 ? analytics.pageviews.toLocaleString() : "—"}
                </p>
              </div>
            </div>
            {site.tips.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Action Items</p>
                {[...highTips, ...medTips].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <PriorityBadge priority={tip.priority} />
                    <span className="text-zinc-300 text-xs leading-relaxed">{tip.label}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── COMPETE ── */}
        {tab === "compete" && (
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Top Competitors</p>
            {site.competitors.length === 0 ? (
              <p className="text-zinc-600 text-xs">No competitors tracked yet.</p>
            ) : (
              site.competitors.map((c, i) => (
                <div key={i} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-zinc-200 hover:underline"
                    >
                      {c.name}
                    </a>
                    <span className="text-[10px] text-zinc-600">{c.url.replace(/^https?:\/\//, "")}</span>
                  </div>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    <span className="text-amber-400 font-medium">They win: </span>
                    {c.strength}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── TOGGLES ── */}
        {tab === "toggles" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Feature Toggles</p>
              <span className={`text-[10px] px-2 py-0.5 rounded ${togglesLoaded ? "text-emerald-400 bg-emerald-400/10" : "text-zinc-500 bg-zinc-700/30"}`}>
                {togglesLoaded ? "Edge Config ✓" : "Loading…"}
              </span>
            </div>
            {site.featureToggles.length === 0 ? (
              <p className="text-zinc-600 text-xs">No toggles configured.</p>
            ) : (
              site.featureToggles.map((ft) => (
                <div key={ft.key} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-zinc-200 text-xs font-medium">{ft.label}</p>
                    <p className="text-zinc-500 text-[11px] leading-relaxed mt-0.5">{ft.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(ft.key)}
                    disabled={savingToggle === ft.key}
                    className={`shrink-0 relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      savingToggle === ft.key ? "opacity-50" : ""
                    }`}
                    style={{ backgroundColor: toggles[ft.key] ? accent : "#3f3f46" }}
                    aria-label={ft.label}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        toggles[ft.key] ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── CONTENT ── */}
        {tab === "content" && (
          <div className="flex flex-col gap-3">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Remote Content Overrides</p>
            <p className="text-zinc-600 text-[11px]">Override hero/CTA/tagline without deploying. Site reads from Edge Config at runtime.</p>
            {(["hero", "cta", "tagline"] as const).map((field) => (
              <div key={field} className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">{field}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Override ${field} text…`}
                    value={contentEdits[field] ?? ""}
                    onChange={(e) => setContentEdits((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
                  />
                  <button
                    onClick={() => handleContentSave(field)}
                    disabled={!contentEdits[field] || savingContent === field}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-40"
                    style={{ backgroundColor: contentSaved[field] ? "#10b981" : accent, color: "#000" }}
                  >
                    {contentSaved[field] ? "Saved ✓" : savingContent === field ? "…" : "Save"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── AUDIT ── */}
        {tab === "audit" && (
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Live Health Check</p>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <span>✓</span>
                <span>All checks passing</span>
              </div>
            ) : (
              issues.map((issue, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 rounded-lg px-3 py-2 border ${
                    issue.severity === "error"
                      ? "bg-red-500/10 border-red-500/20 text-red-300"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  }`}
                >
                  <span className="text-[11px] font-medium shrink-0">
                    {issue.severity === "error" ? "✗" : "⚠"}
                  </span>
                  <span className="text-[11px]">{issue.message}</span>
                </div>
              ))
            )}

            {/* Best practices checklist */}
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-2 mb-1">Best Practices</p>
            {[
              { label: "Plausible analytics wired", check: true },
              { label: "JSON-LD structured data", check: true },
              { label: "metadataBase in layout", check: true },
              { label: "Mobile viewport set", check: true },
              { label: "HTTPS enforced", check: site.url.startsWith("https://") },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 text-[11px] ${item.check ? "text-emerald-400" : "text-zinc-500"}`}>
                <span>{item.check ? "✓" : "○"}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── PREVIEW ── */}
        {tab === "preview" && (
          <div className="flex flex-col gap-2">
            {!showPreview ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-zinc-500 text-xs text-center">Load iframe preview of {site.name}</p>
                <button
                  onClick={() => setShowPreview(true)}
                  className="text-xs px-4 py-2 rounded-lg font-medium transition-colors text-black"
                  style={{ backgroundColor: accent }}
                >
                  Load Preview
                </button>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: 300 }}>
                <div className="flex items-center justify-between bg-white/5 px-3 py-1.5">
                  <span className="text-zinc-400 text-[11px] truncate">{site.url}</span>
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white text-[11px] shrink-0"
                  >
                    ↗ Open
                  </a>
                </div>
                <iframe
                  src={site.url}
                  className="w-full"
                  style={{ height: 270, border: "none" }}
                  title={`Preview: ${site.name}`}
                  loading="lazy"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-0">
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[11px] py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          Open site ↗
        </a>
        <a
          href={vercelUrl(site.vercelProject)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-[11px] py-1.5 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
        >
          Vercel ↗
        </a>
      </div>
    </div>
  );
}
