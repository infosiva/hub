import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Skills/tools recommended per project type
const PROJECT_PRESETS: Record<string, { skills: string[]; tools: string[] }> = {
  nextjs: {
    skills: ["ui-ux-pro-max", "taste-skill", "emil-design-eng", "animate", "fixing-accessibility", "karpathy-guidelines"],
    tools: ["freebuff", "pnpm"],
  },
  api: {
    skills: ["karpathy-guidelines", "systematic-debugging"],
    tools: ["freebuff"],
  },
  ai: {
    skills: ["karpathy-guidelines", "systematic-debugging", "ui-ux-pro-max"],
    tools: ["freebuff", "ollama"],
  },
  fullstack: {
    skills: ["ui-ux-pro-max", "taste-skill", "emil-design-eng", "animate", "fixing-accessibility", "karpathy-guidelines", "systematic-debugging"],
    tools: ["freebuff", "pnpm", "vercel"],
  },
};

const TOOL_INSTALL_CMDS: Record<string, string> = {
  freebuff: "npm install -g freebuff",
  pnpm: "npm install -g pnpm",
  vercel: "npm install -g vercel",
  gh: "brew install gh",
  supabase: "brew install supabase/tap/supabase",
  ollama: "brew install ollama",
  graphify: "pip3 install graphify",
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { preset } = body as { preset?: string };

  const config = preset ? PROJECT_PRESETS[preset] : null;
  if (!config) {
    return NextResponse.json({ error: "unknown preset" }, { status: 400 });
  }

  // Return a shell script the user can run — never execute server-side
  const toolLines = config.tools
    .map(t => TOOL_INSTALL_CMDS[t] ? `echo "installing ${t}..." && ${TOOL_INSTALL_CMDS[t]}` : `echo "# no install cmd for ${t}"`)
    .join("\n");

  const skillLines = config.skills
    .map(s => `echo "  ✓ skill: ${s} (already in ~/.claude/skills/)"`)
    .join("\n");

  const script = `#!/bin/bash
# Auto-generated install script for preset: ${preset}
# Run: bash <(echo '...')  OR copy-paste in terminal
set -e

echo "=== Tools ==="
${toolLines}

echo ""
echo "=== Skills (pre-installed in ~/.claude/skills/) ==="
${skillLines}

echo ""
echo "Done. Restart Claude Code to pick up new tools."
`;

  return NextResponse.json({
    preset,
    skills: config.skills,
    tools: config.tools,
    script,
    note: "Copy the script and run it in your terminal — installs are never executed server-side.",
  });
}
