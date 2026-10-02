"use client";

import { useState, useCallback } from "react";

type Skill = { name: string; description: string; hasSkillMd: boolean };
type Plugin = { id: string; enabled: boolean };
type Tool = { name: string; installed: boolean; version: string | null };
type FreeModel = { name: string; provider: string; hrs: string; tier: string; via: string };
type MCP = { global: string[]; agents: string[] };

type StackData = {
  skills: { total: number; list: Skill[] };
  plugins: { total: number; list: Plugin[] };
  mcp: MCP;
  tools: Tool[];
  freeModels: FreeModel[];
};

type InstallResult = {
  preset: string;
  skills: string[];
  tools: string[];
  script: string;
  note: string;
};

const PRESETS = ["nextjs", "api", "ai", "fullstack"] as const;

export function DevStackPanel() {
  const [data, setData] = useState<StackData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"skills" | "plugins" | "models" | "tools" | "mcp">("models");
  const [skillFilter, setSkillFilter] = useState("");
  const [installResult, setInstallResult] = useState<InstallResult | null>(null);
  const [installing, setInstalling] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dev-stack");
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, []);

  const install = async (preset: string) => {
    setInstalling(true);
    setInstallResult(null);
    try {
      const res = await fetch("/api/dev-stack/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preset }),
      });
      const json = await res.json();
      setInstallResult(json);
    } finally {
      setInstalling(false);
    }
  };

  const copyScript = () => {
    if (installResult?.script) {
      navigator.clipboard.writeText(installResult.script);
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const filteredSkills = data?.skills.list.filter(s =>
    s.name.toLowerCase().includes(skillFilter.toLowerCase()) ||
    s.description.toLowerCase().includes(skillFilter.toLowerCase())
  ) ?? [];

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Dev Stack</h2>
          <p className="text-white/40 text-xs mt-0.5">Skills · Plugins · MCP · Free Models · Tools</p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>↻</span>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {/* Stats row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {[
            { label: "Skills", value: data.skills.total, key: "skills" as const },
            { label: "Plugins", value: data.plugins.total, key: "plugins" as const },
            { label: "MCP Servers", value: data.mcp.global.length + data.mcp.agents.length, key: "mcp" as const },
            { label: "Free Models", value: data.freeModels.length, key: "models" as const },
            { label: "Tools", value: data.tools.filter(t => t.installed).length + "/" + data.tools.length, key: "tools" as const },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => setTab(stat.key)}
              className={`rounded-lg p-3 text-center transition-colors ${tab === stat.key ? "bg-white/15 border border-white/20" : "bg-white/5 hover:bg-white/10"}`}
            >
              <div className="text-white font-bold text-xl">{stat.value}</div>
              <div className="text-white/40 text-xs">{stat.label}</div>
            </button>
          ))}
        </div>
      )}

      {!data && !loading && (
        <div className="text-center py-8 text-white/30 text-sm">
          Click Refresh to load dev stack info
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-white/40 text-sm animate-pulse">
          Scanning skills, plugins, tools…
        </div>
      )}

      {/* Tab content */}
      {data && (
        <div className="space-y-3">
          {/* Free Models */}
          {tab === "models" && (
            <div>
              <p className="text-white/40 text-xs mb-2">Free models available locally and via chain</p>
              <div className="space-y-1">
                {data.freeModels.map(m => (
                  <div key={m.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                    <div>
                      <span className="text-white text-sm font-medium">{m.name}</span>
                      <span className="text-white/40 text-xs ml-2">{m.provider}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/30 text-xs">{m.via}</span>
                      <span className="text-emerald-400 text-xs font-mono">{m.hrs}h/day</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {tab === "skills" && (
            <div>
              <input
                type="text"
                placeholder="Filter skills…"
                value={skillFilter}
                onChange={e => setSkillFilter(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder:text-white/30 mb-2 outline-none"
              />
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredSkills.map(s => (
                  <div key={s.name} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${s.hasSkillMd ? "bg-emerald-400" : "bg-white/20"}`} />
                    <span className="text-white text-sm font-mono">{s.name}</span>
                    {s.description && <span className="text-white/30 text-xs truncate">{s.description}</span>}
                  </div>
                ))}
                {filteredSkills.length === 0 && (
                  <div className="text-white/30 text-sm text-center py-4">No skills match</div>
                )}
              </div>
            </div>
          )}

          {/* Plugins */}
          {tab === "plugins" && (
            <div className="space-y-1">
              {data.plugins.list.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-mono">{p.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.enabled ? "bg-emerald-400/20 text-emerald-400" : "bg-white/10 text-white/30"}`}>
                    {p.enabled ? "enabled" : "disabled"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* MCP Servers */}
          {tab === "mcp" && (
            <div className="space-y-3">
              <div>
                <p className="text-white/40 text-xs mb-1">Global</p>
                <div className="space-y-1">
                  {data.mcp.global.map(s => (
                    <div key={s} className="bg-white/5 rounded-lg px-3 py-1.5 text-white text-sm font-mono">{s}</div>
                  ))}
                  {data.mcp.global.length === 0 && <div className="text-white/20 text-xs">none</div>}
                </div>
              </div>
              <div>
                <p className="text-white/40 text-xs mb-1">agents/ project</p>
                <div className="space-y-1">
                  {data.mcp.agents.map(s => (
                    <div key={s} className="bg-white/5 rounded-lg px-3 py-1.5 text-white text-sm font-mono">{s}</div>
                  ))}
                  {data.mcp.agents.length === 0 && <div className="text-white/20 text-xs">none</div>}
                </div>
              </div>
            </div>
          )}

          {/* Tools */}
          {tab === "tools" && (
            <div className="space-y-1">
              {data.tools.map(t => (
                <div key={t.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <span className="text-white text-sm font-mono">{t.name}</span>
                  <div className="flex items-center gap-2">
                    {t.version && <span className="text-white/30 text-xs">{t.version.split(" ")[0]}</span>}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.installed ? "bg-emerald-400/20 text-emerald-400" : "bg-red-400/20 text-red-400"}`}>
                      {t.installed ? "✓" : "missing"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Install preset section */}
      <div className="mt-5 pt-4 border-t border-white/10">
        <p className="text-white/40 text-xs mb-2">Install stack for project type</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {PRESETS.map(p => (
            <button
              key={p}
              onClick={() => install(p)}
              disabled={installing}
              className="bg-white/10 hover:bg-white/15 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 capitalize"
            >
              {p}
            </button>
          ))}
        </div>

        {installResult && (
          <div className="bg-white/5 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/60 text-xs">Preset: <span className="text-white">{installResult.preset}</span></span>
              <button
                onClick={copyScript}
                className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors"
              >
                {copiedScript ? "Copied!" : "Copy script"}
              </button>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-white/40">Tools: <span className="text-white">{installResult.tools.join(", ")}</span></span>
            </div>
            <div className="text-xs text-white/40">
              Skills: <span className="text-white/60">{installResult.skills.join(", ")}</span>
            </div>
            <p className="text-amber-400/70 text-xs">{installResult.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
