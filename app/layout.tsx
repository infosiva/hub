import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import ChatBot from "@/components/ChatBot";
import { AnimatedBg } from "@/components/AnimatedBg";
import { loadSiteTheme, buildGa4Snippet } from "@/lib/theme-loader";

import { MotionProvider } from "@infosiva/shared-ui/modern";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ops Dashboard",
  description: "Private ops dashboard",
  metadataBase: new URL("https://ai-products-hub.vercel.app"),
  robots: "noindex, nofollow",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await loadSiteTheme("hub");
  const ga4 = buildGa4Snippet(theme);
  return (
    <html lang="en" className="h-full">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "AI Products Hub",
          "url": "https://ai-products-hub.vercel.app",
          "description": "A collection of 20+ AI-powered products"
        })}} />
        {ga4 && <script dangerouslySetInnerHTML={{ __html: ga4 }} />}
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <AnimatedBg theme={theme} fallback="none" />
        <MotionProvider>{children}</MotionProvider>
        <FeedbackWidget siteName="Hub" position="left" />
        <ChatBot />
      </body>
    </html>
  );
}
