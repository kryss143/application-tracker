"use client";

import { signout } from "@/actions/auth";
import { Briefcase, LogOut, User, Home, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  userEmail: string;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/kanban", label: "Kanban Board", icon: LayoutDashboard },
];

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-900/80 backdrop-blur-xl border-b border-ink-700/60">
      <div className="max-w-400 mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-gold-400" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-semibold text-ink-50 tracking-tight">
              JobLedger
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150",
                    isActive
                      ? "bg-ink-700/70 text-ink-100 font-medium"
                      : "text-ink-400 hover:text-ink-200 hover:bg-ink-800/60",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-gold-400" : "",
                    ].join(" ")}
                    strokeWidth={1.75}
                  />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-ink-400">
            <User className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{userEmail}</span>
          </div>

          <div className="w-px h-5 bg-ink-700 hidden sm:block" />

          <button
            onClick={() => signout()}
            className="flex items-center gap-2 text-sm text-ink-400 hover:text-ink-100 transition-colors group"
          >
            <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      {/* Mobile bottom nav links */}
      <div className="sm:hidden flex border-t border-ink-700/40">
        {NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex-1 flex items-center justify-center gap-2 py-2 text-xs transition-all",
                isActive
                  ? "text-gold-400 font-medium"
                  : "text-ink-500 hover:text-ink-300",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
