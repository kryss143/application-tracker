"use client";

import { Application } from "@/lib/types";
import { BarChart2, CheckCircle, MessageSquare, Trophy, TrendingUp } from "lucide-react";

interface StatsBarProps {
  applications: Application[];
}

export default function StatsBar({ applications }: StatsBarProps) {
  const total = applications.length;
  const active = applications.filter((a) => a.status !== "rejected").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const nonWishlist = applications.filter((a) => a.status !== "wishlist").length;
  const applied = applications.filter((a) => a.status === "applied").length;
  const responseRate =
    nonWishlist > 0
      ? Math.round(((nonWishlist - applied) / nonWishlist) * 100)
      : 0;

  const stats = [
    {
      label: "Total",
      value: total,
      icon: BarChart2,
      color: "text-ink-300",
      bg: "bg-ink-800",
      border: "border-ink-600",
    },
    {
      label: "Active",
      value: active,
      icon: CheckCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Interviews",
      value: interviews,
      icon: MessageSquare,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      label: "Offers",
      value: offers,
      icon: Trophy,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      label: "Response Rate",
      value: `${responseRate}%`,
      icon: TrendingUp,
      color: "text-gold-400",
      bg: "bg-gold-400/10",
      border: "border-gold-400/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`${stat.bg} border ${stat.border} rounded-xl p-4 flex items-center gap-3`}
          >
            <div className={`${stat.color} shrink-0`}>
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-400 font-medium truncate">
                {stat.label}
              </p>
              <p className={`text-xl font-semibold font-mono ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
