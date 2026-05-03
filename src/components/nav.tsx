"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  NotebookPen, LayoutDashboard, BookOpen,
  TrendingUp, LogOut, Zap, Library, ScrollText,
  FileText, MessageSquareQuote, BookMarked, X, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface NavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isAdmin?: boolean;
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/essays",    label: "Essays",    icon: ScrollText    },
  { href: "/exercises", label: "Exercises", icon: BookOpen      },
  { href: "/progress",  label: "Progress",  icon: TrendingUp    },
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

export function Nav({ user, isAdmin }: NavProps) {
  const pathname = usePathname();
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === href
      : pathname?.startsWith(href);

  const isResourcesActive = pathname?.startsWith("/resources");

  // Close desktop dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDesktopDropdownOpen(false);
      }
    }
    if (desktopDropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [desktopDropdownOpen]);

  const Avatar = ({ size = "sm" }: { size?: "sm" | "md" }) => {
    const dim = size === "sm" ? "h-7 w-7" : "h-6 w-6";
    const text = size === "sm" ? "text-[11px]" : "text-[10px]";
    return user?.image ? (
      <img src={user.image} alt={user.name || "User"} className={`${dim} rounded-full object-cover`} />
    ) : (
      <div className={`${dim} rounded-full bg-brand-600 flex items-center justify-center`}>
        <span className={`text-white font-bold ${text}`}>{initials}</span>
      </div>
    );
  };

  // ── Desktop Resources dropdown (shown for all users) ──────────────────────
  const ResourcesDropdown = () => (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setDesktopDropdownOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150",
          isResourcesActive || desktopDropdownOpen
            ? "bg-slate-100 text-slate-900 font-medium"
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
        )}
      >
        <Library className="h-3.5 w-3.5" />
        Resources
        <ChevronDown className={cn("h-3 w-3 transition-transform", desktopDropdownOpen && "rotate-180")} />
      </button>

      {desktopDropdownOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50">
          {resourceItems.map(({ href, label, desc, icon: Icon, color, bg }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDesktopDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

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

            {/* Desktop nav links (logged-in only) */}
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

            {/* Desktop Resources dropdown — visible for everyone */}
            <div className="hidden md:flex items-center">
              <ResourcesDropdown />
            </div>

            {/* Right side — desktop */}
            {user ? (
              <>
                {/* Upgrade — desktop only */}
                <Link
                  href="/pricing"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors duration-150 shrink-0"
                >
                  <Zap className="h-3.5 w-3.5" />
                  Upgrade
                </Link>

                {/* Admin link — desktop, owner only */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors shrink-0"
                  >
                    Admin
                  </Link>
                )}

                {/* Profile + sign-out — desktop */}
                <div className="hidden md:flex items-center gap-1">
                  <Link href="/profile">
                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                      <Avatar size="md" />
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

                {/* Admin link — mobile header only */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="md:hidden items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors shrink-0 flex"
                  >
                    Admin
                  </Link>
                )}

                {/* Profile avatar — mobile top header only */}
                <Link href="/profile" className="md:hidden shrink-0">
                  <div className={cn(
                    "rounded-full ring-2 transition-colors",
                    pathname === "/profile" ? "ring-brand-500" : "ring-transparent hover:ring-slate-200"
                  )}>
                    <Avatar size="sm" />
                  </div>
                </Link>
              </>
            ) : (
              /* Not logged in: Resources (mobile) + Sign In */
              <div className="flex items-center gap-2">
                {/* Resources button — mobile only (desktop uses the dropdown above) */}
                <button
                  onClick={() => setResourcesOpen(true)}
                  className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <Library className="h-4 w-4" />
                </button>
                <Link
                  href="/auth/signin"
                  className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
              </div>
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
          </nav>
        </>
      )}

      {/* ── Resources bottom sheet (all users on mobile) ── */}
      {resourcesOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setResourcesOpen(false)}
          />
          {/* Sheet */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl">
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
            <div className={cn("p-4 space-y-2.5", user ? "pb-24" : "pb-8")}>
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
  );
}
