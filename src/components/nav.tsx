"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Infinity, LayoutDashboard, PenLine, Dumbbell, TrendingUp, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/essay/new", label: "Submit Essay", icon: PenLine },
  { href: "/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/progress", label: "Progress", icon: TrendingUp },
];

export function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-white/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 p-1.5 shadow-lg">
              <Infinity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 text-lg">
              IELTS <span className="text-brand-600">Loop</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-brand-500/10 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2">
                <Link href="/profile">
                  <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100/80 transition-all duration-200 cursor-pointer">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-brand-100"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{initials}</span>
                      </div>
                    )}
                    <span className="text-sm text-slate-700 font-medium max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100/80 transition-all duration-200"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          )}

          {/* Not logged in */}
          {!user && (
            <Link
              href="/auth/signin"
              className="bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-md shadow-brand-500/20 transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="md:hidden bg-white/90 backdrop-blur-xl border-t border-white/60 px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-brand-500/10 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100/80"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100/80 transition-all duration-200"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
