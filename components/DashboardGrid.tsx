"use client";

import { useEffect, useMemo, useState } from "react";
import SiteCard from "./SiteCard";
import type { Site, SiteStatus } from "@/lib/sites";

interface StatusInfo {
  status: SiteStatus;
  latency: number;
  statusCode: number;
  errorType?: string | null;
}
interface Analytics {
  visitors: number;
  pageviews: number;
}
interface HealthIssue {
  type: string;
  severity: string;
  message: string;
}

interface DashboardGridProps {
  categories: string[];
  sites: Site[];
  statusMap: Record<string, StatusInfo>;
  analyticsMap: Record<string, Analytics>;
  healthMap: Record<string, HealthIssue[]>;
}

const PINS_KEY = "hub_pinned_sites";
const COLLAPSED_KEY = "hub_collapsed_categories";

function loadSet(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveSet(key: string, set: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch {
    // ignore — per-viewer convenience only
  }
}

export default function DashboardGrid({ categories, sites, statusMap, analyticsMap, healthMap }: DashboardGridProps) {
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPinned(loadSet(PINS_KEY));
    setCollapsed(loadSet(COLLAPSED_KEY));
    setHydrated(true);
  }, []);

  function togglePin(id: string) {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveSet(PINS_KEY, next);
      return next;
    });
  }

  function toggleCollapsed(cat: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      saveSet(COLLAPSED_KEY, next);
      return next;
    });
  }

  const q = search.trim().toLowerCase();
  const filteredSites = useMemo(() => {
    if (!q) return sites;
    return sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.tagline?.toLowerCase().includes(q)
    );
  }, [sites, q]);

  const pinnedSites = hydrated ? filteredSites.filter((s) => pinned.has(s.id)) : [];

  return (
    <div>
      <div className="mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects by name, category, tagline…"
          className="w-full max-w-md px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/25"
        />
      </div>

      {hydrated && pinnedSites.length > 0 && (
        <section className="mb-10">
          <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
            <span>★ Pinned</span>
            <span className="text-zinc-600">({pinnedSites.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {pinnedSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                statusInfo={statusMap[site.id] ?? { status: "unknown", latency: 0, statusCode: 0 }}
                analytics={analyticsMap[site.id] ?? { visitors: 0, pageviews: 0 }}
                healthIssues={healthMap[site.id] ?? []}
                pinned
                onTogglePin={() => togglePin(site.id)}
              />
            ))}
          </div>
        </section>
      )}

      {categories.map((cat) => {
        const catSites = filteredSites.filter((s) => s.category === cat);
        if (catSites.length === 0) return null;
        const isCollapsed = collapsed.has(cat);
        return (
          <section key={cat} className="mb-10">
            <button
              onClick={() => toggleCollapsed(cat)}
              className="w-full text-left text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2 hover:text-zinc-200 transition-colors"
            >
              <span className={`inline-block transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>▾</span>
              <span>{cat}</span>
              <span className="text-zinc-600">({catSites.length})</span>
            </button>
            {!isCollapsed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {catSites.map((site) => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    statusInfo={statusMap[site.id] ?? { status: "unknown", latency: 0, statusCode: 0 }}
                    analytics={analyticsMap[site.id] ?? { visitors: 0, pageviews: 0 }}
                    healthIssues={healthMap[site.id] ?? []}
                    pinned={hydrated && pinned.has(site.id)}
                    onTogglePin={() => togglePin(site.id)}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {filteredSites.length === 0 && (
        <p className="text-zinc-600 text-sm py-8 text-center">No projects match &ldquo;{search}&rdquo;.</p>
      )}
    </div>
  );
}
