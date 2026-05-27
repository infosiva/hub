"use client";

import { useState, useCallback } from "react";

const CONTENT_SITES = ["tutiq", "kwizzo", "quizbites", "speakiq"] as const;
type ContentSite = (typeof CONTENT_SITES)[number];
type ContentField = "headline" | "subheadline" | "cta" | "tagline";

const FIELDS: { id: ContentField; label: string; placeholder: string }[] = [
  { id: "headline", label: "Headline", placeholder: "e.g. Learn smarter, not harder" },
  { id: "subheadline", label: "Subheadline", placeholder: "e.g. AI-powered tools that adapt to you" },
  { id: "cta", label: "CTA Button", placeholder: "e.g. Try for free" },
  { id: "tagline", label: "Tagline", placeholder: "e.g. No account needed · free to try" },
];

const SITE_LABELS: Record<ContentSite, string> = {
  tutiq: "TutiQ",
  kwizzo: "Kwizzo",
  quizbites: "QuizBites",
  speakiq: "SpeakIQ",
};

export default function GlobalContentPanel() {
  const [values, setValues] = useState<Partial<Record<ContentField, string>>>({});
  const [targetSites, setTargetSites] = useState<Set<ContentSite>>(new Set(CONTENT_SITES));
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [results, setResults] = useState<{ site: string; field: string; ok: boolean }[]>([]);
  const [open, setOpen] = useState(false);

  const toggleSite = (site: ContentSite) => {
    setTargetSites((prev) => {
      const next = new Set(prev);
      next.has(site) ? next.delete(site) : next.add(site);
      return next;
    });
  };

  const handleApplyAll = useCallback(async () => {
    const filled = FIELDS.filter((f) => values[f.id]?.trim());
    if (filled.length === 0 || targetSites.size === 0) return;

    setStatus("saving");
    setResults([]);

    const writes: { siteId: string; field: string; value: string }[] = [];
    for (const site of targetSites) {
      for (const { id } of filled) {
        writes.push({ siteId: site, field: id, value: values[id]!.trim() });
      }
    }

    const settled = await Promise.allSettled(
      writes.map(({ siteId, field, value }) =>
        fetch("/api/content", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ siteId, field, value }),
        }).then((r) => ({ siteId, field, ok: r.ok }))
      )
    );

    const res = settled.map((s, i) =>
      s.status === "fulfilled"
        ? { site: writes[i].siteId, field: writes[i].field, ok: s.value.ok }
        : { site: writes[i].siteId, field: writes[i].field, ok: false }
    );
    setResults(res);
    setStatus(res.every((r) => r.ok) ? "done" : "error");
    setTimeout(() => setStatus("idle"), 4000);
  }, [values, targetSites]);

  const filledCount = FIELDS.filter((f) => values[f.id]?.trim()).length;

  return (
    <div className="mb-8 rounded-xl border border-violet-500/20 bg-violet-500/[0.04]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">🌐</span>
          <div>
            <p className="text-white font-semibold text-sm">Global Content Override</p>
            <p className="text-zinc-500 text-[11px] mt-0.5">
              Push headline / CTA / tagline to all sites at once — no code deploy needed
            </p>
          </div>
        </div>
        <span className="text-zinc-500 text-xs font-mono">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 border-t border-violet-500/10 pt-4">
          {/* Site targets */}
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-wider mb-2">Apply to</p>
            <div className="flex flex-wrap gap-2">
              {CONTENT_SITES.map((site) => (
                <button
                  key={site}
                  onClick={() => toggleSite(site)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    targetSites.has(site)
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                      : "bg-white/[0.03] border-white/10 text-zinc-500"
                  }`}
                >
                  {SITE_LABELS[site]}
                </button>
              ))}
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FIELDS.map(({ id, label, placeholder }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider">{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={values[id] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [id]: e.target.value }))}
                  className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40"
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <p className="text-zinc-600 text-[11px]">
              {filledCount > 0 && targetSites.size > 0
                ? `Will write ${filledCount} field${filledCount > 1 ? "s" : ""} × ${targetSites.size} site${targetSites.size > 1 ? "s" : ""} = ${filledCount * targetSites.size} writes`
                : "Fill at least one field and select sites"}
            </p>
            <button
              onClick={handleApplyAll}
              disabled={filledCount === 0 || targetSites.size === 0 || status === "saving"}
              className={`text-sm px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-40 ${
                status === "done"
                  ? "bg-emerald-500 text-white"
                  : status === "error"
                  ? "bg-red-500 text-white"
                  : "bg-violet-600 hover:bg-violet-500 text-white"
              }`}
            >
              {status === "saving"
                ? "Pushing…"
                : status === "done"
                ? "Applied ✓"
                : status === "error"
                ? "Partial fail"
                : "Apply to all"}
            </button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {results.map((r, i) => (
                <span
                  key={i}
                  className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    r.ok ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {r.site}/{r.field} {r.ok ? "✓" : "✗"}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
