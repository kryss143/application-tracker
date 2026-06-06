export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "interview"
  | "in_progress"
  | "offer"
  | "rejected";

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  job_url: string | null;
  location: string | null;
  salary_range: string | null;
  notes: string | null;
  applied_date: string | null;
  followup_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    color: string;
    borderColor: string;
    bgColor: string;
    badgeBg: string;
  }
> = {
  wishlist: {
    label: "Wishlist",
    color: "text-slate-400",
    borderColor: "border-slate-500",
    bgColor: "bg-slate-500/10",
    badgeBg: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
  },
  applied: {
    label: "Applied",
    color: "text-blue-400",
    borderColor: "border-blue-500",
    bgColor: "bg-blue-500/10",
    badgeBg: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  },
  interview: {
    label: "Interview",
    color: "text-amber-400",
    borderColor: "border-amber-500",
    bgColor: "bg-amber-500/10",
    badgeBg: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  },
  in_progress: {
    label: "In Progress",
    color: "text-violet-400",
    borderColor: "border-violet-500",
    bgColor: "bg-violet-500/10",
    badgeBg: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  },
  offer: {
    label: "Offer",
    color: "text-emerald-400",
    borderColor: "border-emerald-500",
    bgColor: "bg-emerald-500/10",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    borderColor: "border-red-500",
    bgColor: "bg-red-500/10",
    badgeBg: "bg-red-500/20 text-red-300 border border-red-500/30",
  },
};

export const STATUS_ORDER: ApplicationStatus[] = [
  "wishlist",
  "applied",
  "interview",
  "in_progress",
  "offer",
  "rejected",
];

/**
 * Normalize arbitrary status strings to the canonical ApplicationStatus.
 * Accepts variants like "inprogress", "in progress", "In-Progress" and
 * returns the canonical kebab-case values used throughout the app.
 */
export function normalizeStatus(
  s: string | null | undefined,
): ApplicationStatus {
  if (!s) return "wishlist";
  const raw = String(s).trim().toLowerCase();
  if (raw === "inprogress" || raw === "in progress" || raw === "in_progress")
    return "in_progress";
  if (raw === "applied") return "applied";
  if (raw === "interview") return "interview";
  if (raw === "offer") return "offer";
  if (raw === "rejected") return "rejected";
  if (raw === "wishlist") return "wishlist";
  // Fallback: if it contains the word "progress" treat as in-progress
  if (raw.includes("progress")) return "in_progress";
  // Default to wishlist for unknown values
  return "wishlist";
}
