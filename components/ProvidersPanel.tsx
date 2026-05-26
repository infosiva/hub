"use client";

import { useState, useEffect, useCallback } from "react";

const PROVIDER_ICONS: Record<string, string> = {
  ollama: "🦙",
  groq: "⚡",
  gemini: "✨",
  cerebras: "🧠",
  together: "🤝",
  openrouter: "🔀",
  mistral: "🌬️",
  nvidia: "🟢",
  kimi: "🌙",
  deepseek: "🔍",
  perplexity: "🔭",
  xai: "𝕏",
  cohere: "🌊",
  openai: "⭕",
  anthropic: "🤖",
};

export default function ProvidersPanel() {
  const [order, setOrder] = useState<string[]>([]);
  const [disabled, setDisabled] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newProvider, setNewProvider] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/providers");
      const data = await res.json();
      setOrder(data.fallbackOrder ?? []);
      setDisabled(data.disabledProviders ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (provider: string) => {
    const isDisabled = disabled.includes(provider);
    setSaving(true);
    try {
      const res = await fetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isDisabled ? "enable" : "disable", provider }),
      });
      const data = await res.json();
      setDisabled(data.disabledProviders ?? disabled);
    } finally {
      setSaving(false);
    }
  };

  const addProvider = async () => {
    const p = newProvider.trim().toLowerCase();
    if (!p || order.includes(p)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", provider: p }),
      });
      const data = await res.json();
      setOrder(data.fallbackOrder ?? order);
      setNewProvider("");
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (provider: string) => setDragging(provider);
  const handleDragOver = (e: React.DragEvent, provider: string) => {
    e.preventDefault();
    setDragOver(provider);
  };
  const handleDrop = async (e: React.DragEvent, target: string) => {
    e.preventDefault();
    if (!dragging || dragging === target) return;
    const from = order.indexOf(dragging);
    const to = order.indexOf(target);
    const newOrder = [...order];
    newOrder.splice(from, 1);
    newOrder.splice(to, 0, dragging);
    setOrder(newOrder);
    setDragging(null);
    setDragOver(null);
    setSaving(true);
    try {
      const res = await fetch("/api/providers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", order: newOrder }),
      });
      const data = await res.json();
      setOrder(data.fallbackOrder ?? newOrder);
    } finally {
      setSaving(false);
    }
  };

  const activeCount = order.filter((p) => !disabled.includes(p)).length;

  return (
    <div className="mb-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      {/* header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-base">🔗</span>
          <div>
            <p className="text-white font-semibold text-sm">AI Provider Fallback Chain</p>
            <p className="text-zinc-500 text-xs mt-0.5">
              {loading ? "Loading…" : `${activeCount} active · ${order.length} total · drag to reorder`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-xs text-amber-400 animate-pulse">Saving…</span>}
          {/* mini chain preview */}
          <div className="hidden sm:flex items-center gap-1">
            {order.slice(0, 6).map((p, i) => (
              <span
                key={p}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  disabled.includes(p) ? "bg-red-900/30 text-red-400 line-through" : "bg-white/5 text-zinc-300"
                }`}
              >
                {i + 1}.{p}
              </span>
            ))}
            {order.length > 6 && <span className="text-zinc-500 text-xs">+{order.length - 6}</span>}
          </div>
          <span className="text-zinc-500 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* expanded body */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/[0.06]">
          <p className="text-zinc-500 text-xs mt-3 mb-4">
            Drag to reorder. Click toggle to enable/disable. Changes apply instantly via Edge Config — no redeploy needed.
          </p>

          {loading ? (
            <div className="text-zinc-500 text-sm py-4 text-center">Loading provider config…</div>
          ) : (
            <div className="space-y-1.5">
              {order.map((provider, idx) => {
                const isDisabled = disabled.includes(provider);
                const isDraggingThis = dragging === provider;
                const isDragTarget = dragOver === provider;
                return (
                  <div
                    key={provider}
                    draggable
                    onDragStart={() => handleDragStart(provider)}
                    onDragOver={(e) => handleDragOver(e, provider)}
                    onDrop={(e) => handleDrop(e, provider)}
                    onDragEnd={() => { setDragging(null); setDragOver(null); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing ${
                      isDragTarget
                        ? "border-violet-500/50 bg-violet-900/20"
                        : isDraggingThis
                        ? "border-white/20 bg-white/10 opacity-50"
                        : isDisabled
                        ? "border-red-900/30 bg-red-900/5"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* priority badge */}
                    <span className="text-zinc-600 text-xs w-5 text-center font-mono">{idx + 1}</span>
                    {/* grab handle */}
                    <span className="text-zinc-600 text-xs select-none">⠿</span>
                    {/* icon + name */}
                    <span className="text-base leading-none">{PROVIDER_ICONS[provider] ?? "🔌"}</span>
                    <span className={`text-sm font-medium flex-1 ${isDisabled ? "text-zinc-600 line-through" : "text-zinc-200"}`}>
                      {provider}
                    </span>
                    {/* status label */}
                    {isDisabled ? (
                      <span className="text-xs text-red-400 bg-red-900/20 px-2 py-0.5 rounded-full">disabled</span>
                    ) : idx === 0 ? (
                      <span className="text-xs text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded-full">primary</span>
                    ) : (
                      <span className="text-xs text-zinc-600 bg-white/[0.03] px-2 py-0.5 rounded-full">fallback {idx}</span>
                    )}
                    {/* toggle button */}
                    <button
                      onClick={() => toggle(provider)}
                      disabled={saving}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        isDisabled
                          ? "border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20"
                          : "border-red-700/40 text-red-400 hover:bg-red-900/20"
                      } disabled:opacity-40`}
                    >
                      {isDisabled ? "Enable" : "Disable"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* add custom provider */}
          <div className="flex gap-2 mt-4">
            <input
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addProvider()}
              placeholder="Add provider (e.g. fireworks)"
              className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/40"
            />
            <button
              onClick={addProvider}
              disabled={!newProvider.trim() || saving}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm rounded-xl transition-colors font-medium"
            >
              + Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
