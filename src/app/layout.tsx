import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Nav } from "@/components/nav";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IELTS Loop — AI-Powered Writing Feedback",
  description:
    "Get instant, accurate IELTS writing feedback from our AI examiner. Track your progress and target your weaknesses with personalized exercises.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans min-h-screen antialiased`}
            style={{ background: "var(--bg)", color: "var(--text)" }}>
        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            <Nav user={session?.user ?? undefined} />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-[var(--border)] py-4 mt-auto">
              <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-400">
                IELTS Loop — AI-powered writing feedback. Not affiliated with IDP or British Council.
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
