"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  NotebookPen, LayoutDashboard, PenLine, BookOpen,
  TrendingUp, LogOut, User, Zap, Library,
  FileText, MessageSquareQuote, BookMarked, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/essay/new", label: "Submit",    icon: PenLine },
  { href: "/exercises", label: "Exercises", icon: BookOpen },
  { href: "/progress",  label: "Progress",  icon: TrendingUp },
];

const resourceItems = [
  {
    href: "/resources/templates",
    label: "Essay Templates",
    desc: "Structures for every IELTS task type",
    icon: FileText,
    color: "text-brand-600",
    bg: "bg-brand-50",
  },
  {
    href: "/resources/phrases",
    label: "Useful Phrases",
    desc: "Linking words organised by function",
    icon: MessageSquareQuote,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    href: "/resources/synonyms",
    label: "Synonyms Guide",
    desc: "Band 7+ vocabulary upgrades",
    icon: BookMarked,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname?.startsWith(href);

  const isResourcesActive = pathname?.startsWith("/resources");

  return (
    <>
      {/* ── Top nav ── */}
      <nav className="sticky top-0 z-40 w-full bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center justify-between gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
                <NotebookPen className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-sm tracking-tight">
                IELTS<span className="text-brand-600">Memo</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            {user && (
              <div className="hidden md:flex items-center gap-0.5 flex-1">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150",
                      isActive(href)
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                ))}
              </div>
            )}

            {/* Upgrade link — desktop, logged-in only */}
            {user && (
              <Link
                href="/pricing"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors duration-150 shrink-0"
              >
                <Zap className="h-3.5 w-3.5" />
                Upgrade
              </Link>
            )}

            {/* User area */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/profile">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{initials}</span>
                      </div>
                    )}
                    <span className="text-sm text-slate-600 font-medium max-w-[100px] truncate">
                      {user.name?.split(" ")[0] || user.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom nav (logged-in only) ── */}
      {user && (
        <>
          <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--border)] flex items-stretch">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                    active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-slate-400")} />
                  {label}
                </Link>
              );
            })}

            {/* Resources — opens bottom sheet */}
            <button
              onClick={() => setResourcesOpen(true)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                isResourcesActive || resourcesOpen ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <Library className={cn("h-[18px] w-[18px]", isResourcesActive || resourcesOpen ? "text-brand-600" : "text-slate-400")} />
              Resources
            </button>

            {/* Profile */}
            <Link
              href="/profile"
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                pathname === "/profile" ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <User className={cn("h-[18px] w-[18px]", pathname === "/profile" ? "text-brand-600" : "text-slate-400")} />
              Me
            </Link>
          </nav>

          {/* ── Resources bottom sheet ── */}
          {resourcesOpen && (
            <>
              {/* Backdrop */}
              <div
                className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                onClick={() => setResourcesOpen(false)}
              />
              {/* Sheet */}
              <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl pb-safe">
                {/* Handle + header */}
                <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
                  <div>
                    <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-900">Writing Resources</p>
                    <p className="text-xs text-slate-400 mt-0.5">Free guides to boost your score</p>
                  </div>
                  <button
                    onClick={() => setResourcesOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Resource cards */}
                <div className="p-4 space-y-2.5 pb-24">
                  {resourceItems.map(({ href, label, desc, icon: Icon, color, bg }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setResourcesOpen(false)}
                      className="flex items-center gap-3.5 p-4 bg-white rounded-2xl border border-slate-200 active:bg-slate-50 transition-colors"
                    >
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                        <Icon className={cn("h-5 w-5", color)} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
