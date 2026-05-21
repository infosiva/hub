import { Suspense } from "react";
import { SITES, CATEGORIES, type Site, type SiteStatus } from "@/lib/sites";

// --- server-side status fetch (fresh every request) ---
async function fetchStatus(): Promise<Record<string, { status: SiteStatus; latency: number; statusCode: number }>> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/status`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, { status: SiteStatus; latency: number; statusCode: number }> = {};
    for (const s of data.sites ?? []) {
      map[s.id] = { status: s.status, latency: s.latency, statusCode: s.statusCode };
    }
    return map;
  } catch {
    return {};
  }
}

async function fetchAnalytics(): Promise<Record<string, { visitors: number; pageviews: number }>> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/analytics`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, { visitors: number; pageviews: number }> = {};
    for (const s of data.sites ?? []) {
      map[s.id] = { visitors: s.visitors, pageviews: s.pageviews };
    }
    return map;
  } catch {
    return {};
  }
}

// ---- components ----

function StatusDot({ status }: { status: SiteStatus }) {
  const color =
    status === "up" ? "bg-emerald-400" : status === "down" ? "bg-red-500" : "bg-zinc-500";
  const pulse = status === "up" ? "animate-pulse" : "";
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

function SiteCard({
  site,
  statusInfo,
  analytics,
}: {
  site: Site;
  statusInfo: { status: SiteStatus; latency: number; statusCode: number };
  analytics: { visitors: number; pageviews: number };
}) {
  const { status, latency } = statusInfo;
  const highTips = site.tips.filter((t) => t.priority === "high");
  const medTips = site.tips.filter((t) => t.priority === "medium");

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.03] p-4 hover:bg-white/[0.05] transition-colors">
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl shrink-0">{site.emoji}</span>
          <div className="min-w-0">
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-semibold text-sm hover:text-violet-300 transition-colors truncate block"
            >
              {site.name}
            </a>
            <span className="text-zinc-500 text-xs truncate block">{site.url.replace("https://", "")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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

      {/* stats */}
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

      {/* improvement tips */}
      {site.tips.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Improve</p>
          {[...highTips, ...medTips].map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <PriorityBadge priority={tip.priority} />
              <span className="text-zinc-300 text-xs leading-relaxed">{tip.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- summary bar ----
function SummaryBar({
  statusMap,
  analyticsMap,
}: {
  statusMap: Record<string, { status: SiteStatus; latency: number; statusCode: number }>;
  analyticsMap: Record<string, { visitors: number; pageviews: number }>;
}) {
  const total = SITES.length;
  const up = SITES.filter((s) => statusMap[s.id]?.status === "up").length;
  const down = SITES.filter((s) => statusMap[s.id]?.status === "down").length;
  const totalVisitors = Object.values(analyticsMap).reduce((sum, a) => sum + a.visitors, 0);
  const totalPageviews = Object.values(analyticsMap).reduce((sum, a) => sum + a.pageviews, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {[
        { label: "Sites", value: `${total}` },
        { label: "Up", value: `${up}`, accent: "text-emerald-400" },
        { label: "Down", value: down > 0 ? `${down}` : "0", accent: down > 0 ? "text-red-400" : "text-zinc-400" },
        { label: "Total Visitors 7d", value: totalVisitors > 0 ? totalVisitors.toLocaleString() : "—" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">{stat.label}</p>
          <p className={`font-bold text-2xl mt-1 ${stat.accent ?? "text-white"}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// ---- page ----
export default async function DashboardPage() {
  const [statusMap, analyticsMap] = await Promise.all([fetchStatus(), fetchAnalytics()]);

  return (
    <main className="min-h-screen bg-[#07060f] px-4 py-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">Ops Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{SITES.length} products · refreshes on each load</p>
        </div>
        <a
          href="/"
          className="text-zinc-400 hover:text-white text-sm border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
        >
          Refresh
        </a>
      </div>

      <SummaryBar statusMap={statusMap} analyticsMap={analyticsMap} />

      {CATEGORIES.map((cat) => {
        const catSites = SITES.filter((s) => s.category === cat);
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">{cat}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {catSites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  statusInfo={statusMap[site.id] ?? { status: "unknown", latency: 0, statusCode: 0 }}
                  analytics={analyticsMap[site.id] ?? { visitors: 0, pageviews: 0 }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}
