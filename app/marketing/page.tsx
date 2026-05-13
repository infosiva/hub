"use client";

import { useState } from "react";

// ─── Product config ────────────────────────────────────────────────────────────

interface MarketingProduct {
  id: string;
  name: string;
  tagline: string;
  url: string;
  emoji: string;
  color: string;
  category: string;
  // for copy generation
  audience: string;
  painPoint: string;
  keyFeatures: string[];
  freeLimit: string;
  proPrice: string;
  subreddits: string[];
  phTagline: string;
}

const PRODUCTS: MarketingProduct[] = [
  {
    id: "speakiq",
    name: "SpeakIQ",
    tagline: "AI conversation partner for language learners",
    url: "https://speakiq.app",
    emoji: "🗣️",
    color: "text-pink-400",
    category: "Language Learning",
    audience: "language learners, expats, travellers",
    painPoint: "Most language apps are boring drill-based exercises. Real fluency needs actual conversation practice.",
    keyFeatures: ["Real-time AI conversation in 50+ languages", "Instant grammar correction with explanations", "Adapts to your level (beginner → advanced)", "7 practice modes (travel, business, culture...)", "Daily streak tracking"],
    freeLimit: "20 messages/day",
    proPrice: "$7/month",
    subreddits: ["r/languagelearning", "r/learnspanish", "r/learnfrench", "r/artificial", "r/apps"],
    phTagline: "Practice real conversations in 50+ languages — AI that talks back",
  },
  {
    id: "resumevault",
    name: "ResumeVault",
    tagline: "AI resume builder that beats ATS systems",
    url: "https://resumevault.app",
    emoji: "📄",
    color: "text-amber-400",
    category: "Career",
    audience: "job seekers, recent graduates, career switchers",
    painPoint: "75% of resumes get rejected by ATS before a human sees them. Generic templates don't work anymore.",
    keyFeatures: ["ATS optimisation score (0–100)", "AI rewrites tailored to job descriptions", "Section-by-section AI suggestions", "50+ ATS-proven templates", "Export to PDF instantly"],
    freeLimit: "3 free resume exports",
    proPrice: "$9/month",
    subreddits: ["r/cscareerquestions", "r/jobs", "r/resumes", "r/artificial", "r/careerguidance"],
    phTagline: "ATS-proof your resume with AI — free to try, no signup needed",
  },
  {
    id: "kwizzo",
    name: "Kwizzo",
    tagline: "AI-powered family quiz game for all ages",
    url: "https://kwizzo.app",
    emoji: "🎯",
    color: "text-violet-400",
    category: "Education / Gaming",
    audience: "families, parents, teachers, trivia lovers",
    painPoint: "Screen time is inevitable — it might as well make kids smarter. Most quiz apps are either boring or too hard.",
    keyFeatures: ["AI generates unlimited quiz questions on any topic", "Adapts difficulty per player age", "Multiplayer up to 8 players", "Leaderboards & streaks", "Family mode with kid-safe content"],
    freeLimit: "10 quizzes/day",
    proPrice: "$8/month",
    subreddits: ["r/Parenting", "r/trivia", "r/boardgames", "r/Teachers", "r/artificial"],
    phTagline: "Infinite AI quiz game for families — any topic, any age, multiplayer",
  },
  {
    id: "tutiq",
    name: "Tutiq",
    tagline: "AI personal tutor for any subject",
    url: "https://tutiq.app",
    emoji: "📖",
    color: "text-emerald-400",
    category: "Education",
    audience: "students, parents, self-learners",
    painPoint: "Private tutors cost $50–$100/hr. Most kids don't get personalised help outside school.",
    keyFeatures: ["Explains any topic in plain English", "Adapts to your level and pace", "Works for any subject (Math, Science, History...)", "Asks follow-up questions to check understanding", "Progress tracking"],
    freeLimit: "15 questions/day",
    proPrice: "$8/month",
    subreddits: ["r/Parenting", "r/homeschool", "r/learnmath", "r/Teachers", "r/artificial"],
    phTagline: "Free AI tutor that explains anything to anyone — no booking, no waiting",
  },
  {
    id: "draftcal",
    name: "DraftCal",
    tagline: "AI social media calendar & content planner",
    url: "https://draftcal.app",
    emoji: "📅",
    color: "text-fuchsia-400",
    category: "Marketing / Social",
    audience: "solopreneurs, creators, small business owners",
    painPoint: "Content consistency is what grows social media. But writing posts every day is exhausting.",
    keyFeatures: ["30-day content calendar in 2 minutes", "AI writes posts for Instagram, Twitter, LinkedIn", "Brand voice matching", "Hashtag suggestions", "One-click scheduling (Buffer/Later integration)"],
    freeLimit: "7 posts/month",
    proPrice: "$12/month",
    subreddits: ["r/socialmedia", "r/entrepreneur", "r/smallbusiness", "r/marketing", "r/artificial"],
    phTagline: "30-day social media calendar in 2 minutes — AI writes every post",
  },
];

