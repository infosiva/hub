import { SITES, CATEGORIES, type SiteStatus } from "@/lib/sites";
import SiteCard from "@/components/SiteCard";
import ProvidersPanel from "@/components/ProvidersPanel";
import GlobalContentPanel from "@/components/GlobalContentPanel";
import GlobalFlagsPanel from "@/components/GlobalFlagsPanel";
import DownSiteAlert from "@/components/DownSiteAlert";

interface HealthIssue {
  type: string;
  severity: "error" | "warning";
  message: string;
}

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

async function fetchHealth(): Promise<Record<string, HealthIssue[]>> {
  try {
    const base = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";
    const res = await fetch(`${base}/api/health`, { cache: "no-store" });
    if (!res.ok) return {};
    const data = await res.json();
    const map: Record<string, HealthIssue[]> = {};
    for (const s of data.sites ?? []) {
      map[s.id] = s.issues ?? [];
    }
    return map;
  } catch {
    return {};
  }
}

// ---- health score ----
function HealthScore({
  statusMap,
}: {
  statusMap: Record<string, { status: SiteStatus; latency: number; statusCode: number }>;
}) {
  const total = SITES.length;
  const up = SITES.filter((s) => statusMap[s.id]?.status === "up").length;
  const score = total > 0 ? Math.round((up / total) * 100) : 0;
  const color = score >= 95 ? "text-emerald-400" : score >= 80 ? "text-amber-400" : "text-red-400";
  const ring = score >= 95 ? "border-emerald-400/30" : score >= 80 ? "border-amber-400/30" : "border-red-400/30";

  return (
    <div className={`flex items-center gap-4 mb-6 rounded-xl border ${ring} bg-white/[0.02] px-5 py-4`}>
      <div>
        <p className={`font-black text-5xl leading-none ${color}`}>{score}%</p>
        <p className="text-zinc-400 text-sm mt-1">{up}/{total} sites healthy</p>
      </div>
      <div className="w-px h-10 bg-white/10 shrink-0" />
      <p className="text-zinc-500 text-xs leading-relaxed">
        Portfolio health score — calculated from live status checks across all {total} projects
      </p>
    </div>
  );
}

// ---- summary bar ----
function SummaryBar({
  statusMap,
  analyticsMap,
  healthMap,
}: {
  statusMap: Record<string, { status: SiteStatus; latency: number; statusCode: number }>;
  analyticsMap: Record<string, { visitors: number; pageviews: number }>;
  healthMap: Record<string, HealthIssue[]>;
}) {
  const total = SITES.length;
  const up = SITES.filter((s) => statusMap[s.id]?.status === "up").length;
  const down = SITES.filter((s) => statusMap[s.id]?.status === "down").length;
  const totalVisitors = Object.values(analyticsMap).reduce((sum, a) => sum + a.visitors, 0);
  const highTipCount = SITES.reduce((sum, s) => sum + s.tips.filter((t) => t.priority === "high").length, 0);
  const sitesWithErrors = Object.values(healthMap).filter((issues) => issues.some((i) => i.severity === "error")).length;

  const latencies = SITES.map((s) => statusMap[s.id]?.latency ?? 0).filter((l) => l > 0);
  const avgLatency = latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 mb-8">
      {[
        { label: "Sites", value: `${total}`, accent: "text-white" },
        { label: "Online", value: `${up}`, accent: "text-emerald-400" },
        { label: "Down", value: `${down}`, accent: down > 0 ? "text-red-400" : "text-zinc-500" },
        {
          label: "Avg Latency",
          value: avgLatency > 0 ? `${avgLatency}ms` : "—",
          accent: avgLatency === 0 ? "text-zinc-500" : avgLatency < 200 ? "text-emerald-400" : avgLatency < 500 ? "text-amber-400" : "text-red-400",
        },
        { label: "Visitors 7d", value: totalVisitors > 0 ? totalVisitors.toLocaleString() : "—", accent: "text-violet-300" },
        { label: "High-pri fixes", value: `${highTipCount}`, accent: highTipCount > 0 ? "text-amber-400" : "text-zinc-500" },
        { label: "Health errors", value: `${sitesWithErrors}`, accent: sitesWithErrors > 0 ? "text-red-400" : "text-zinc-500" },
      ].map((stat) => (
        <div key={stat.label} className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <p className="text-zinc-500 text-xs uppercase tracking-wider">{stat.label}</p>
          <p className={`font-bold text-2xl mt-1 ${stat.accent}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

// ---- page ----
export default async function DashboardPage() {
  const [statusMap, analyticsMap, healthMap] = await Promise.all([
    fetchStatus(),
    fetchAnalytics(),
    fetchHealth(),
  ]);

  const downNames = SITES.filter((s) => statusMap[s.id]?.status === "down").map((s) => s.name);

  return (
    <main className="min-h-screen bg-[#07060f] px-4 py-8 max-w-7xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl tracking-tight">🛸 Control Portal</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {SITES.length} products · feature toggles · AI providers · live health audit
          </p>
        </div>
        <a
          href="/"
          className="text-zinc-400 hover:text-white text-sm border border-white/10 rounded-lg px-3 py-1.5 transition-colors"
        >
          ↺ Refresh
        </a>
      </div>

      <HealthScore statusMap={statusMap} />
      <DownSiteAlert downNames={downNames} />
      <SummaryBar statusMap={statusMap} analyticsMap={analyticsMap} healthMap={healthMap} />

      {/* Global Content Override */}
      <GlobalFlagsPanel />
      <GlobalContentPanel />

      {/* AI Providers Panel */}
      <ProvidersPanel />

      {CATEGORIES.map((cat) => {
        const catSites = SITES.filter((s) => s.category === cat);
        if (catSites.length === 0) return null;
        return (
          <section key={cat} className="mb-10">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2">
              <span>{cat}</span>
              <span className="text-zinc-600">({catSites.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
              {catSites.map((site) => (
                <SiteCard
                  key={site.id}
                  site={site}
                  statusInfo={statusMap[site.id] ?? { status: "unknown", latency: 0, statusCode: 0 }}
                  analytics={analyticsMap[site.id] ?? { visitors: 0, pageviews: 0 }}
                  healthIssues={healthMap[site.id] ?? []}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Add project */}
      <div className="flex justify-center pb-4">
        <a
          href="mailto:info.siva@gmail.com?subject=Add project to hub&body=Project name:%0AVercel project ID:%0ASite URL:%0ACategory:"
          className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors"
        >
          ＋ Add project to hub
        </a>
      </div>
    </main>
  );
}
