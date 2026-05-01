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
  { href: "/dashboard",  label: "Dashboard", icon: LayoutDashboard },
  { href: "/essay/new",  label: "Submit",     icon: PenLine },
  { href: "/exercises",  label: "Exercises",  icon: Dumbbell },
  { href: "/progress",   label: "Progress",   icon: TrendingUp },
];

export function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-[var(--border)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-12 items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <Infinity className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">
              IELTS<span className="text-brand-600">Loop</span>
            </span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-0.5 flex-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors duration-150",
                      isActive
                        ? "bg-slate-100 text-slate-900 font-medium"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-1">
              <div className="hidden md:flex items-center gap-1">
                <Link href="/profile">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-6 w-6 rounded-full object-cover"
                      />
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

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}

          {!user && (
            <Link
              href="/auth/signin"
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="md:hidden bg-white border-t border-[var(--border)] px-4 py-2 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors",
                  isActive ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
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
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
