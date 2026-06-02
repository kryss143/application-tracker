"use client";

import { signout } from "@/actions/auth";
import { Briefcase, LogOut, User } from "lucide-react";

interface NavbarProps {
  userEmail: string;
}

export default function Navbar({ userEmail }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink-900/80 backdrop-blur-xl border-b border-ink-700/60">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-gold-400" strokeWidth={1.5} />
          </div>
          <span className="font-display text-lg font-semibold text-ink-50 tracking-tight">
            JobLedger
          </span>
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
    </nav>
  );
}