// ─── Copy generators ────────────────────────────────────────────────────────────

function generateRedditPost(p: MarketingProduct): string {
  return `**I built a free ${p.category} tool — would love your feedback**

${p.painPoint}

So I built **${p.name}** — ${p.tagline}.

What it does:
${p.keyFeatures.map(f => `• ${f}`).join("\n")}

It's free to start (${p.freeLimit}). No signup required to try the core feature.

→ ${p.url}

I'm actively building this and would love honest feedback. What would make this actually useful for you?`;
}

function generateRedditComment(p: MarketingProduct): string {
  return `Hey, not sure if this helps — I built **${p.name}** for exactly this use case. It's ${p.tagline.toLowerCase()}.

${p.keyFeatures[0]} and ${p.keyFeatures[1].toLowerCase()}.

Free to try: ${p.url}`;
}

function generateProductHunt(p: MarketingProduct): string {
  return `**Tagline:** ${p.phTagline}

**Description:**
${p.name} is a free AI tool for ${p.audience}. ${p.painPoint}

${p.name} solves this with:
${p.keyFeatures.map(f => `✅ ${f}`).join("\n")}

Free plan: ${p.freeLimit}. Upgrade to Pro for unlimited: ${p.proPrice}.

Built with: Next.js, Groq, Gemini, Claude (fallback chain — free models first).

**Maker comment:**
Hi PH! 👋 I'm Siva, and I built ${p.name} because ${p.painPoint.toLowerCase()}

I've been building AI tools for the past few months and ${p.name} is one I'm most excited about.

Would love your feedback — what features would make this a daily habit for you?

→ ${p.url}`;
}

function generateDirectory(p: MarketingProduct): string {
  return `**Name:** ${p.name}
**URL:** ${p.url}
**Tagline:** ${p.phTagline}
**Category:** ${p.category}

**Short description (50 words):**
${p.name} is a free AI tool that helps ${p.audience}. ${p.keyFeatures[0]}. ${p.keyFeatures[1]}. Free plan available — ${p.freeLimit}. Pro at ${p.proPrice}/month.

**Long description (150 words):**
${p.name} is an AI-powered ${p.category.toLowerCase()} tool designed for ${p.audience}.

${p.painPoint}

${p.name} tackles this with ${p.keyFeatures.length} core features:
${p.keyFeatures.map((f, i) => `${i + 1}. ${f}`).join("\n")}

Unlike other tools in this space, ${p.name} uses a multi-model AI fallback chain (Groq → Gemini → Claude) to keep costs low and availability high — meaning the free plan is genuinely free, not a crippled demo.

Start free at ${p.url} — no credit card required.

**Tags:** AI, ${p.category}, free, ${p.keyFeatures[0].split(" ").slice(0, 3).join("-").toLowerCase()}
**Pricing:** Freemium (${p.freeLimit} free, Pro ${p.proPrice})`;
}

