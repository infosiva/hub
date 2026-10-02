import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SKILLS_DIR = path.join(process.env.HOME || "/root", ".claude/skills");
const SETTINGS_FILE = path.join(process.env.HOME || "/root", ".claude/settings.json");
const AGENTS_DIR = path.join(process.env.HOME || "/root", "projects/agents");

const FREE_MODELS = [
  { name: "Space Bunny Alpha", provider: "Freebuff", hrs: "∞", tier: "free", via: "freebuff CLI" },
  { name: "GLM 5.3 Flash", provider: "ZhipuAI", hrs: "20", tier: "free", via: "OpenRouter :free" },
  { name: "Solar Mini 4", provider: "Upstage", hrs: "20", tier: "free", via: "OpenRouter :free" },
  { name: "MiMo 2.6 Flash", provider: "MiMo", hrs: "10", tier: "free", via: "OpenRouter :free" },
  { name: "Solar Pro 4", provider: "Upstage", hrs: "10", tier: "free", via: "OpenRouter :free" },
  { name: "DeepSeek V4.1 Flash", provider: "DeepSeek", hrs: "6", tier: "free", via: "chain" },
  { name: "llama-3.3-70b", provider: "Groq", hrs: "∞", tier: "free", via: "chain" },
  { name: "gemini-2.0-flash", provider: "Google", hrs: "∞", tier: "free", via: "chain" },
  { name: "llama-3.1-8b", provider: "Cerebras", hrs: "∞", tier: "free", via: "chain" },
];

function getSkills() {
  try {
    const dirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => {
        const skillMd = path.join(SKILLS_DIR, d.name, "SKILL.md");
        const hasMd = fs.existsSync(skillMd);
        let description = "";
        if (hasMd) {
          const content = fs.readFileSync(skillMd, "utf8");
          const descMatch = content.match(/description:\s*(.+)/);
          description = descMatch ? descMatch[1].trim().slice(0, 100) : "";
        }
        return { name: d.name, description, hasSkillMd: hasMd };
      });
    return dirs;
  } catch {
    return [];
  }
}

function getPlugins() {
  try {
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    const enabled = settings.enabledPlugins || {};
    return Object.entries(enabled).map(([id, val]) => ({
      id,
      enabled: val !== false,
    }));
  } catch {
    return [];
  }
}

function getMcpServers() {
  try {
    const claudeJson = path.join(process.env.HOME || "/root", ".claude.json");
    const data = JSON.parse(fs.readFileSync(claudeJson, "utf8"));
    const globalServers = Object.keys(data.mcpServers || {});
    // Also check agents project entry
    const projects = data.projects || {};
    const agentsEntry = Object.entries(projects).find(([k]) => k.includes("agents"));
    const projectServers = agentsEntry ? Object.keys((agentsEntry[1] as any).mcpServers || {}) : [];
    return { global: globalServers, agents: projectServers };
  } catch {
    return { global: [], agents: [] };
  }
}

function getInstalledTools() {
  const tools = [
    { name: "freebuff", cmd: "freebuff --version" },
    { name: "pnpm", cmd: "pnpm --version" },
    { name: "graphify", cmd: "graphify --version" },
    { name: "vercel", cmd: "vercel --version" },
    { name: "gh", cmd: "gh --version" },
    { name: "supabase", cmd: "supabase --version" },
    { name: "ollama", cmd: "ollama --version" },
  ];
  return tools.map(t => {
    try {
      const out = execSync(t.cmd, { timeout: 3000, encoding: "utf8" }).trim().split("\n")[0];
      return { name: t.name, installed: true, version: out.slice(0, 40) };
    } catch {
      return { name: t.name, installed: false, version: null };
    }
  });
}

export async function GET() {
  const skills = getSkills();
  const plugins = getPlugins();
  const mcp = getMcpServers();
  const tools = getInstalledTools();

  return NextResponse.json({
    skills: { total: skills.length, list: skills },
    plugins: { total: plugins.length, list: plugins },
    mcp,
    tools,
    freeModels: FREE_MODELS,
  });
}
