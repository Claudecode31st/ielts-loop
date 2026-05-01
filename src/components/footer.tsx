import Link from "next/link";
import { Infinity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
                <Infinity className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold text-slate-900 text-sm">IELTSLoop</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[180px]">
              AI-powered IELTS writing feedback that builds a memory of your mistakes.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3">Product</p>
            <ul className="space-y-2">
              {[
                { label: "Dashboard",    href: "/dashboard" },
                { label: "Submit Essay", href: "/essay/new" },
                { label: "Exercises",    href: "/exercises" },
                { label: "Progress",     href: "/progress" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* IELTS */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3">IELTS</p>
            <ul className="space-y-2">
              {[
                "Task 1 (Academic)",
                "Task 1 (General)",
                "Task 2 Essay",
                "Band Score Guide",
              ].map((label) => (
                <li key={label}>
                  <span className="text-xs text-slate-400">{label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-slate-700 mb-3">Legal</p>
            <ul className="space-y-2">
              {[
                { label: "Privacy Policy",   href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} IELTS Loop. All rights reserved.
          </p>
          <p className="text-xs text-slate-400">
            Not affiliated with IDP, British Council, or Cambridge Assessment English.
          </p>
        </div>
      </div>
    </footer>
  );
}
