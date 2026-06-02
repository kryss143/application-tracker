"use client";

import { useMemo } from "react";
import { Application } from "@/lib/types";
import {
  BarChart2,
  CheckCircle,
  MessageSquare,
  Trophy,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
} from "recharts";

interface StatsBarProps {
  applications: Application[];
}

const STATUS_COLORS: Record<string, string> = {
  wishlist: "#6B7280",
  applied: "#3B82F6",
  interview: "#F59E0B",
  offer: "#10B981",
  rejected: "#EF4444",
};

export default function StatsBar({ applications }: StatsBarProps) {
  // =========================
  // KPI Metrics
  // =========================
  const total = applications.length;
  const active = applications.filter((a) => a.status !== "rejected").length;
  const interviews = applications.filter(
    (a) => a.status === "interview",
  ).length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const nonWishlist = applications.filter(
    (a) => a.status !== "wishlist",
  ).length;
  const applied = applications.filter((a) => a.status === "applied").length;

  const responseRate =
    nonWishlist > 0
      ? Math.round(((nonWishlist - applied) / nonWishlist) * 100)
      : 0;

  // =========================
  // Pie Chart Data
  // =========================
  const statusData = useMemo(() => {
    const counts = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
    };

    applications.forEach((app) => {
      if (app.status in counts) {
        counts[app.status as keyof typeof counts]++;
      }
    });

    return Object.entries(counts)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value,
        color: STATUS_COLORS[status],
      }))
      .filter((item) => item.value > 0);
  }, [applications]);

  // =========================
  // Monthly Trend Data
  // =========================
  const trendData = useMemo(() => {
    const monthMap = new Map<string, number>();

    applications.forEach((app) => {
      const rawDate =
        (app as any).createdAt || (app as any).appliedAt || (app as any).date;

      if (!rawDate) return;

      const date = new Date(rawDate);

      if (Number.isNaN(date.getTime())) return;

      const monthKey = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);

      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    });

    return [...monthMap.entries()]
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) => {
        const dateA = new Date(`1 ${a.month}`);
        const dateB = new Date(`1 ${b.month}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [applications]);

  const hasAnalyticsData =
    applications.length > 0 && (statusData.length > 0 || trendData.length > 0);

  // =========================
  // Custom Tooltip
  // =========================
  const PieTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: any[];
  }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0];
    const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;

    return (
      <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm shadow-lg">
        <p className="font-medium">{item.name}</p>
        <p>{item.value} applications</p>
        <p>{percentage}%</p>
      </div>
    );
  };

  const LineTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm shadow-lg">
        <p className="font-medium">{label}</p>
        <p>{payload[0].value} applications</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ================================================= */}
      {/* Stats Cards */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <BarChart2 size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Active</span>
            <TrendingUp size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold">{active}</p>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Interviews</span>
            <MessageSquare size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold">{interviews}</p>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Offers</span>
            <Trophy size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold">{offers}</p>
        </div>

        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Response Rate</span>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold">{responseRate}%</p>
        </div>
      </div>

      {/* ================================================= */}
      {/* Analytics Section */}
      {/* ================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Application Analytics</h2>
          <p className="text-sm text-gray-400">
            Track your job search performance
          </p>
        </div>

        {!hasAnalyticsData ? (
          <div className="rounded-xl border border-dashed border-ink-700 bg-ink-900/40 p-12 text-center">
            <h3 className="mb-2 text-lg font-medium text-gray-200">
              No application data available yet.
            </h3>
            <p className="text-gray-400">
              Start tracking applications to see analytics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* ========================================= */}
            {/* Application Trend */}
            {/* ========================================= */}
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5 backdrop-blur-sm lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-semibold text-white">Application Trend</h3>
                <p className="text-sm text-gray-400">
                  Applications submitted over time
                </p>
              </div>

              <div className="h-85">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#374151"
                      opacity={0.4}
                    />

                    <XAxis
                      dataKey="month"
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#9CA3AF", fontSize: 12 }}
                      axisLine={{ stroke: "#4B5563" }}
                      tickLine={{ stroke: "#4B5563" }}
                    />

                    <Tooltip content={<LineTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="none"
                      fill="#3B82F6"
                      fillOpacity={0.08}
                    />

                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ========================================= */}
            {/* Status Distribution */}
            {/* ========================================= */}
            <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-5 backdrop-blur-sm">
              <div className="mb-4">
                <h3 className="font-semibold text-white">
                  Status Distribution
                </h3>
                <p className="text-sm text-gray-400">
                  Current application breakdown
                </p>
              </div>

              <div className="h-85">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>

                    <Tooltip content={<PieTooltip />} />

                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{
                        fontSize: "12px",
                      }}
                    />

                    {/* Center Label */}
                    <text
                      x="50%"
                      y="48%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white text-xl font-bold"
                    >
                      {total}
                    </text>

                    <text
                      x="50%"
                      y="58%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-gray-400 text-xs"
                    >
                      Total Apps
                    </text>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
