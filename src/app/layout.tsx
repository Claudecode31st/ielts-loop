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
      <body
        className={`${inter.className} min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/40 to-brand-50/20 text-slate-900 antialiased`}
      >
        {/* Decorative background blobs */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-rose-200/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        </div>

        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            <Nav user={session?.user ?? undefined} />
            <main className="flex-1">{children}</main>
            <footer className="bg-white/40 backdrop-blur-md border-t border-white/60 py-6 mt-auto">
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
