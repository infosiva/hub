"use client";

import { useState, useEffect } from "react";
import { SITES } from "@/lib/sites";

type ApiKeyRow = {
  id: string;
  project: string;
  provider: string;
  envVarName: string;
  maskedValue: string | null;
  notes: string | null;
  updatedAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(SITES[0]?.id ?? "");
  const [provider, setProvider] = useState("");
  const [envVarName, setEnvVarName] = useState("");
  const [maskedValue, setMaskedValue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((data) => setKeys(data.keys ?? []))
      .catch(() => setKeys([]))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function addKey() {
    if (!provider || !envVarName) return;
    setSaving(true);
    try {
      await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project, provider, envVarName, maskedValue, notes }),
      });
      setProvider("");
      setEnvVarName("");
      setMaskedValue("");
      setNotes("");
      load();
    } finally {
      setSaving(false);
    }
  }

  async function removeKey(id: string) {
    await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
    load();
  }

  const siteById = Object.fromEntries(SITES.map((s) => [s.id, s]));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-semibold mb-2">API Key Registry</h1>
      <p className="text-white/50 text-sm mb-6">
        Metadata + masked preview only — live secrets stay in each project&apos;s own Vercel env.
        &quot;Try as admin&quot; means checking a key exists here, then opening that project&apos;s own admin surface.
      </p>

      <div className="flex flex-wrap gap-2 mb-8 items-end bg-white/5 border border-white/10 rounded-lg p-4">
        <select value={project} onChange={(e) => setProject(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-1.5">
          {SITES.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}
        </select>
        <input placeholder="provider (groq, gemini...)" value={provider} onChange={(e) => setProvider(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-1.5" />
        <input placeholder="ENV_VAR_NAME" value={envVarName} onChange={(e) => setEnvVarName(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-1.5" />
        <input placeholder="masked value (gsk_****ab12)" value={maskedValue} onChange={(e) => setMaskedValue(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-1.5" />
        <input placeholder="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-black border border-white/10 rounded px-2 py-1.5" />
        <button onClick={addKey} disabled={saving} className="bg-white text-black rounded px-3 py-1.5 font-medium disabled:opacity-50">
          {saving ? "Saving…" : "Add"}
        </button>
      </div>

      {loading ? (
        <p className="text-white/50">Loading…</p>
      ) : keys.length === 0 ? (
        <p className="text-white/50">No keys registered yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/50 border-b border-white/10">
              <th className="py-2 pr-4">Project</th>
              <th className="py-2 pr-4">Provider</th>
              <th className="py-2 pr-4">Env var</th>
              <th className="py-2 pr-4">Masked</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2 pr-4">Admin</th>
              <th className="py-2 pr-4" />
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id} className="border-b border-white/5">
                <td className="py-2 pr-4">{k.project}</td>
                <td className="py-2 pr-4">{k.provider}</td>
                <td className="py-2 pr-4 font-mono text-xs">{k.envVarName}</td>
                <td className="py-2 pr-4 font-mono text-xs">{k.maskedValue ?? "—"}</td>
                <td className="py-2 pr-4 text-white/50">{k.notes ?? "—"}</td>
                <td className="py-2 pr-4">
                  {siteById[k.project]?.url ? (
                    <a href={siteById[k.project].url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                      open →
                    </a>
                  ) : "—"}
                </td>
                <td className="py-2 pr-4">
                  <button onClick={() => removeKey(k.id)} className="text-red-400 hover:underline">remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