function generateTweet(p: MarketingProduct): string {
  return `🧵 I built ${p.name} — ${p.tagline}.

Here's what I learned building it:

1/ The problem: ${p.painPoint}

2/ The solution:
${p.keyFeatures.slice(0, 3).map(f => `→ ${f}`).join("\n")}

3/ It's free to try → ${p.url}

Built with Next.js + AI fallback chain (Groq → Gemini → Claude).

What would you add? 👇

#buildinpublic #AI #${p.id}`;
}

// ─── Subreddit suggestions ──────────────────────────────────────────────────────

const DIRECTORIES = [
  { name: "There's An AI For That", url: "https://theresanaiforthat.com/submit/", emoji: "🔖" },
  { name: "Futurepedia", url: "https://www.futurepedia.io/submit-tool", emoji: "🚀" },
  { name: "Toolify.ai", url: "https://www.toolify.ai/submit", emoji: "🛠️" },
  { name: "Uneed.be", url: "https://www.uneed.be/submit", emoji: "📦" },
  { name: "AI Tools Directory", url: "https://aitoolsdirectory.com/submit", emoji: "📋" },
  { name: "Microlaunch", url: "https://microlaunch.net/submit", emoji: "🎯" },
];

// ─── UI ─────────────────────────────────────────────────────────────────────────

type Platform = "reddit-post" | "reddit-comment" | "producthunt" | "directory" | "tweet";

const PLATFORMS: { id: Platform; label: string; emoji: string }[] = [
  { id: "reddit-post", label: "Reddit Post", emoji: "📢" },
  { id: "reddit-comment", label: "Reddit Comment", emoji: "💬" },
  { id: "producthunt", label: "ProductHunt", emoji: "🚀" },
  { id: "directory", label: "Directory Submit", emoji: "📋" },
  { id: "tweet", label: "Twitter/X Thread", emoji: "🐦" },
];

