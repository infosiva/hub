// Single source of truth for marketing post platforms — shared by the
// /marketing page (picker UI) and /api/marketing (AI generation prompts).
// Add a new platform by adding one entry here — no other file needs to change.

export interface MarketingPlatform {
  id: string;
  label: string;
  emoji: string;
  // Instructions appended to the AI prompt to shape output for this platform.
  aiPrompt: string;
  // true if page.tsx has a hand-written instant template generator for this
  // platform (only wired for the curated product set); AI generation works
  // for every platform regardless of this flag.
  hasTemplate?: boolean;
}

export const MARKETING_PLATFORMS: MarketingPlatform[] = [
  {
    id: "reddit-post",
    label: "Reddit Post",
    emoji: "📢",
    hasTemplate: true,
    aiPrompt:
      "Write a Reddit self-post for a relevant subreddit: a plain, non-salesy title and a body (4-8 sentences) written like a real person sharing a tool they built, not an ad. Mention it's free/self-serve where true. No emoji, no hashtags.",
  },
  {
    id: "reddit-comment",
    label: "Reddit Comment",
    emoji: "💬",
    hasTemplate: true,
    aiPrompt:
      "Write a short Reddit comment (2-4 sentences) mentioning this product as a helpful reply to someone asking for a tool like it — not a top-level post. Sound like a real user, not an ad. No emoji, no hashtags.",
  },
  {
    id: "producthunt",
    label: "ProductHunt",
    emoji: "🚀",
    hasTemplate: true,
    aiPrompt:
      "Write a Product Hunt launch post: a punchy tagline (under 60 chars) and a maker comment (3-5 short paragraphs, first person, explain why you built it and what makes it different). No hashtags.",
  },
  {
    id: "directory",
    label: "Directory Submit",
    emoji: "📋",
    hasTemplate: true,
    aiPrompt:
      "Write a directory-submission blurb: one-line tagline (under 80 chars) and a 2-3 sentence description suitable for pasting into a 'submit your tool' form.",
  },
  {
    id: "tweet",
    label: "Twitter/X Thread",
    emoji: "🐦",
    hasTemplate: true,
    aiPrompt:
      "Write a Twitter/X launch thread: 3 tweets. Tweet 1 is the hook (under 280 chars). Tweet 2 explains the core feature. Tweet 3 is the CTA with the URL. Separate tweets with a line containing only '---'.",
  },
  {
    id: "linkedin",
    label: "LinkedIn Post",
    emoji: "💼",
    aiPrompt:
      "Write a LinkedIn post: professional but not corporate, 3-5 short paragraphs, tell a brief story about the problem this solves, end with a soft CTA and the URL. No hashtag spam — at most 3 relevant hashtags at the end.",
  },
  {
    id: "hackernews",
    label: "Hacker News (Show HN)",
    emoji: "🟠",
    aiPrompt:
      "Write a 'Show HN' post: a title in the exact format 'Show HN: <Product> – <one-line description>' (under 80 chars total) and a body (2-4 short paragraphs) written plainly for a technical audience — explain what it does, what it's built with if notable, and why you built it. No marketing fluff, no emoji.",
  },
  {
    id: "indiehackers",
    label: "IndieHackers",
    emoji: "🛠️",
    aiPrompt:
      "Write an IndieHackers milestone/launch post: a title and a body (4-6 short paragraphs) sharing the build story, the problem it solves, and an honest ask (feedback, first users, or a specific question). Indie-builder tone, not corporate.",
  },
];

export function getPlatform(id: string): MarketingPlatform | undefined {
  return MARKETING_PLATFORMS.find(p => p.id === id);
}
