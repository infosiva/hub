type Category = "Education" | "Finance" | "Travel" | "Developer" | "Career" | "Social" | "News" | "Gaming" | "Compliance" | "Language";

interface Product {
  name: string;
  tagline: string;
  url: string;
  emoji: string;
  category: Category;
  color: string;
}

const PRODUCTS: Product[] = [
  // Education
  { name: "Tutiq",        tagline: "AI personal tutor — any subject, any age",           url: "https://tutiq.app",            emoji: "📖", category: "Education",  color: "text-emerald-400" },
  { name: "Kwizzo",       tagline: "Family quiz game powered by AI",                     url: "https://kwizzo.app",           emoji: "🎯", category: "Education",  color: "text-violet-400" },
  { name: "QuizBites",    tagline: "Live classroom quizzes for teachers & students",     url: "https://quizbites.app",        emoji: "⚡", category: "Education",  color: "text-blue-400" },
  { name: "QuizBytes",    tagline: "Daily quiz challenges & trivia",                     url: "https://quizbytes.dev",        emoji: "🧠", category: "Education",  color: "text-indigo-400" },
  // Language
  { name: "SpeakIQ",      tagline: "AI language learning coach",                        url: "https://speakiq.app",          emoji: "🗣️", category: "Language",   color: "text-pink-400" },
  // Finance
  { name: "TrackWealth",  tagline: "AI investment tracker & portfolio insights",         url: "https://trackwealth.app",      emoji: "📈", category: "Finance",    color: "text-green-400" },
  // Travel
  { name: "RoamPlan",     tagline: "AI travel planner — itineraries in seconds",        url: "https://roamplan.app",         emoji: "🌍", category: "Travel",     color: "text-orange-400" },
  { name: "FlightBrain",  tagline: "Live flight tracker with AI insights",              url: "https://flightbrain.app",      emoji: "✈️", category: "Travel",     color: "text-sky-400" },
  // Career
  { name: "ResumeVault",  tagline: "AI resume builder — land your next job",            url: "https://resumevault.app",      emoji: "📄", category: "Career",     color: "text-amber-400" },
  { name: "AI Jobs",      tagline: "AI-powered job portal for tech roles",              url: "https://www.aijobsportal.app", emoji: "💼", category: "Career",     color: "text-lime-400" },
  // Social
  { name: "DraftCal",     tagline: "AI social media calendar & content planner",        url: "https://draftcal.app",         emoji: "📅", category: "Social",     color: "text-fuchsia-400" },
  // Compliance
  { name: "ComplyScan",   tagline: "AI compliance scanner for websites & policies",     url: "https://complyscan.app",       emoji: "🛡️", category: "Compliance", color: "text-red-400" },
  // Developer
  { name: "AgentLogs",    tagline: "Observability & tracing for AI agents",             url: "https://agentlogs.app",        emoji: "🔍", category: "Developer",  color: "text-cyan-400" },
  { name: "ClawdBot",     tagline: "AI chatbot builder platform",                       url: "https://clawdbotai.tech",      emoji: "🤖", category: "Developer",  color: "text-purple-400" },
  // Gaming
  { name: "ArcadeForge",  tagline: "AI game builder — create browser games with prompts", url: "https://arcadeforge.app",   emoji: "🕹️", category: "Gaming",     color: "text-yellow-400" },
  // News
  { name: "NammaTamil",   tagline: "Tamil news, cricket & culture hub",                url: "https://nammatamil.live",      emoji: "🎙️", category: "News",       color: "text-rose-400" },
  { name: "WorldTrends",  tagline: "Real-time global trend tracker",                   url: "https://worldtrends.today",    emoji: "🌐", category: "News",       color: "text-teal-400" },
  { name: "QuickTech",    tagline: "AI-powered tech news & summaries",                 url: "https://quicktechai.app",      emoji: "⚙️", category: "News",       color: "text-slate-400" },
];

const CATEGORY_COLORS: Record<Category, string> = {
  Education:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Finance:     "bg-green-500/10 text-green-400 border-green-500/20",
  Travel:      "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Developer:   "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  Career:      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Social:      "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  News:        "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Gaming:      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Compliance:  "bg-red-500/10 text-red-400 border-red-500/20",
  Language:    "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

const CATEGORIES: Category[] = ["Education", "Language", "Finance", "Travel", "Career", "Social", "Compliance", "Developer", "Gaming", "News"];

export default function HubPage() {
  return (
    <div className="relative min-h-screen text-white">
      <div className="mesh-bg" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 mb-6 text-white/40 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/10"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            <span className="dot-live" />
            {PRODUCTS.length} live AI products
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-iridescent leading-tight">
            AI Products
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed">
            A collection of AI-powered tools for learning, productivity, travel, finance, and beyond.
          </p>
        </div>

        {/* Category sections */}
        {CATEGORIES.map(cat => {
          const items = PRODUCTS.filter(p => p.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} className="mb-14">
              <div className="flex items-center gap-3 mb-5">
                <span className={`pill ${CATEGORY_COLORS[cat]}`}>{cat}</span>
                <span className="text-white/20 text-xs">{items.length} {items.length === 1 ? "tool" : "tools"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(p => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card rounded-2xl p-5 flex items-start gap-4 group"
                  >
                    <div className="text-3xl mt-0.5 shrink-0">{p.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-base ${p.color}`}>{p.name}</span>
                        <svg className="w-3 h-3 text-white/20 group-hover:text-white/50 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <p className="text-white/50 text-sm leading-snug">{p.tagline}</p>
                      <p className="text-white/20 text-xs mt-2 truncate">{p.url.replace("https://", "").replace("http://", "")}</p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/[0.06] text-center text-white/25 text-sm">
          Built by <span className="text-white/45 font-medium">Siva</span> · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
