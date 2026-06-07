"use client";

import { useState } from "react";
import { login } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});
    setServerError(null);

    const formData = new FormData(e.currentTarget);
    const raw = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Client-side Zod validation
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      const errs: FieldErrors = {};
      parsed.error.issues.forEach((err) => {
        const field = err.path[0] as keyof FieldErrors;
        if (!errs[field]) errs[field] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData);
      if (!result.success) {
        setServerError(result.error ?? "Login failed.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setServerError(
        "Network error. Please check your connection and try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-grid flex items-center justify-center p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md animate-fade-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink-800 border border-ink-700 mb-5 shadow-card">
            <Briefcase className="w-6 h-6 text-gold-400" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-ink-50 mb-1">
            JobLedger
          </h1>
          <p className="text-ink-400 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-card">
          {/* Server error banner */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.email ? "text-red-400" : "text-ink-500"}`}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full bg-ink-800 border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:ring-1 transition-all ${
                    fieldErrors.email
                      ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20"
                      : "border-ink-600 focus:border-gold-400/50 focus:ring-gold-400/20"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-ink-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${fieldErrors.password ? "text-red-400" : "text-ink-500"}`}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className={`w-full bg-ink-800 border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:ring-1 transition-all ${
                    fieldErrors.password
                      ? "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20"
                      : "border-ink-600 focus:border-gold-400/50 focus:ring-gold-400/20"
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {fieldErrors.password}
                </p>
              )}
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
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ink-700 text-center">
            <p className="text-sm text-ink-400">
              No account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signup")}
                className="text-gold-400 hover:text-gold-300 font-medium transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
