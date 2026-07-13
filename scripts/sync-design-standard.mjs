#!/usr/bin/env node
// Parses ../DESIGN-STANDARD.md's "Project → Theme Assignment" table and POSTs
// the rows to /api/design-standard, which persists them into Edge Config under
// key "design_standard". Re-run any time DESIGN-STANDARD.md changes — this is
// the re-sync path, not a one-time hardcoded copy.
//
// Usage:
//   node scripts/sync-design-standard.mjs [--url http://localhost:3000] [--md /path/to/DESIGN-STANDARD.md] [--password siva2026]

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, arg, i, arr) => {
    if (arg.startsWith("--")) acc.push([arg.slice(2), arr[i + 1]]);
    return acc;
  }, [])
);

const baseUrl = args.url ?? "http://localhost:3000";
const mdPath = resolve(args.md ?? "../DESIGN-STANDARD.md");
const password = args.password ?? process.env.DASHBOARD_PASSWORD ?? "siva2026";

const TABLE_ROW = /^\|\s*([a-z0-9._-]+)\s*\|\s*(\S+)\s*\|\s*(LIGHT|DARK)\s+([a-z-]+)\s*\|\s*`(#[0-9a-fA-F]{3,8})`\s*\|\s*`(#[0-9a-fA-F]{3,8})`\s*\|$/;

function parse(md) {
  const rows = new Map(); // dedupe by project, last row wins
  for (const line of md.split("\n")) {
    const m = TABLE_ROW.exec(line.trim());
    if (!m) continue;
    const [, project, url, mode, category, bg, accent] = m;
    rows.set(project, {
      project,
      url,
      themeLabel: `${mode} ${category}`,
      bg: bg.toLowerCase(),
      accent: accent.toLowerCase(),
    });
  }
  return [...rows.values()];
}

const md = readFileSync(mdPath, "utf8");
const rows = parse(md);

if (rows.length === 0) {
  console.error(`No table rows parsed from ${mdPath} — check the table format hasn't changed.`);
  process.exit(1);
}

console.log(`Parsed ${rows.length} rows from ${mdPath}`);

const res = await fetch(`${baseUrl}/api/design-standard`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: `hub_auth=${password}`,
  },
  body: JSON.stringify({ rows }),
});

const data = await res.json();
if (!res.ok) {
  console.error("Sync failed:", data.error ?? data);
  process.exit(1);
}

console.log(`Synced ${data.count} rows to Edge Config (design_standard) at ${new Date(data.syncedAt).toISOString()}`);
