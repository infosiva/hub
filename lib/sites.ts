export type SiteStatus = "up" | "down" | "unknown";
export type Priority = "high" | "medium" | "low";

export interface Tip {
  label: string;
  priority: Priority;
}

export interface Competitor {
  name: string;
  url: string;
  strength: string; // what they do better
}

export interface FeatureToggle {
  key: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  vercelProject: string;
  emoji: string;
  category: string;
  tagline: string;
  tips: Tip[];
  competitors: Competitor[];
  featureToggles: FeatureToggle[];
  accentColor: string;
}

export const SITES: Site[] = [
  // ── Education ────────────────────────────────────────────────
  {
    id: "tutiq",
    name: "Tutiq",
    url: "https://tutiq.app",
    vercelProject: "nudge",
    emoji: "📖",
    category: "Education",
    tagline: "AI-powered tutoring for K-12 students",
    accentColor: "#6366f1",
    tips: [
      { label: "Add subject landing pages for SEO", priority: "high" },
      { label: "Show sample lesson before sign-up (freemium gate)", priority: "high" },
      { label: "Add streak / progress tracker visible on homepage", priority: "medium" },
      { label: "Parent dashboard with child progress email digest", priority: "medium" },
    ],
    competitors: [
      { name: "Khan Academy", url: "https://khanacademy.org", strength: "Free, trusted brand, video library depth" },
      { name: "Chegg", url: "https://chegg.com", strength: "Real tutors on demand, brand recognition" },
      { name: "Photomath", url: "https://photomath.com", strength: "Camera-solve for math, viral hook" },
    ],
    featureToggles: [
      { key: "streak_tracker", label: "Streak Tracker", description: "Show daily learning streak on homepage", defaultOn: true },
      { key: "parent_mode", label: "Parent Mode", description: "Parent view with child progress overview", defaultOn: false },
      { key: "voice_tutor", label: "Voice Tutor", description: "Text-to-speech for lesson content", defaultOn: false },
    ],
  },
  {
    id: "kwizzo",
    name: "Kwizzo",
    url: "https://kwizzo.app",
    vercelProject: "kwizzo",
    emoji: "🎯",
    category: "Education",
    tagline: "Family quiz nights powered by AI",
    accentColor: "#f59e0b",
    tips: [
      { label: "Add shareable quiz result card (viral loop)", priority: "high" },
      { label: "Family leaderboard visible without login", priority: "high" },
      { label: "Weekly family quiz email digest", priority: "medium" },
      { label: "Seasonal quiz packs (Christmas, Diwali)", priority: "low" },
    ],
    competitors: [
      { name: "Kahoot", url: "https://kahoot.com", strength: "Teacher-facing market dominance, school adoption" },
      { name: "Quizlet", url: "https://quizlet.com", strength: "Flashcard+quiz combo, massive student user base" },
      { name: "Trivial Pursuit Digital", url: "https://trivial.com", strength: "Brand legacy, family table game positioning" },
    ],
    featureToggles: [
      { key: "leaderboard", label: "Leaderboard", description: "Public family leaderboard on homepage", defaultOn: true },
      { key: "voice_questions", label: "Voice Q&A", description: "Read questions aloud via TTS", defaultOn: false },
      { key: "seasonal_packs", label: "Seasonal Packs", description: "Seasonal themed quiz collections", defaultOn: true },
    ],
  },
  {
    id: "quizbites",
    name: "QuizBites",
    url: "https://quizbites.app",
    vercelProject: "questly",
    emoji: "⚡",
    category: "Education",
    tagline: "Quick-fire quizzes for curious minds",
    accentColor: "#ec4899",
    tips: [
      { label: "Live classroom join code on homepage", priority: "high" },
      { label: "Teacher dashboard demo video", priority: "medium" },
      { label: "Export results as PDF for teachers", priority: "low" },
    ],
    competitors: [
      { name: "Mentimeter", url: "https://mentimeter.com", strength: "Real-time classroom polling, teacher trust" },
      { name: "Socrative", url: "https://socrative.com", strength: "Teacher-first design, K-12 focus" },
      { name: "Gimkit", url: "https://gimkit.com", strength: "Game economy mechanics, student engagement" },
    ],
    featureToggles: [
      { key: "classroom_mode", label: "Classroom Mode", description: "Real-time multi-player quiz for classrooms", defaultOn: true },
      { key: "pdf_export", label: "PDF Export", description: "Export quiz results as PDF report", defaultOn: false },
      { key: "ai_quiz_gen", label: "AI Quiz Gen", description: "Generate quiz from any topic or URL", defaultOn: true },
    ],
  },
  {
    id: "quizbytesdaily",
    name: "QuizBytes Daily",
    url: "https://quizbytes.dev",
    vercelProject: "quizbytesdaily",
    emoji: "🧠",
    category: "Education",
    tagline: "Daily trivia for developers & tech nerds",
    accentColor: "#10b981",
    tips: [
      { label: "Daily email quiz subscription", priority: "high" },
      { label: "Shareable score card for Twitter/X", priority: "high" },
      { label: "Category landing pages (Python, AI, etc)", priority: "medium" },
    ],
    competitors: [
      { name: "HackerNews Daily", url: "https://hn.algolia.com", strength: "Developer mindshare, organic sharing" },
      { name: "Daily.dev", url: "https://daily.dev", strength: "Dev news feed with streak mechanics" },
      { name: "Duolingo", url: "https://duolingo.com", strength: "Gamification gold standard, daily habit" },
    ],
    featureToggles: [
      { key: "email_digest", label: "Email Digest", description: "Daily quiz email subscription", defaultOn: false },
      { key: "share_card", label: "Share Card", description: "Shareable score image for social", defaultOn: true },
      { key: "streak", label: "Streak Tracking", description: "Daily quiz streak visible on homepage", defaultOn: true },
    ],
  },

  // ── Language ──────────────────────────────────────────────────
  {
    id: "speakiq",
    name: "SpeakIQ",
    url: "https://speakiq.app",
    vercelProject: "language-learning-bot",
    emoji: "🗣️",
    category: "Language",
    tagline: "AI language tutor — speak like a native",
    accentColor: "#8b5cf6",
    tips: [
      { label: "Show language flags + progress on homepage", priority: "high" },
      { label: "Free 5-min demo conversation, no login", priority: "high" },
      { label: "Daily streak notification (push or email)", priority: "medium" },
      { label: "Pronunciation score with audio replay", priority: "medium" },
    ],
    competitors: [
      { name: "Duolingo", url: "https://duolingo.com", strength: "Gamification, 500M users, brand dominant" },
      { name: "Babbel", url: "https://babbel.com", strength: "Structured lessons, proven curriculum" },
      { name: "Pimsleur", url: "https://pimsleur.com", strength: "Audio-first, commuter use case" },
    ],
    featureToggles: [
      { key: "pronunciation_score", label: "Pronunciation Score", description: "Real-time pronunciation feedback with mic", defaultOn: true },
      { key: "streak_widget", label: "Streak Widget", description: "Daily streak counter on dashboard", defaultOn: true },
      { key: "speaking_challenges", label: "Speaking Challenges", description: "Daily 30-second speaking challenges", defaultOn: false },
    ],
  },

  // ── Finance ───────────────────────────────────────────────────
  {
    id: "trackwealth",
    name: "TrackWealth",
    url: "https://trackwealth.app",
    vercelProject: "ai-investment-tracker",
    emoji: "📈",
    category: "Finance",
    tagline: "AI wealth tracker — know where you stand",
    accentColor: "#22c55e",
    tips: [
      { label: "Demo portfolio visible without login", priority: "high" },
      { label: "Market overview widget on homepage", priority: "medium" },
      { label: "Weekly portfolio digest email", priority: "medium" },
    ],
    competitors: [
      { name: "Mint", url: "https://mint.intuit.com", strength: "Budgeting + net worth, Intuit trust" },
      { name: "Monarch Money", url: "https://monarchmoney.com", strength: "Modern fintech UI, couple finance" },
      { name: "Copilot", url: "https://copilot.money", strength: "Apple-first, premium design, iOS native" },
    ],
    featureToggles: [
      { key: "demo_portfolio", label: "Demo Portfolio", description: "Show sample portfolio without login", defaultOn: true },
      { key: "market_ticker", label: "Market Ticker", description: "Live market ticker on homepage", defaultOn: false },
      { key: "ai_insights", label: "AI Insights", description: "AI spending pattern analysis", defaultOn: true },
    ],
  },
  {
    id: "invoicemint",
    name: "InvoiceMint",
    url: "https://invoicemint.cloud",
    vercelProject: "invoice-ai",
    emoji: "🧾",
    category: "Finance",
    tagline: "AI invoice generator for freelancers",
    accentColor: "#f59e0b",
    tips: [
      { label: "Generate invoice without sign-up (hook)", priority: "high" },
      { label: "Download as PDF on first use", priority: "high" },
      { label: "Client portal link on invoice", priority: "medium" },
    ],
    competitors: [
      { name: "FreshBooks", url: "https://freshbooks.com", strength: "Accounting + invoicing suite, accountant trust" },
      { name: "Wave", url: "https://waveapps.com", strength: "Free forever, freelancer beloved" },
      { name: "Bonsai", url: "https://hellobonsai.com", strength: "Contract + invoice combo for freelancers" },
    ],
    featureToggles: [
      { key: "no_auth_generate", label: "No-Auth Generate", description: "Generate invoice without account", defaultOn: true },
      { key: "recurring_invoices", label: "Recurring Invoices", description: "Auto-send recurring invoices", defaultOn: false },
      { key: "stripe_pay", label: "Stripe Pay Link", description: "Add pay-now button via Stripe", defaultOn: false },
    ],
  },

  // ── Travel ────────────────────────────────────────────────────
  {
    id: "roamplan",
    name: "RoamPlan",
    url: "https://roamplan.app",
    vercelProject: "ai-travel-planner",
    emoji: "🌍",
    category: "Travel",
    tagline: "AI travel planner — your trip in 60 seconds",
    accentColor: "#0ea5e9",
    tips: [
      { label: "Generate sample itinerary on homepage (no auth)", priority: "high" },
      { label: "Share itinerary as public link", priority: "high" },
      { label: "Destination inspiration gallery", priority: "low" },
    ],
    competitors: [
      { name: "TripAdvisor", url: "https://tripadvisor.com", strength: "Reviews, trust, 860M listings" },
      { name: "Google Travel", url: "https://travel.google.com", strength: "Flight/hotel integration, zero friction" },
      { name: "Wanderlog", url: "https://wanderlog.com", strength: "Collaborative trip planning, map integration" },
    ],
    featureToggles: [
      { key: "sample_itinerary", label: "Sample Itinerary", description: "Auto-generate sample itinerary on homepage", defaultOn: true },
      { key: "share_link", label: "Share Link", description: "Public shareable itinerary links", defaultOn: false },
      { key: "hotel_search", label: "Hotel Search", description: "Integrated hotel search via affiliate", defaultOn: false },
    ],
  },
  {
    id: "flightbrain",
    name: "FlightBrain",
    url: "https://flightbrain.app",
    vercelProject: "flighttracker",
    emoji: "✈️",
    category: "Travel",
    tagline: "Flight tracker with AI delay prediction",
    accentColor: "#3b82f6",
    tips: [
      { label: "Live flight search on homepage hero", priority: "high" },
      { label: "Flight delay prediction badge", priority: "medium" },
      { label: "Price alert email signup", priority: "medium" },
    ],
    competitors: [
      { name: "FlightAware", url: "https://flightaware.com", strength: "Real-time data authority, API dominance" },
      { name: "Flightradar24", url: "https://flightradar24.com", strength: "Live map, 50M monthly users" },
      { name: "Kayak", url: "https://kayak.com", strength: "Price prediction + booking in one" },
    ],
    featureToggles: [
      { key: "delay_prediction", label: "Delay Prediction", description: "AI delay likelihood score per flight", defaultOn: true },
      { key: "price_alerts", label: "Price Alerts", description: "Email alerts when flight price drops", defaultOn: false },
      { key: "live_map", label: "Live Map", description: "Live flight map on homepage", defaultOn: false },
    ],
  },

  // ── Career ────────────────────────────────────────────────────
  {
    id: "resumevault",
    name: "ResumeVault",
    url: "https://resumevault.app",
    vercelProject: "ai-resume-builder",
    emoji: "📄",
    category: "Career",
    tagline: "ATS-optimised resumes built by AI in 60s",
    accentColor: "#6366f1",
    tips: [
      { label: "Show resume output preview before sign-up", priority: "high" },
      { label: "ATS score badge on generated resumes", priority: "high" },
      { label: "Job-specific resume tailoring feature", priority: "medium" },
    ],
    competitors: [
      { name: "Zety", url: "https://zety.com", strength: "Template variety, SEO dominance, 40M users" },
      { name: "Resume.io", url: "https://resume.io", strength: "Modern templates, clean UX" },
      { name: "Kickresume", url: "https://kickresume.com", strength: "AI + templates + cover letter combo" },
    ],
    featureToggles: [
      { key: "ats_score", label: "ATS Score", description: "Show ATS compatibility score on resume", defaultOn: true },
      { key: "cover_letter", label: "Cover Letter", description: "Auto-generate matching cover letter", defaultOn: true },
      { key: "linkedin_import", label: "LinkedIn Import", description: "Import LinkedIn profile to build resume", defaultOn: false },
    ],
  },
  {
    id: "aijobs",
    name: "AI Jobs Portal",
    url: "https://www.aijobsportal.app",
    vercelProject: "ai-jobs-portal",
    emoji: "💼",
    category: "Career",
    tagline: "Curated AI & ML job listings daily",
    accentColor: "#0ea5e9",
    tips: [
      { label: "Daily job alert email subscription", priority: "high" },
      { label: "Salary range filter + display", priority: "high" },
      { label: "Remote-only toggle on homepage", priority: "medium" },
    ],
    competitors: [
      { name: "LinkedIn Jobs", url: "https://linkedin.com/jobs", strength: "Dominant network effect, recruiter spend" },
      { name: "Otta", url: "https://otta.com", strength: "Curated tech jobs, quality signal" },
      { name: "Wellfound", url: "https://wellfound.com", strength: "Startup-specific, direct founder apply" },
    ],
    featureToggles: [
      { key: "email_alerts", label: "Email Alerts", description: "Daily job alert emails", defaultOn: false },
      { key: "salary_filter", label: "Salary Filter", description: "Filter jobs by salary range", defaultOn: true },
      { key: "remote_only", label: "Remote Only Toggle", description: "One-click remote jobs filter", defaultOn: true },
    ],
  },

  // ── Social / Content ──────────────────────────────────────────
  {
    id: "draftcal",
    name: "DraftCal",
    url: "https://draftcal.app",
    vercelProject: "social-media-calendar",
    emoji: "📅",
    category: "Social",
    tagline: "30 days of social content in 5 minutes",
    accentColor: "#e11d48",
    tips: [
      { label: "Generate 1 week of posts for free, no login", priority: "high" },
      { label: "Platform toggle (Twitter/LinkedIn/Instagram)", priority: "high" },
      { label: "Calendar view of scheduled posts", priority: "medium" },
    ],
    competitors: [
      { name: "Buffer", url: "https://buffer.com", strength: "Scheduling + analytics, creator trust" },
      { name: "Later", url: "https://later.com", strength: "Visual Instagram planner, link-in-bio" },
      { name: "Typefully", url: "https://typefully.com", strength: "Twitter/X native, thread composer" },
    ],
    featureToggles: [
      { key: "no_auth_generate", label: "Free Generate", description: "Generate posts without account", defaultOn: true },
      { key: "platform_preview", label: "Platform Preview", description: "Show how post looks on each platform", defaultOn: true },
      { key: "schedule_connect", label: "Schedule Connect", description: "Connect Buffer/Later for direct scheduling", defaultOn: false },
    ],
  },
  {
    id: "weekendai",
    name: "WeekendAI",
    url: "https://weekendai.app",
    vercelProject: "weekendai",
    emoji: "🌅",
    category: "Social",
    tagline: "AI-curated weekend activity planner",
    accentColor: "#f97316",
    tips: [
      { label: "Location-based weekend suggestions without login", priority: "high" },
      { label: "Share weekend plan as image card", priority: "medium" },
      { label: "Group planning mode (invite friends)", priority: "medium" },
    ],
    competitors: [
      { name: "Tripadvisor (Things to Do)", url: "https://tripadvisor.com", strength: "Reviews + booking, massive inventory" },
      { name: "Eventbrite", url: "https://eventbrite.com", strength: "Event discovery + ticketing" },
      { name: "Yelp", url: "https://yelp.com", strength: "Local reviews, food dominance" },
    ],
    featureToggles: [
      { key: "location_detect", label: "Auto Location", description: "Auto-detect city for local suggestions", defaultOn: true },
      { key: "group_mode", label: "Group Mode", description: "Plan weekends with friends via shared link", defaultOn: false },
      { key: "booking_links", label: "Booking Links", description: "Add affiliate booking links to activities", defaultOn: false },
    ],
  },

  // ── Compliance ────────────────────────────────────────────────
  {
    id: "complyscan",
    name: "ComplyScan",
    url: "https://complyscan.app",
    vercelProject: "complybuddy",
    emoji: "🛡️",
    category: "Compliance",
    tagline: "GDPR & privacy compliance scanner",
    accentColor: "#10b981",
    tips: [
      { label: "Scan any URL without login (hook)", priority: "high" },
      { label: "Compliance score badge embeddable on sites", priority: "medium" },
      { label: "GDPR vs CCPA comparison guide (SEO content)", priority: "medium" },
    ],
    competitors: [
      { name: "Cookiebot", url: "https://cookiebot.com", strength: "Cookie consent market leader, EU trust" },
      { name: "OneTrust", url: "https://onetrust.com", strength: "Enterprise compliance suite, Fortune 500" },
      { name: "Termly", url: "https://termly.io", strength: "SMB compliance + privacy policy generator" },
    ],
    featureToggles: [
      { key: "no_auth_scan", label: "Free Scan", description: "Scan any URL without account", defaultOn: true },
      { key: "embeddable_badge", label: "Compliance Badge", description: "Embeddable score badge for websites", defaultOn: false },
      { key: "pdf_report", label: "PDF Report", description: "Download compliance audit as PDF", defaultOn: false },
    ],
  },

  // ── Developer ─────────────────────────────────────────────────
  {
    id: "agentlogs",
    name: "AgentLogs",
    url: "https://agentlogs.app",
    vercelProject: "agenttrace",
    emoji: "🔍",
    category: "Developer",
    tagline: "Observability for AI agents",
    accentColor: "#00e5ff",
    tips: [
      { label: "NPM package / SDK install CTA above fold", priority: "high" },
      { label: "Live demo trace waterfall on homepage", priority: "high" },
      { label: "GitHub integration (1-click connect)", priority: "medium" },
    ],
    competitors: [
      { name: "LangSmith", url: "https://smith.langchain.com", strength: "LangChain ecosystem lock-in, developer trust" },
      { name: "Helicone", url: "https://helicone.ai", strength: "LLM proxy, zero-code setup, free tier" },
      { name: "Langfuse", url: "https://langfuse.com", strength: "Open source, self-hostable, EU compliance" },
    ],
    featureToggles: [
      { key: "live_demo", label: "Live Demo Trace", description: "Show real-time trace waterfall on homepage", defaultOn: true },
      { key: "github_connect", label: "GitHub Connect", description: "One-click GitHub repo integration", defaultOn: false },
      { key: "slack_alerts", label: "Slack Alerts", description: "Alert on agent errors via Slack webhook", defaultOn: false },
    ],
  },
  {
    id: "clawdbotai",
    name: "ClawdBot AI",
    url: "https://clawdbotai.tech",
    vercelProject: "clawdbotai",
    emoji: "🤖",
    category: "Developer",
    tagline: "Open-source AI projects showcase",
    accentColor: "#a855f7",
    tips: [
      { label: "Chatbot embed widget demo on homepage", priority: "high" },
      { label: "Show project count + tech tags as social proof", priority: "medium" },
      { label: "Submit your project CTA", priority: "medium" },
    ],
    competitors: [
      { name: "Hugging Face Spaces", url: "https://huggingface.co/spaces", strength: "Model demos, ML community hub" },
      { name: "Product Hunt", url: "https://producthunt.com", strength: "Launch platform, press/VC attention" },
      { name: "GitHub Trending", url: "https://github.com/trending", strength: "Developer source of truth, organic" },
    ],
    featureToggles: [
      { key: "project_submissions", label: "Project Submissions", description: "Public submit-your-project form", defaultOn: true },
      { key: "embed_demo", label: "Embed Demo", description: "Embeddable chatbot demo on homepage", defaultOn: true },
      { key: "upvoting", label: "Upvoting", description: "Community upvoting for project ranking", defaultOn: false },
    ],
  },
  {
    id: "protoforge",
    name: "ProtoForge",
    url: "https://protofast.app",
    vercelProject: "protoforge",
    emoji: "🔧",
    category: "Developer",
    tagline: "AI prototype builder for developers",
    accentColor: "#f59e0b",
    tips: [
      { label: "Live prototype preview on homepage", priority: "high" },
      { label: "Template library visible without login", priority: "high" },
      { label: "One-click deploy to Vercel", priority: "medium" },
    ],
    competitors: [
      { name: "v0.dev", url: "https://v0.dev", strength: "Vercel-backed, React component gen, developer darling" },
      { name: "Bolt.new", url: "https://bolt.new", strength: "Full-stack AI builder, StackBlitz runtime" },
      { name: "Lovable", url: "https://lovable.dev", strength: "No-code AI app builder, consumer accessible" },
    ],
    featureToggles: [
      { key: "live_preview", label: "Live Preview", description: "Real-time code preview in browser", defaultOn: true },
      { key: "template_gallery", label: "Template Gallery", description: "Browse templates without login", defaultOn: true },
      { key: "vercel_deploy", label: "Vercel Deploy", description: "One-click Vercel deployment from builder", defaultOn: false },
    ],
  },
  {
    id: "ninjapa",
    name: "NinjaPA",
    url: "https://ninjapa.app",
    vercelProject: "ninjapa",
    emoji: "🥷",
    category: "Developer",
    tagline: "AI personal assistant for productivity",
    accentColor: "#64748b",
    tips: [
      { label: "Demo task automation flow on homepage", priority: "high" },
      { label: "Chrome extension CTA", priority: "high" },
      { label: "Zapier/n8n integration showcase", priority: "medium" },
    ],
    competitors: [
      { name: "Taskade", url: "https://taskade.com", strength: "AI project management, team focus" },
      { name: "Motion", url: "https://usemotion.com", strength: "AI calendar scheduling, calendar-first" },
      { name: "Reclaim.ai", url: "https://reclaim.ai", strength: "Calendar AI + habit scheduling" },
    ],
    featureToggles: [
      { key: "chrome_ext", label: "Chrome Extension", description: "Browser extension for quick task capture", defaultOn: false },
      { key: "integrations", label: "Integrations", description: "Zapier/n8n integration panel", defaultOn: false },
      { key: "voice_input", label: "Voice Input", description: "Voice command task creation", defaultOn: false },
    ],
  },
  {
    id: "clipforge",
    name: "ClipForge AI",
    url: "https://clipforge.ai",
    vercelProject: "clipforge-ai",
    emoji: "✂️",
    category: "Developer",
    tagline: "AI podcast clipping studio",
    accentColor: "#ec4899",
    tips: [
      { label: "Demo clip generation with real podcast audio", priority: "high" },
      { label: "Upload → clip → download in 3 steps above fold", priority: "high" },
      { label: "Captions auto-burn into video clip", priority: "medium" },
    ],
    competitors: [
      { name: "Opus Clip", url: "https://opus.pro", strength: "Viral clip prediction, brand awareness" },
      { name: "Descript", url: "https://descript.com", strength: "Full podcast suite, studio-grade editing" },
      { name: "Podcastle", url: "https://podcastle.ai", strength: "Record + edit + distribute combo" },
    ],
    featureToggles: [
      { key: "auto_captions", label: "Auto Captions", description: "Burn captions into video clips", defaultOn: true },
      { key: "viral_predictor", label: "Viral Score", description: "AI score for clip shareability", defaultOn: false },
      { key: "multi_platform", label: "Multi-Platform", description: "Export in Instagram/TikTok/YouTube formats", defaultOn: true },
    ],
  },

  // ── Gaming ────────────────────────────────────────────────────
  {
    id: "arcadeforge",
    name: "ArcadeForge",
    url: "https://arcadeforge.app",
    vercelProject: "pixelforge",
    emoji: "🕹️",
    category: "Gaming",
    tagline: "Describe a game → AI builds it → play instantly",
    accentColor: "#f59e0b",
    tips: [
      { label: "Playable demo game embedded on homepage", priority: "high" },
      { label: "Game gallery of community-created games", priority: "high" },
      { label: "Prompt → game in 30s demo video", priority: "medium" },
    ],
    competitors: [
      { name: "GameMaker", url: "https://gamemaker.io", strength: "Pro game engine, indie dev trust" },
      { name: "GDevelop", url: "https://gdevelop.io", strength: "No-code game builder, free open source" },
      { name: "Rosebud AI", url: "https://rosebud.ai", strength: "AI game gen pioneer, similar space" },
    ],
    featureToggles: [
      { key: "embedded_demo", label: "Embedded Demo", description: "Playable demo game on homepage", defaultOn: true },
      { key: "game_gallery", label: "Game Gallery", description: "Community game gallery", defaultOn: true },
      { key: "multiplayer", label: "Multiplayer Mode", description: "Real-time multiplayer game sessions", defaultOn: false },
    ],
  },

  // ── Health ────────────────────────────────────────────────────
  {
    id: "myvitals",
    name: "MyVitals",
    url: "https://myvitals.app",
    vercelProject: "health-tracker",
    emoji: "❤️",
    category: "Health",
    tagline: "AI health tracker for vitals & wellness",
    accentColor: "#ef4444",
    tips: [
      { label: "Log first vital without account (hook)", priority: "high" },
      { label: "Health trend chart visible on homepage", priority: "medium" },
      { label: "Doctor-share report PDF export", priority: "medium" },
    ],
    competitors: [
      { name: "Apple Health", url: "https://apple.com/health", strength: "Device integration, privacy trust" },
      { name: "Withings Health Mate", url: "https://withings.com", strength: "Hardware + software combo" },
      { name: "Bearable", url: "https://bearable.app", strength: "Symptom tracking, chronic illness focus" },
    ],
    featureToggles: [
      { key: "no_auth_log", label: "Quick Log", description: "Log vitals without account (local storage)", defaultOn: true },
      { key: "doctor_share", label: "Doctor Share", description: "Generate shareable health report PDF", defaultOn: false },
      { key: "reminders", label: "Reminders", description: "Push notifications for vital logging reminders", defaultOn: false },
    ],
  },
  {
    id: "voicejournal",
    name: "VoiceJournal",
    url: "https://voicejournal.vercel.app",
    vercelProject: "voicejournal",
    emoji: "🎤",
    category: "Health",
    tagline: "Speak your thoughts — AI turns them into journal entries",
    accentColor: "#a78bfa",
    tips: [
      { label: "Record 30s demo entry on homepage without login", priority: "high" },
      { label: "AI emotion detection from voice", priority: "high" },
      { label: "Weekly mood summary email", priority: "medium" },
    ],
    competitors: [
      { name: "Day One", url: "https://dayoneapp.com", strength: "Journaling market leader, Apple trust" },
      { name: "Notion", url: "https://notion.so", strength: "Flexible note-taking, team adoption" },
      { name: "Reflectly", url: "https://reflectly.app", strength: "Mood-guided journaling, AI coaching" },
    ],
    featureToggles: [
      { key: "demo_record", label: "Demo Recording", description: "Try voice recording without account", defaultOn: true },
      { key: "emotion_detect", label: "Emotion Detection", description: "AI detects mood from voice tone", defaultOn: false },
      { key: "mood_summary", label: "Mood Summary", description: "Weekly AI mood summary email", defaultOn: false },
    ],
  },

  // ── Booking / Local ───────────────────────────────────────────
  {
    id: "bookingcall",
    name: "BookingCall",
    url: "https://bookingcall.app",
    vercelProject: "bookingcall",
    emoji: "📞",
    category: "Booking",
    tagline: "AI voice booking agent for local businesses",
    accentColor: "#0ea5e9",
    tips: [
      { label: "Live demo call on homepage (hear the AI)", priority: "high" },
      { label: "Industry templates (salon, dentist, restaurant)", priority: "high" },
      { label: "Show cost savings vs human receptionist", priority: "medium" },
    ],
    competitors: [
      { name: "Bland.ai", url: "https://bland.ai", strength: "Developer-focused voice AI, API-first" },
      { name: "Air.ai", url: "https://air.ai", strength: "Autonomous sales call AI" },
      { name: "Synthflow", url: "https://synthflow.ai", strength: "No-code voice agent builder" },
    ],
    featureToggles: [
      { key: "demo_call", label: "Demo Call", description: "Live AI voice call demo on homepage", defaultOn: false },
      { key: "industry_templates", label: "Industry Templates", description: "Pre-built scripts for salon/dental/restaurant", defaultOn: true },
      { key: "sms_followup", label: "SMS Follow-up", description: "Auto SMS confirmation after AI booking", defaultOn: false },
    ],
  },
  {
    id: "rideflow",
    name: "RideFlow",
    url: "https://rideflow.app",
    vercelProject: "rideflow",
    emoji: "🚗",
    category: "Booking",
    tagline: "AI route optimizer for drivers & couriers",
    accentColor: "#f59e0b",
    tips: [
      { label: "Map demo visible on homepage without login", priority: "high" },
      { label: "Multi-stop route demo with stops input", priority: "high" },
      { label: "Delivery driver vs ride-share positioning split", priority: "medium" },
    ],
    competitors: [
      { name: "Route4Me", url: "https://route4me.com", strength: "Enterprise route optimization, logistics market" },
      { name: "OptimoRoute", url: "https://optimoroute.com", strength: "Delivery-specific, field service" },
      { name: "Google Maps", url: "https://maps.google.com", strength: "Zero friction, dominant default" },
    ],
    featureToggles: [
      { key: "map_demo", label: "Map Demo", description: "Interactive route demo on homepage", defaultOn: false },
      { key: "driver_app", label: "Driver App Link", description: "Mobile app download CTA", defaultOn: false },
      { key: "fleet_mode", label: "Fleet Mode", description: "Multi-driver fleet management view", defaultOn: false },
    ],
  },
  {
    id: "meetscribe",
    name: "MeetScribe",
    url: "https://meetscribe.app",
    vercelProject: "meetscribe",
    emoji: "📝",
    category: "Booking",
    tagline: "AI meeting notes & action items",
    accentColor: "#6366f1",
    tips: [
      { label: "Paste meeting transcript → get summary demo", priority: "high" },
      { label: "Zoom/Google Meet integration CTA", priority: "high" },
      { label: "Action items auto-assigned to team members", priority: "medium" },
    ],
    competitors: [
      { name: "Otter.ai", url: "https://otter.ai", strength: "Transcription market leader, Zoom plugin" },
      { name: "Fireflies.ai", url: "https://fireflies.ai", strength: "CRM sync + analytics, sales-focused" },
      { name: "Fathom", url: "https://fathom.video", strength: "Free forever, Zoom native, viral growth" },
    ],
    featureToggles: [
      { key: "paste_demo", label: "Paste Demo", description: "Try with pasted transcript, no login", defaultOn: true },
      { key: "zoom_connect", label: "Zoom Connect", description: "Auto-join and transcribe Zoom meetings", defaultOn: false },
      { key: "crm_sync", label: "CRM Sync", description: "Push action items to Salesforce/HubSpot", defaultOn: false },
    ],
  },

  // ── News ──────────────────────────────────────────────────────
  {
    id: "nammatamil",
    name: "NammaTamil",
    url: "https://nammatamil.live",
    vercelProject: "nammatamil",
    emoji: "🎙️",
    category: "News",
    tagline: "Tamil news, cricket & entertainment",
    accentColor: "#ef4444",
    tips: [
      { label: "Breaking news ticker above fold", priority: "high" },
      { label: "Cricket score widget (live during matches)", priority: "high" },
      { label: "WhatsApp share button on articles", priority: "medium" },
    ],
    competitors: [
      { name: "Dinamalar", url: "https://dinamalar.com", strength: "Tamil news authority, print legacy" },
      { name: "Vikatan", url: "https://vikatan.com", strength: "Magazine + digital, investigative trust" },
      { name: "Sun TV Digital", url: "https://suntv.com", strength: "TV + digital + streaming combo" },
    ],
    featureToggles: [
      { key: "breaking_ticker", label: "Breaking Ticker", description: "Live breaking news ticker at top", defaultOn: true },
      { key: "cricket_widget", label: "Cricket Widget", description: "Live cricket scores widget", defaultOn: true },
      { key: "whatsapp_share", label: "WhatsApp Share", description: "Share articles via WhatsApp button", defaultOn: true },
    ],
  },
  {
    id: "worldtrends",
    name: "WorldTrends",
    url: "https://worldtrends.today",
    vercelProject: "worldtrends",
    emoji: "🌐",
    category: "News",
    tagline: "Real-time global trending topics",
    accentColor: "#3b82f6",
    tips: [
      { label: "Auto-refresh trending topics every 5 min", priority: "high" },
      { label: "Region filter (Americas / Europe / Asia)", priority: "medium" },
      { label: "Share trending topic as image card", priority: "medium" },
    ],
    competitors: [
      { name: "Google Trends", url: "https://trends.google.com", strength: "Data authority, zero competition" },
      { name: "Exploding Topics", url: "https://explodingtopics.com", strength: "Emerging trends focus, B2B angle" },
      { name: "Twitter Trending", url: "https://twitter.com", strength: "Real-time social signal, source of truth" },
    ],
    featureToggles: [
      { key: "auto_refresh", label: "Auto Refresh", description: "Auto-refresh trends every 5 minutes", defaultOn: true },
      { key: "region_filter", label: "Region Filter", description: "Filter by geographic region", defaultOn: false },
      { key: "share_card", label: "Share Card", description: "Share trend as image card", defaultOn: false },
    ],
  },
  {
    id: "quicktech",
    name: "QuickTech AI",
    url: "https://quicktechai.app",
    vercelProject: "quicktech",
    emoji: "⚙️",
    category: "News",
    tagline: "AI-summarised tech news in 60 seconds",
    accentColor: "#6366f1",
    tips: [
      { label: "AI summary badge on every article", priority: "high" },
      { label: "Newsletter signup with daily digest", priority: "medium" },
      { label: "YouTube CTA linking @QuickTechAIPro", priority: "medium" },
    ],
    competitors: [
      { name: "TechCrunch", url: "https://techcrunch.com", strength: "Breaking tech news authority, VC coverage" },
      { name: "The Verge", url: "https://theverge.com", strength: "Consumer tech focus, strong brand" },
      { name: "TLDR Newsletter", url: "https://tldr.tech", strength: "Dev-focused daily digest, 1M+ subscribers" },
    ],
    featureToggles: [
      { key: "ai_summaries", label: "AI Summaries", description: "One-line AI summary on every article", defaultOn: true },
      { key: "newsletter", label: "Newsletter", description: "Daily tech digest email subscription", defaultOn: false },
      { key: "youtube_cta", label: "YouTube CTA", description: "Link to YouTube channel from articles", defaultOn: false },
    ],
  },

  // ── Agriculture ───────────────────────────────────────────────
  {
    id: "mandirates",
    name: "MandiRates",
    url: "https://mandirates.app",
    vercelProject: "agriprice-india",
    emoji: "🌾",
    category: "Agriculture",
    tagline: "Live mandi prices for Indian farmers",
    accentColor: "#84cc16",
    tips: [
      { label: "State/commodity filter above fold", priority: "high" },
      { label: "SMS price alert for farmers (low-tech hook)", priority: "high" },
      { label: "MSP vs market price comparison badge", priority: "medium" },
    ],
    competitors: [
      { name: "AgriMarket (Govt)", url: "https://agrimarket.nic.in", strength: "Official data source, trusted by govt" },
      { name: "Kisan Suvidha", url: "https://kisansuvidha.gov.in", strength: "Govt app, WhatsApp bot" },
      { name: "DeHaat", url: "https://dehaat.com", strength: "Full agri-tech suite, funding/scale" },
    ],
    featureToggles: [
      { key: "sms_alerts", label: "SMS Alerts", description: "SMS price alerts for farmers (basic phone)", defaultOn: false },
      { key: "msp_compare", label: "MSP Compare", description: "Compare live price vs MSP", defaultOn: true },
      { key: "hindi_ui", label: "Hindi UI", description: "Switch UI language to Hindi", defaultOn: false },
    ],
  },

  // ── Video ─────────────────────────────────────────────────────
  {
    id: "vidrush",
    name: "Vidrush",
    url: "https://vidrush.app",
    vercelProject: "vidrush",
    emoji: "🎬",
    category: "AI Tools",
    tagline: "Text to video in seconds — powered by Kling AI",
    accentColor: "#e879f9",
    tips: [
      { label: "Show generated video examples above fold", priority: "high" },
      { label: "Free 2 videos/day — no account needed", priority: "high" },
      { label: "Prompt enhancer makes any prompt cinematic", priority: "medium" },
    ],
    competitors: [
      { name: "Runway", url: "https://runwayml.com", strength: "Gen-2 + Gen-3, creative professional trust" },
      { name: "Sora", url: "https://sora.com", strength: "OpenAI brand, highest quality" },
      { name: "Kling AI", url: "https://klingai.com", strength: "Fast, cheap, good quality — our backend" },
    ],
    featureToggles: [
      { key: "prompt_enhancer", label: "Prompt Enhancer", description: "AI improves your prompt before generating", defaultOn: true },
      { key: "gallery", label: "Public Gallery", description: "Community gallery of generated videos", defaultOn: false },
      { key: "hd_mode", label: "HD Mode", description: "Generate in 1080p (Pro only)", defaultOn: false },
    ],
  },

  // ── AI Platform ───────────────────────────────────────────────
  {
    id: "neuralos",
    name: "NeuralOS",
    url: "https://neuralagent.app",
    vercelProject: "neuralos",
    emoji: "🧬",
    category: "AI Platform",
    tagline: "Your personal AI operating system",
    accentColor: "#a855f7",
    tips: [
      { label: "Agent demo running live on homepage", priority: "high" },
      { label: "Template gallery (pre-built agent flows)", priority: "high" },
      { label: "Pricing page with clear free tier limits", priority: "medium" },
    ],
    competitors: [
      { name: "ChatGPT", url: "https://chatgpt.com", strength: "100M+ users, brand dominance, GPT store" },
      { name: "Claude.ai", url: "https://claude.ai", strength: "Long context, coding trust, enterprise" },
      { name: "Zapier Central", url: "https://zapier.com/central", strength: "Automation + AI combo, 5M+ users" },
    ],
    featureToggles: [
      { key: "live_agent_demo", label: "Live Agent Demo", description: "Running agent demo on homepage", defaultOn: false },
      { key: "template_gallery", label: "Template Gallery", description: "Pre-built agent flow templates", defaultOn: true },
      { key: "voice_interface", label: "Voice Interface", description: "Voice command interface for agents", defaultOn: false },
    ],
  },
  {
    id: "aicoachlab",
    name: "AICoachLab",
    url: "https://aicoachlab.app",
    vercelProject: "aicoachlab",
    emoji: "🎓",
    category: "AI Platform",
    tagline: "AI coaching for skills, habits & goals",
    accentColor: "#f59e0b",
    tips: [
      { label: "Free coaching session demo without login", priority: "high" },
      { label: "Show transformation stories (before/after goals)", priority: "high" },
      { label: "Voice coach mode (talk to AI coach)", priority: "medium" },
    ],
    competitors: [
      { name: "BetterUp", url: "https://betterup.com", strength: "Enterprise coaching, HR trusted, funded" },
      { name: "Noom", url: "https://noom.com", strength: "Health coaching + behavioral science" },
      { name: "Rocky.ai", url: "https://rocky.ai", strength: "AI performance coaching, OKR-linked" },
    ],
    featureToggles: [
      { key: "demo_session", label: "Demo Session", description: "Try AI coaching without account", defaultOn: true },
      { key: "voice_coach", label: "Voice Coach", description: "Speak with AI coach via microphone", defaultOn: false },
      { key: "goal_tracking", label: "Goal Tracking", description: "Track progress towards stated goals", defaultOn: true },
    ],
  },
  {
    id: "zerostaff",
    name: "ZeroStaff",
    url: "https://zerostaff.app",
    vercelProject: "zerostaff",
    emoji: "⚡",
    category: "AI Platform",
    tagline: "AI automation agency — hire AI, not staff",
    accentColor: "#6366f1",
    tips: [
      { label: "Live workflow demo running on homepage", priority: "high" },
      { label: "ROI calculator (cost saved vs hiring 1 employee)", priority: "high" },
      { label: "Case study: real workflow with real output", priority: "medium" },
    ],
    competitors: [
      { name: "Zapier", url: "https://zapier.com", strength: "5M+ users, 6000 integrations, automation standard" },
      { name: "Make (Integromat)", url: "https://make.com", strength: "Visual builder, power-user favorite" },
      { name: "n8n", url: "https://n8n.io", strength: "Open source, self-host, dev trusted" },
    ],
    featureToggles: [
      { key: "workflow_demo", label: "Workflow Demo", description: "Live automation workflow on homepage", defaultOn: false },
      { key: "roi_calc", label: "ROI Calculator", description: "Savings calculator vs hiring staff", defaultOn: false },
      { key: "case_studies", label: "Case Studies", description: "Real automation case studies visible", defaultOn: false },
    ],
  },

  // ── AI Tools ─────────────────────────────────────────────────
  {
    id: "pdfideas",
    name: "PDFIdeas",
    url: "https://pdfideas.vercel.app",
    // TODO: needs custom domain pdfideas.app
    vercelProject: "pdfideas",
    emoji: "📄",
    category: "AI Tools",
    tagline: "AI-powered PDF guide ideas you can sell on Gumroad today",
    accentColor: "#8b5cf6",
    tips: [
      { label: "Add custom domain (pdfideas.app or similar)", priority: "high" },
      { label: "Show sample generated ideas without auth", priority: "high" },
      { label: "Add Gumroad integration to publish directly", priority: "medium" },
      { label: "Niche landing pages for each PDF category", priority: "medium" },
    ],
    competitors: [
      { name: "Canva", url: "https://canva.com", strength: "Design + export, massive user base" },
      { name: "Designrr", url: "https://designrr.io", strength: "PDF/ebook generator, established product" },
      { name: "Beacon", url: "https://beacon.by", strength: "Lead magnet PDFs, freemium model" },
    ],
    featureToggles: [
      { key: "idea_preview", label: "Idea Preview", description: "Show 3 sample ideas without login", defaultOn: true },
      { key: "gumroad_export", label: "Gumroad Export", description: "One-click publish to Gumroad", defaultOn: false },
      { key: "bulk_generate", label: "Bulk Generate", description: "Generate 10 ideas at once (Pro)", defaultOn: false },
    ],
  },
  {
    id: "parceliq",
    name: "ParcelIQ",
    url: "https://parceliq.app",
    vercelProject: "parceliq",
    emoji: "📦",
    category: "AI Tools",
    tagline: "AI-powered UK parcel shipping price comparison",
    accentColor: "#0ea5e9",
    tips: [
      { label: "Add carrier affiliate links for revenue", priority: "high" },
      { label: "Show price table prominently above fold", priority: "high" },
      { label: "Add bulk shipment comparison (business tier)", priority: "medium" },
      { label: "Email alert when carrier prices drop", priority: "low" },
    ],
    competitors: [
      { name: "Parcel2Go", url: "https://parcel2go.com", strength: "UK market leader, booking integrated" },
      { name: "Shiply", url: "https://shiply.com", strength: "Reverse auction, courier bidding" },
      { name: "Interparcel", url: "https://interparcel.com", strength: "Multi-carrier comparison, established" },
    ],
    featureToggles: [
      { key: "affiliate_links", label: "Affiliate Links", description: "Carrier affiliate links on results", defaultOn: true },
      { key: "bulk_compare", label: "Bulk Compare", description: "Compare multiple parcels at once", defaultOn: false },
      { key: "price_alerts", label: "Price Alerts", description: "Email alerts for price drops", defaultOn: false },
    ],
  },
  {
    id: "homecanvas",
    name: "HomeCanvas",
    url: "https://homecanvas.vercel.app",
    vercelProject: "homecanvas",
    emoji: "🏠",
    category: "Marketplace",
    tagline: "AI-matched home services — cleaners, carers, handymen",
    accentColor: "#8b5cf6",
    tips: [
      { label: "Wire actual booking flow end-to-end", priority: "high" },
      { label: "Add provider onboarding signup", priority: "high" },
      { label: "Show real local providers if Supabase is live", priority: "medium" },
      { label: "Add trust badges and insurance verification", priority: "medium" },
    ],
    competitors: [
      { name: "Taskrabbit", url: "https://taskrabbit.com", strength: "Global brand, IKEA partnership" },
      { name: "Bark", url: "https://bark.com", strength: "UK leader for local services" },
      { name: "Checkatrade", url: "https://checkatrade.com", strength: "UK vetted tradespeople, trusted brand" },
    ],
    featureToggles: [
      { key: "booking_flow", label: "Booking Flow", description: "End-to-end booking with Stripe", defaultOn: false },
      { key: "provider_signup", label: "Provider Signup", description: "Provider onboarding form", defaultOn: false },
      { key: "ai_matching", label: "AI Matching", description: "AI-powered provider recommendation", defaultOn: true },
    ],
  },
  {
    id: "replydesk",
    name: "ReplyDesk",
    url: "https://invoicemint.cloud",
    vercelProject: "replydesk",
    emoji: "💬",
    category: "AI Tools",
    tagline: "AI-powered customer support desk",
    accentColor: "#06b6d4",
    tips: [
      { label: "Add custom domain (replydesk.app)", priority: "high" },
      { label: "Show live demo with sample support tickets", priority: "high" },
      { label: "Add Shopify / WooCommerce integration", priority: "medium" },
      { label: "Auto-draft replies with one-click send", priority: "medium" },
    ],
    competitors: [
      { name: "Intercom", url: "https://intercom.com", strength: "Market leader, AI Fin bot" },
      { name: "Freshdesk", url: "https://freshdesk.com", strength: "Free tier, SMB dominant" },
      { name: "Tidio", url: "https://tidio.com", strength: "Shopify-native, e-commerce focus" },
    ],
    featureToggles: [
      { key: "live_demo", label: "Live Demo", description: "Interactive support ticket demo on homepage", defaultOn: false },
      { key: "shopify_widget", label: "Shopify Widget", description: "Shopify app integration", defaultOn: false },
      { key: "auto_draft", label: "Auto Draft", description: "AI auto-drafts reply on ticket arrival", defaultOn: true },
    ],
  },
  {
    id: "campaignforge",
    name: "CampaignForge",
    url: "https://campaignforge.vercel.app",
    vercelProject: "campaignforge",
    emoji: "🚀",
    category: "AI Tools",
    tagline: "One brief → blog + podcast + video + LinkedIn + emails in 90 seconds",
    accentColor: "#f97316",
    tips: [
      { label: "Add custom domain (campaignforge.app)", priority: "high" },
      { label: "Show live output generation on homepage", priority: "high" },
      { label: "Add downloadable ZIP of all outputs", priority: "medium" },
      { label: "Client white-label report export (Pro)", priority: "medium" },
    ],
    competitors: [
      { name: "Jasper", url: "https://jasper.ai", strength: "$1.5B valuation, brand templates, enterprise" },
      { name: "Copy.ai", url: "https://copy.ai", strength: "Team workflows, 10M+ users" },
      { name: "Writesonic", url: "https://writesonic.com", strength: "SEO-focused, Surfer integration" },
    ],
    featureToggles: [
      { key: "live_preview", label: "Live Preview", description: "Animate content generation on homepage", defaultOn: true },
      { key: "zip_export", label: "ZIP Export", description: "Download all outputs as ZIP", defaultOn: false },
      { key: "white_label", label: "White Label", description: "Client-ready report with custom branding", defaultOn: false },
    ],
  },
  {
    id: "agencyos",
    name: "AgencyOS",
    url: "https://agencyos.vercel.app",
    vercelProject: "agencyos",
    emoji: "🏢",
    category: "AI Tools",
    tagline: "Run a full AI agency with zero employees — 7 outputs from one brief",
    accentColor: "#ec4899",
    tips: [
      { label: "Add custom domain (agencyos.app)", priority: "high" },
      { label: "Differentiate from CampaignForge clearly", priority: "high" },
      { label: "Add client portal for sharing outputs", priority: "medium" },
      { label: "Subscription tier with unlimited briefs", priority: "medium" },
    ],
    competitors: [
      { name: "Jasper", url: "https://jasper.ai", strength: "$1.5B valuation, enterprise brand" },
      { name: "Lately", url: "https://lately.ai", strength: "Social repurposing, analytics integration" },
      { name: "Predis", url: "https://predis.ai", strength: "Social + video, strong visuals" },
    ],
    featureToggles: [
      { key: "client_portal", label: "Client Portal", description: "Shareable output links for clients", defaultOn: false },
      { key: "unlimited_mode", label: "Unlimited Mode", description: "No brief limit for Pro subscribers", defaultOn: false },
      { key: "brand_kit", label: "Brand Kit", description: "Apply client brand colors/fonts to outputs", defaultOn: false },
    ],
  },
];

export const CATEGORIES = [...new Set(SITES.map((s) => s.category))].sort();
