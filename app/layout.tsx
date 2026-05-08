import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Siva's AI Products — All Tools in One Place",
  description: "A collection of 20+ AI-powered products built by Siva — tutors, quizzes, travel planners, finance tools, resume builders, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
