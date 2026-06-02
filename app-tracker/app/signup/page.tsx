"use client";

import { useState } from "react";
import Link from "next/link";
import { signup } from "@/actions/auth";
import { Briefcase, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    if (formData.get("password") !== formData.get("confirm_password")) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const result = await signup(formData);
    if (result && !result.success) {
      setError(result.error || "Signup failed");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-grid flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-slide-up">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink-800 border border-ink-700 mb-5 shadow-card">
            <Briefcase className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-50 mb-1">
            JobLedger
          </h1>
          <p className="text-ink-400 text-sm">Create your free account</p>
        </div>

        <div className="bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-card">
          {error && (
            <div className="mb-6 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="Repeat password"
                  className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gold-400 hover:bg-gold-300 text-ink-950 font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 group"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-ink-800/40 border-t-ink-800 rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-700 text-center">
            <p className="text-sm text-ink-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
