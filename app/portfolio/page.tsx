import type { Metadata } from "next";
import Image from "next/image";
import { existsSync } from "fs";
import { join } from "path";
import { SITES, CATEGORIES } from "@/lib/sites";

function hasScreenshot(id: string) {
  return existsSync(join(process.cwd(), "public", "screenshots", `${id}-mobile.jpg`));
}

export const metadata: Metadata = {
  title: "Siva — AI Product Portfolio | 50+ AI Apps Built Solo",
  description:
    "Solo founder building 50+ AI-powered web products — education, finance, travel, health, dev tools, and more. Every product designed, built, and shipped end-to-end with AI-agent workflows.",
  metadataBase: new URL("https://ai-products-hub.vercel.app"),
  robots: "index, follow",
  openGraph: {
    title: "Siva — AI Product Portfolio",
    description: "50+ AI-powered products built solo, end-to-end.",
    type: "website",
  },
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#07060f] px-4 py-12 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="mb-14 text-center">
        <p className="text-zinc-500 text-sm uppercase tracking-widest mb-3">
          Solo Founder · AI-Native Builder
        </p>
        <h1 className="text-white font-black text-4xl sm:text-5xl tracking-tight mb-4">
          1 founder. {SITES.length}+ AI products. 0 employees.
        </h1>
        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          I design, build, ship, and run a portfolio of AI-powered web products —
          across education, finance, travel, health, and developer tools — using
          AI-agent workflows for research, design, code, and ops. Every product
          below is live in production.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <a
            href="mailto:info.siva@gmail.com"
            className="rounded-lg bg-white text-black font-semibold text-sm px-5 py-2.5 hover:bg-zinc-200 transition-colors"
          >
            Get in touch
          </a>
          <a
            href="https://github.com/infosiva"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-white/15 text-white font-semibold text-sm px-5 py-2.5 hover:bg-white/5 transition-colors"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-14">
        {[
          { label: "Live products", value: `${SITES.length}+` },
          { label: "Categories", value: `${CATEGORIES.length}` },
          { label: "Team size", value: "1" },
          { label: "Stack", value: "Next.js + AI" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-white/8 bg-white/[0.03] px-4 py-4 text-center"
          >
            <p className="text-white font-bold text-2xl">{s.value}</p>
            <p className="text-zinc-500 text-xs uppercase tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Product grid by category */}
      {CATEGORIES.map((cat) => {
        const catSites = SITES.filter((s) => s.category === cat);
        if (catSites.length === 0) return null;
        return (
          <section key={cat} className="mb-12">
            <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
              {cat}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catSites.map((site) => (
                <a
                  key={site.id}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card rounded-xl overflow-hidden flex flex-col gap-2"
                >
                  {hasScreenshot(site.id) && (
                    <div className="relative w-full aspect-[390/280] bg-black/20 overflow-hidden">
                      <Image
                        src={`/screenshots/${site.id}-mobile.jpg`}
                        alt={`${site.name} screenshot`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-top"
                      />
                    </div>
                  )}
                  <div className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{site.emoji}</span>
                      <span
                        className="text-white font-bold text-base"
                        style={{ color: site.accentColor }}
                      >
                        {site.name}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-sm leading-snug">{site.tagline}</p>
                    <span className="text-zinc-600 text-xs mt-auto truncate">{site.url}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })}

      {/* Footer CTA */}
      <section className="text-center pb-8 pt-4 border-t border-white/5">
        <p className="text-zinc-500 text-sm mb-4">
          Building, fixing, or partnering on something? Always happy to chat.
        </p>
        <a
          href="mailto:info.siva@gmail.com"
          className="text-white font-semibold text-sm border border-white/15 rounded-lg px-5 py-2.5 hover:bg-white/5 transition-colors inline-block"
        >
          info.siva@gmail.com
        </a>
      </section>
    </main>
  );
}
