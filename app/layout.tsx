import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FeedbackWidget from "@/components/FeedbackWidget";
import ChatBot from "@/components/ChatBot";

import { MotionProvider } from "@infosiva/shared-ui/modern";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ops Dashboard",
  description: "Private ops dashboard",
  metadataBase: new URL("https://ai-products-hub.vercel.app"),
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      </head>
      <body className={`${inter.className} min-h-full flex flex-col`}>
        <MotionProvider>{children}</MotionProvider>
        <FeedbackWidget siteName="Hub" position="left" />
        <ChatBot />
      </body>
    </html>
  );
}
