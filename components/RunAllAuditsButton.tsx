"use client";

import { useState } from "react";
import { SITES } from "@/lib/sites";

type AuditStatus = "idle" | "running" | "done";

export default function RunAllAuditsButton() {
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [progress, setProgress] = useState({ done: 0, pass: 0, fail: 0 });

  async function runAll() {
    setStatus("running");
    setProgress({ done: 0, pass: 0, fail: 0 });

    let pass = 0;
    let fail = 0;

    for (let i = 0; i < SITES.length; i++) {
      const site = SITES[i];
      try {
        const res = await fetch(`/api/audit?url=${encodeURIComponent(site.url)}&siteId=${site.id}`, {
          method: "POST",
        });
        if (res.ok) {
          const data = await res.json();
          pass += data.pass ?? 0;
          fail += data.fail ?? 0;
        }
      } catch {
        fail++;
      }
      setProgress({ done: i + 1, pass, fail });
    }

    setStatus("done");
  }

  const total = SITES.length;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={runAll}
        disabled={status === "running"}
        className="text-xs px-4 py-2 rounded-lg font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50"
      >
        {status === "running"
          ? `Auditing… ${progress.done}/${total}`
          : status === "done"
          ? `Rerun All Audits`
          : "Run All Audits"}
      </button>
      {status !== "idle" && (
        <span className="text-xs text-zinc-400">
          {progress.done}/{total} · {progress.pass} checks passed · {progress.fail} failed
        </span>
      )}
    </div>
  );
}
