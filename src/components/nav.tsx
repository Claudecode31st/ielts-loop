"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BookOpen, LayoutDashboard, PenLine, Dumbbell, TrendingUp, LogOut, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-2 font-bold text-indigo-600"
          >
            <BookOpen className="h-6 w-6" />
            <span className="text-lg">IELTS Loop</span>
          </Link>

          {/* Desktop nav */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === href
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* User menu */}
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-3">
                <Link href="/profile">
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-indigo-600" />
                      </div>
                    )}
                    <span className="text-sm text-slate-700 font-medium max-w-[120px] truncate">
                      {user.name || user.email}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-slate-500 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
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
            <Link href="/auth/signin">
              <Button size="sm">Sign In</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
          <Link
            href="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
