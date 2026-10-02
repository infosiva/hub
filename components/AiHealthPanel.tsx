"use client";

import { useState, useEffect, useCallback } from "react";

type ModelHealth = { provider: string; model: string; ok: boolean; ms: number; error?: string };
type Report = { checkedAt: string; results: ModelHealth[]; providersDown: string[] };

export default function AiHealthPanel() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-health", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setReport(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { run(); }, [run]);

  const okCount = report?.results.filter((r) => r.ok).length ?? 0;

  return (
    <div className="mb-8 rounded-2xl border border-white/[0.08] bg-zinc-950 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-white font-semibold text-sm">AI Chain Health (live)</p>
          <p className="text-zinc-400 text-xs mt-0.5">
            {report
              ? `${okCount}/${report.results.length} models answering · checked ${new Date(report.checkedAt).toLocaleString()}`
              : "Checking every model in the free fallback chain…"}
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/15 disabled:opacity-50"
        >
          {loading ? "Testing…" : "Test now"}
        </button>
      </div>

      {error && <p className="px-5 pb-4 text-xs text-red-400">Check failed: {error}</p>}

      {report && (
        <div className="overflow-x-auto border-t border-white/[0.06]">
          <table className="w-full text-xs">
            <tbody>
              {report.results.map((r) => (
                <tr key={`${r.provider}/${r.model}`} className="border-b border-white/[0.04]">
                  <td className="px-5 py-2 w-6">
                    <span aria-label={r.ok ? "working" : "failing"} className={r.ok ? "text-emerald-400" : "text-red-400"}>●</span>
                  </td>
                  <td className="py-2 pr-3 text-zinc-400">{r.provider}</td>
                  <td className="py-2 text-zinc-200 font-mono">{r.model}</td>
                  <td className="py-2 pr-5 text-right text-zinc-400">{r.ok ? `${r.ms} ms` : r.error}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
