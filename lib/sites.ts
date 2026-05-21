export type SiteStatus = "up" | "down" | "unknown";
export type Priority = "high" | "medium" | "low";

export interface Tip {
  label: string;
  priority: Priority;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  vercelProject: string; // Vercel project name for Analytics API
  emoji: string;
  category: string;
  tips: Tip[];
}

export const SITES: Site[] = [
  // Education
  {
    id: "tutiq",
    name: "Tutiq",
    url: "https://tutiq.app",
    vercelProject: "nudge",
    emoji: "📖",
    category: "Education",
    tips: [
      { label: "Add subject landing pages for SEO", priority: "high" },
      { label: "Show sample lesson before sign-up (freemium gate)", priority: "high" },
      { label: "Add streak / progress tracker", priority: "medium" },
    ],
  },
  {
    id: "kwizzo",
    name: "Kwizzo",
    url: "https://kwizzo.app",
    vercelProject: "kwizzo",
    emoji: "🎯",
    category: "Education",
    tips: [
      { label: "Add shareable quiz result card (viral loop)", priority: "high" },
      { label: "Family leaderboard visible without login", priority: "high" },
      { label: "Weekly family quiz email digest", priority: "medium" },
    ],
  },
  {
    id: "quizbites",
    name: "QuizBites",
    url: "https://quizbites.app",
    vercelProject: "questly",
    emoji: "⚡",
    category: "Education",
    tips: [
      { label: "Live classroom join code on homepage", priority: "high" },
      { label: "Teacher dashboard demo video", priority: "medium" },
      { label: "Export results as PDF for teachers", priority: "low" },
    ],
  },
  {
    id: "quizbytesdaily",
    name: "QuizBytes Daily",
    url: "https://quizbytes.dev",
    vercelProject: "quizbytesdaily",
    emoji: "🧠",
    category: "Education",
    tips: [
      { label: "Daily email quiz subscription", priority: "high" },
      { label: "Shareable score card for Twitter/X", priority: "high" },
      { label: "Category landing pages (Python, AI, etc)", priority: "medium" },
    ],
  },
  // Language
  {
    id: "speakiq",
    name: "SpeakIQ",
    url: "https://speakiq.app",
    vercelProject: "language-learning-bot",
    emoji: "🗣️",
    category: "Language",
    tips: [
      { label: "Show language flags + progress on homepage", priority: "high" },
      { label: "Free 5-min demo conversation, no login", priority: "high" },
      { label: "Daily streak notification (push or email)", priority: "medium" },
    ],
  },
  // Finance
  {
    id: "trackwealth",
    name: "TrackWealth",
    url: "https://trackwealth.app",
    vercelProject: "ai-investment-tracker",
    emoji: "📈",
    category: "Finance",
    tips: [
      { label: "Demo portfolio visible without login", priority: "high" },
      { label: "Market overview widget on homepage", priority: "medium" },
      { label: "Weekly portfolio digest email", priority: "medium" },
    ],
  },
  // Travel
  {
    id: "roamplan",
    name: "RoamPlan",
    url: "https://roamplan.app",
    vercelProject: "ai-travel-planner",
    emoji: "🌍",
    category: "Travel",
    tips: [
      { label: "Generate sample itinerary on homepage (no auth)", priority: "high" },
      { label: "Share itinerary as public link", priority: "high" },
      { label: "Destination inspiration gallery", priority: "low" },
    ],
  },
  {
    id: "flightbrain",
    name: "FlightBrain",
    url: "https://flightbrain.app",
    vercelProject: "flighttracker",
    emoji: "✈️",
    category: "Travel",
    tips: [
      { label: "Live flight search on homepage hero", priority: "high" },
      { label: "Flight delay prediction badge", priority: "medium" },
      { label: "Price alert email signup", priority: "medium" },
    ],
  },
  // Career
  {
    id: "resumevault",
    name: "ResumeVault",
    url: "https://resumevault.app",
    vercelProject: "ai-resume-builder",
    emoji: "📄",
    category: "Career",
    tips: [
      { label: "Show resume output preview before sign-up", priority: "high" },
      { label: "ATS score badge on generated resumes", priority: "high" },
      { label: "Job-specific resume tailoring feature", priority: "medium" },
    ],
  },
  {
    id: "aijobs",
    name: "AI Jobs Portal",
    url: "https://www.aijobsportal.app",
    vercelProject: "ai-jobs-portal",
    emoji: "💼",
    category: "Career",
    tips: [
      { label: "Daily job alert email subscription", priority: "high" },
      { label: "Salary range filter + display", priority: "high" },
      { label: "Remote-only toggle on homepage", priority: "medium" },
    ],
  },
  // Social
  {
    id: "draftcal",
    name: "DraftCal",
    url: "https://draftcal.app",
    vercelProject: "social-media-calendar",
    emoji: "📅",
    category: "Social",
    tips: [
      { label: "Generate 1 week of posts for free, no login", priority: "high" },
      { label: "Platform toggle (Twitter/LinkedIn/Instagram)", priority: "high" },
      { label: "Calendar view of scheduled posts", priority: "medium" },
    ],
  },
  // Compliance
  {
    id: "complyscan",
    name: "ComplyScan",
    url: "https://complyscan.app",
    vercelProject: "complybuddy",
    emoji: "🛡️",
    category: "Compliance",
    tips: [
      { label: "Scan any URL without login (hook)", priority: "high" },
      { label: "Compliance score badge embeddable on sites", priority: "medium" },
      { label: "GDPR vs CCPA comparison guide (SEO content)", priority: "medium" },
    ],
  },
  // Developer
  {
    id: "agentlogs",
    name: "AgentLogs",
    url: "https://agentlogs.app",
    vercelProject: "agenttrace",
    emoji: "🔍",
    category: "Developer",
    tips: [
      { label: "NPM package / SDK install CTA above fold", priority: "high" },
      { label: "Live demo trace waterfall on homepage", priority: "high" },
      { label: "GitHub integration (1-click connect)", priority: "medium" },
    ],
  },
  {
    id: "clawdbotai",
    name: "ClawdBot AI",
    url: "https://clawdbotai.tech",
    vercelProject: "clawdbotai",
    emoji: "🤖",
    category: "Developer",
    tips: [
      { label: "Chatbot embed widget demo on homepage", priority: "high" },
      { label: "Show project count + tech tags as social proof", priority: "medium" },
      { label: "Submit your project CTA", priority: "medium" },
    ],
  },
  // Gaming
  {
    id: "arcadeforge",
    name: "ArcadeForge",
    url: "https://arcadeforge.app",
    vercelProject: "pixelforge",
    emoji: "🕹️",
    category: "Gaming",
    tips: [
      { label: "Playable demo game embedded on homepage", priority: "high" },
      { label: "Game gallery of community-created games", priority: "high" },
      { label: "Prompt → game in 30s demo video", priority: "medium" },
    ],
  },
  // News
  {
    id: "nammatamil",
    name: "NammaTamil",
    url: "https://nammatamil.live",
    vercelProject: "nammatamil",
    emoji: "🎙️",
    category: "News",
    tips: [
      { label: "Breaking news ticker above fold", priority: "high" },
      { label: "Cricket score widget (live during matches)", priority: "high" },
      { label: "WhatsApp share button on articles", priority: "medium" },
    ],
  },
  {
    id: "worldtrends",
    name: "WorldTrends",
    url: "https://worldtrends.today",
    vercelProject: "worldtrends",
    emoji: "🌐",
    category: "News",
    tips: [
      { label: "Auto-refresh trending topics every 5 min", priority: "high" },
      { label: "Region filter (Americas / Europe / Asia)", priority: "medium" },
      { label: "Share trending topic as image card", priority: "medium" },
    ],
  },
  {
    id: "quicktech",
    name: "QuickTech AI",
    url: "https://quicktechai.app",
    vercelProject: "quicktech",
    emoji: "⚙️",
    category: "News",
    tips: [
      { label: "AI summary badge on every article", priority: "high" },
      { label: "Newsletter signup with daily digest", priority: "medium" },
      { label: "YouTube CTA linking @QuickTechAIPro", priority: "medium" },
    ],
  },
  // Health
  {
    id: "myvitals",
    name: "MyVitals",
    url: "https://myvitals.app",
    vercelProject: "health-tracker",
    emoji: "❤️",
    category: "Health",
    tips: [
      { label: "Log first vital without account (hook)", priority: "high" },
      { label: "Health trend chart visible on homepage", priority: "medium" },
      { label: "Doctor-share report PDF export", priority: "medium" },
    ],
  },
  // Agriculture
  {
    id: "mandirates",
    name: "MandiRates",
    url: "https://mandirates.app",
    vercelProject: "agriprice-india",
    emoji: "🌾",
    category: "Agriculture",
    tips: [
      { label: "State/commodity filter above fold", priority: "high" },
      { label: "SMS price alert for farmers (low-tech hook)", priority: "high" },
      { label: "MSP vs market price comparison badge", priority: "medium" },
    ],
  },
  // AI/SaaS
  {
    id: "neuralos",
    name: "NeuralOS",
    url: "https://neuralagent.app",
    vercelProject: "neuralos",
    emoji: "🧬",
    category: "AI Platform",
    tips: [
      { label: "Agent demo running live on homepage", priority: "high" },
      { label: "Template gallery (pre-built agent flows)", priority: "high" },
      { label: "Pricing page with clear free tier limits", priority: "medium" },
    ],
  },
  {
    id: "invoicemint",
    name: "InvoiceMint",
    url: "https://invoicemint.cloud",
    vercelProject: "invoice-ai",
    emoji: "🧾",
    category: "Finance",
    tips: [
      { label: "Generate invoice without sign-up (hook)", priority: "high" },
      { label: "Download as PDF on first use", priority: "high" },
      { label: "Client portal link on invoice", priority: "medium" },
    ],
  },
  {
    id: "protoforge",
    name: "ProtoForge",
    url: "https://protofast.app",
    vercelProject: "protoforge",
    emoji: "🔧",
    category: "Developer",
    tips: [
      { label: "Live prototype preview on homepage", priority: "high" },
      { label: "Template library visible without login", priority: "high" },
      { label: "One-click deploy to Vercel", priority: "medium" },
    ],
  },
];

export const CATEGORIES = [...new Set(SITES.map((s) => s.category))].sort();