export default function MarketingPage() {
  const [selectedProduct, setSelectedProduct] = useState<MarketingProduct>(PRODUCTS[0]);
  const [platform, setPlatform] = useState<Platform>("reddit-post");
  const [copied, setCopied] = useState(false);

  function getCopy(): string {
    switch (platform) {
      case "reddit-post": return generateRedditPost(selectedProduct);
      case "reddit-comment": return generateRedditComment(selectedProduct);
      case "producthunt": return generateProductHunt(selectedProduct);
      case "directory": return generateDirectory(selectedProduct);
      case "tweet": return generateTweet(selectedProduct);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(getCopy());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const copy = getCopy();
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotReady, setScreenshotReady] = useState(false);
  // ScreenshotOne free tier — real headless Chrome, no auth needed for public sites
  const screenshotUrl = `https://api.screenshotone.com/take?url=${encodeURIComponent(selectedProduct.url)}&viewport_width=1280&viewport_height=800&format=jpg&image_quality=85&full_page=false&delay=2&cache=true`;
  const microlinkUrl = `https://api.microlink.io/?url=${encodeURIComponent(selectedProduct.url)}&screenshot=true&meta=false&embed=screenshot.url&type=jpeg&viewport.width=1280&viewport.height=800`;

  return (
    <div className="relative min-h-screen text-white">
      <div className="mesh-bg" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <a href="/" className="text-white/30 text-sm hover:text-white/60 transition-colors mb-4 inline-flex items-center gap-1">
            ← All Products
          </a>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Marketing Dashboard
          </h1>
          <p className="text-white/40 text-sm">
            Generate ready-to-post marketing copy for any product across all platforms.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">

          {/* Left: product picker */}
          <div className="space-y-3">
            <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-4">Select Product</p>
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selectedProduct.id === p.id
                    ? "bg-white/10 border-white/20"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <div className={`font-semibold text-sm ${p.color}`}>{p.name}</div>
                  <div className="text-white/35 text-xs truncate max-w-[180px]">{p.category}</div>
                </div>
              </button>
            ))}

            {/* Directory links */}
            <div className="mt-8">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Submit To Directories</p>
              <div className="space-y-2">
                {DIRECTORIES.map(d => (
                  <a
                    key={d.url}
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors py-1"
                  >
                    <span>{d.emoji}</span>
                    <span>{d.name}</span>
                    <svg className="w-3 h-3 ml-auto opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: copy area */}
          <div className="space-y-6">

            {/* Live Preview + Screenshot */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-3">
                <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Live Preview</span>
                <span className="text-white/20 text-xs">— scroll inside to explore</span>
                <div className="ml-auto flex items-center gap-2">
                  <a
                    href={microlinkUrl}
                    download={`${selectedProduct.id}-screenshot.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.08] hover:bg-white/15 border border-white/10 transition-colors"
                  >
                    📸 Get Screenshot
                  </a>
                  <a
                    href={selectedProduct.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors text-white/50"
                  >
                    Open ↗
                  </a>
                </div>
              </div>
              {/* iframe live preview */}
              <div className="relative w-full bg-black/60" style={{ height: "420px" }}>
                <iframe
                  key={selectedProduct.id}
                  src={selectedProduct.url}
                  title={`${selectedProduct.name} live preview`}
                  className="w-full h-full border-0"
                  style={{ transform: "scale(0.75)", transformOrigin: "top left", width: "133%", height: "133%" }}
                  loading="lazy"
                />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              </div>
              <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-2">
                <span className="text-white/20 text-xs">💡 Click <strong className="text-white/40">Get Screenshot</strong> → right-click the image → Save As — use for Reddit, PH, directories</span>
              </div>
            </div>

            {/* Platform tabs */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {PLATFORMS.map(pl => (
                  <button
                    key={pl.id}
                    onClick={() => setPlatform(pl.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                      platform === pl.id
                        ? "bg-white/15 text-white border border-white/20"
                        : "bg-white/[0.04] text-white/50 border border-white/[0.06] hover:bg-white/[0.08]"
                    }`}
                  >
                    <span>{pl.emoji}</span> {pl.label}
                  </button>
                ))}
              </div>

              {/* Subreddit suggestions for reddit tabs */}
              {(platform === "reddit-post" || platform === "reddit-comment") && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-white/30 text-xs py-1">Post in:</span>
                  {selectedProduct.subreddits.map(sub => (
                    <a
                      key={sub}
                      href={`https://reddit.com/${sub}/submit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-300 border border-orange-500/20 hover:bg-orange-500/20 transition-colors"
                    >
                      {sub} ↗
                    </a>
                  ))}
                </div>
              )}

              {/* Copy box */}
              <div className="relative">
                <div className="glass-card rounded-xl p-5">
                  <pre className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap font-sans">{copy}</pre>
                </div>
                <button
                  onClick={handleCopy}
                  className={`absolute top-3 right-3 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    copied
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-white/[0.08] text-white/60 border border-white/10 hover:bg-white/15"
                  }`}
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>

              {/* Character count */}
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-white/20 text-xs">{copy.length} characters · {copy.split("\n").length} lines</span>
                {platform === "tweet" && (
                  <span className={`text-xs ${copy.split("\n")[0].length > 280 ? "text-red-400" : "text-white/20"}`}>
                    First tweet: {copy.split("\n")[0].length}/280
                  </span>
                )}
              </div>
            </div>

            {/* Feature list for context */}
            <div className="glass-card rounded-xl p-5">
              <p className="text-white/30 text-xs font-semibold uppercase tracking-widest mb-3">Key Features to Highlight</p>
              <ul className="space-y-1.5">
                {selectedProduct.keyFeatures.map((f, i) => (
                  <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                    <span className={`${selectedProduct.color} mt-0.5`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
