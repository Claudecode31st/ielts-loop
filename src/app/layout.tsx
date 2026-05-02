import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "IELTS Memo — AI Writing Coach That Remembers",
  description:
    "IELTS Memo gives you examiner-level writing feedback, builds a long-term memory of your error patterns, and coaches you in real time — so every session targets exactly what's holding your band score back.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.variable} font-sans min-h-screen antialiased`}
            style={{ background: "var(--bg)", color: "var(--text)" }}>
        <SessionProvider session={session}>
          <div className="min-h-full flex flex-col">
            <Nav user={session?.user ?? undefined} />
            {/* Extra bottom padding on mobile when logged in to clear the bottom nav */}
            <main className={`flex-1 ${isLoggedIn ? "pb-16 md:pb-0" : ""}`}>
              {children}
            </main>
            {/* On mobile when logged in, add bottom padding so footer clears the fixed nav bar */}
            <div className={isLoggedIn ? "pb-16 md:pb-0" : ""}>
              <Footer isLoggedIn={isLoggedIn} />
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
