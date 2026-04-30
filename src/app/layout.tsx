import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Nav } from "@/components/nav";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} h-full bg-slate-50 text-slate-900`}>
        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            <Nav user={session?.user ?? undefined} />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
              <div className="max-w-6xl mx-auto px-4 text-center text-sm text-slate-400">
                IELTS Loop — AI-powered writing feedback. Not affiliated with
                IDP or British Council.
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
