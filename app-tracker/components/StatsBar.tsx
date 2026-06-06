"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
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
} from "recharts";

interface StatsBarProps {
  applications: Application[];
}

type StatusKey =
  | "wishlist"
  | "applied"
  | "interview"
  | "inprogress"
  | "offer"
  | "rejected";

const STATUS_COLORS: Record<StatusKey, string> = {
  wishlist: "#6B7280",
  applied: "#3B82F6",
  interview: "#F59E0B",
  inprogress: "#8B5CF6",
  offer: "#10B981",
  rejected: "#EF4444",
};

// Maps each stat card to the status(es) it represents in the donut
const CARD_STATUS_MAP: Record<string, StatusKey[]> = {
  active: ["wishlist", "applied", "interview", "inprogress", "offer"],
  interviews: ["interview"],
  offers: ["offer"],
  rejected: ["rejected"],
};

type TrendStatusKey = StatusKey;

type TrendDatum = {
  dayKey: string;
  day: string;
} & Record<TrendStatusKey, number>;

const TREND_STATUS_KEYS: TrendStatusKey[] = [
  "wishlist",
  "applied",
  "interview",
  "inprogress",
  "offer",
  "rejected",
];

export default function StatsBar({ applications }: StatsBarProps) {
  const [activeStatus, setActiveStatus] = useState<StatusKey | null>(null);
  const [hoverStatus, setHoverStatus] = useState<StatusKey | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const counts: Record<StatusKey, number> = {
      wishlist: 0,
      applied: 0,
      interview: 0,
      inprogress: 0,
      offer: 0,
      rejected: 0,
    };
    applications.forEach((app) => {
      if (app.status in counts) counts[app.status as StatusKey]++;
    });
    return Object.entries(counts)
      .map(([status, value]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        status: status as StatusKey,
        value,
        color: STATUS_COLORS[status as StatusKey],
      }))
      .filter((item) => item.value > 0);
  }, [applications]);

  // =========================
  // Daily Trend Data
  // =========================
  const MONTH_ABBREV = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const trendData = useMemo(() => {
    const dayMap = new Map<string, TrendDatum>();
    applications.forEach((app) => {
      const rawDate = app.created_at || app.applied_date;
      if (!rawDate) return;
      const date = new Date(rawDate);
      if (Number.isNaN(date.getTime())) return;
      if (!TREND_STATUS_KEYS.includes(app.status as TrendStatusKey)) return;

      const dayKey = date.toISOString().slice(0, 10);
      const day =
        dayMap.get(dayKey) ??
        ({
          dayKey,
          day: (() => {
            const dt = new Date(`${dayKey}T00:00:00`);
            return `${MONTH_ABBREV[dt.getMonth()]} ${dt.getDate()}`;
          })(),
          wishlist: 0,
          applied: 0,
          interview: 0,
          inprogress: 0,
          offer: 0,
          rejected: 0,
        } satisfies TrendDatum);

      day[app.status as TrendStatusKey] += 1;
      dayMap.set(dayKey, day);
    });
    return Array.from(dayMap.values()).sort((a, b) =>
      a.dayKey.localeCompare(b.dayKey),
    );
  }, [applications]);

  const hasAnalyticsData =
    applications.length > 0 && (statusData.length > 0 || trendData.length > 0);

  // =========================
  // Donut interaction
  // =========================
  const handleSliceClick = useCallback((entry: { status: StatusKey }) => {
    setActiveStatus((prev) => (prev === entry.status ? null : entry.status));
  }, []);

  const handleSliceHover = useCallback(
    (entry: { status: StatusKey } | null) => {
      setHoverStatus(entry?.status ?? null);
    },
    [],
  );

  const handleSliceLeave = useCallback(() => {
    setHoverStatus(null);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setActiveStatus(null);
  }, []);

  /** Returns whether a stat card should be highlighted given the active status */
  const getCardHighlight = (cardKey: string): "active" | "dim" | "none" => {
    if (!activeStatus) return "none";
    if (cardKey === "total") return "none"; // total always neutral
    const linked = CARD_STATUS_MAP[cardKey];
    if (!linked) return "dim";
    return linked.includes(activeStatus) ? "active" : "dim";
  };

  // =========================
  // Custom Tooltips
  // =========================
  const PieTooltipContent = ({
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

  const LineTooltipContent = ({
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
        <div className="mt-2 space-y-1">
          {payload.map((item) => (
            <p key={item.dataKey} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>
                {item.name}: {item.value}
              </span>
            </p>
          ))}
        </div>
      </div>
    );
  };

  // =========================
  // Card style helper
  // =========================
  const cardStyle = (
    highlight: "active" | "dim" | "none",
    accentColor?: string,
  ) => {
    const base =
      "rounded-xl border bg-ink-900/60 p-4 backdrop-blur-sm transition-all duration-300";

    if (highlight === "active") {
      return `${base} border-2 shadow-lg scale-[1.03]`;
    }
    if (highlight === "dim") {
      return `${base} border-ink-700 opacity-40`;
    }
    return `${base} border-ink-700`;
  };

  const cardBorderColor = (
    highlight: "active" | "dim" | "none",
    color: string,
  ) => (highlight === "active" ? color : undefined);

  const displayStatus = activeStatus ?? hoverStatus;
  const formatStatusLabel = (s: StatusKey | null | undefined) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : "Total Apps";

  return (
    <div className="space-y-6" onClick={handleBackgroundClick}>
      {/* ================================================= */}
      {/* Stats Cards                                        */}
      {/* ================================================= */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Total — never dims, never highlights */}
        <div className={cardStyle("none")}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Total</span>
            <BarChart2 size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold">{total}</p>
        </div>

        {/* Active */}
        {(() => {
          const h = getCardHighlight("active");
          const color = STATUS_COLORS[activeStatus ?? "applied"];
          return (
            <div
              className={cardStyle(h)}
              style={{
                borderColor: cardBorderColor(h, color),
                boxShadow: h === "active" ? `0 0 16px ${color}40` : undefined,
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">Active</span>
                <TrendingUp
                  size={18}
                  className={h === "active" ? "text-cyan-300" : "text-cyan-400"}
                />
              </div>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${h === "active" ? "text-white" : ""}`}
              >
                {active}
              </p>
            </div>
          );
        })()}

        {/* Interviews */}
        {(() => {
          const h = getCardHighlight("interviews");
          const color = STATUS_COLORS.interview;
          return (
            <div
              className={cardStyle(h)}
              style={{
                borderColor: cardBorderColor(h, color),
                boxShadow: h === "active" ? `0 0 16px ${color}40` : undefined,
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">Interviews</span>
                <MessageSquare
                  size={18}
                  className={
                    h === "active" ? "text-amber-300" : "text-amber-400"
                  }
                />
              </div>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${h === "active" ? "text-white" : ""}`}
              >
                {interviews}
              </p>
            </div>
          );
        })()}

        {/* Offers */}
        {(() => {
          const h = getCardHighlight("offers");
          const color = STATUS_COLORS.offer;
          return (
            <div
              className={cardStyle(h)}
              style={{
                borderColor: cardBorderColor(h, color),
                boxShadow: h === "active" ? `0 0 16px ${color}40` : undefined,
              }}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">Offers</span>
                <Trophy
                  size={18}
                  className={
                    h === "active" ? "text-emerald-300" : "text-emerald-400"
                  }
                />
              </div>
              <p
                className={`text-2xl font-bold transition-colors duration-300 ${h === "active" ? "text-white" : ""}`}
              >
                {offers}
              </p>
            </div>
          );
        })()}

        {/* Response Rate — no direct status link, stays neutral */}
        <div className={cardStyle("none")}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-gray-400">Response Rate</span>
            <CheckCircle size={18} className="text-green-400" />
          </div>
          <p className="text-2xl font-bold">{responseRate}%</p>
        </div>
      </div>

      {/* ================================================= */}
      {/* Analytics Section                                  */}
      {/* ================================================= */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold font-display">
            Application Analytics
          </h2>
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
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-3">
            {/* ========================================= */}
            {/* Application Trend                         */}
            {/* ========================================= */}
            <div className="min-w-0 rounded-xl border border-ink-700 bg-ink-900/60 p-5 backdrop-blur-sm lg:col-span-2">
              <div className="mb-4">
                <h3 className="font-semibold text-white">Application Trend</h3>
                <p className="text-sm text-gray-400">
                  Applications submitted by day
                </p>
              </div>
              <div className="h-80 min-w-0">
                {mounted && (
                  <ResponsiveContainer width="100%" height={320} minWidth={0}>
                    <LineChart data={trendData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#374151"
                        opacity={0.4}
                      />
                      <XAxis
                        dataKey="day"
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
                      <Tooltip content={<LineTooltipContent />} />
                      <Legend
                        verticalAlign="top"
                        wrapperStyle={{
                          fontSize: "12px",
                          paddingBottom: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="wishlist"
                        name="Wishlist"
                        stroke={STATUS_COLORS.wishlist}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="applied"
                        name="Applied"
                        stroke={STATUS_COLORS.applied}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="interview"
                        name="Interview"
                        stroke={STATUS_COLORS.interview}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="offer"
                        name="Offer"
                        stroke={STATUS_COLORS.offer}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="rejected"
                        name="Rejected"
                        stroke={STATUS_COLORS.rejected}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ========================================= */}
            {/* Status Distribution (Donut)               */}
            {/* ========================================= */}
            <div
              className="min-w-0 rounded-xl border border-ink-700 bg-ink-900/60 p-5 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()} // prevent bubble to background handler
            >
              <div className="mb-2">
                <h3 className="font-semibold text-white">
                  Status Distribution
                </h3>
                <p className="text-sm text-gray-400">
                  Current application breakdown
                </p>
              </div>

              {/* Hint text */}
              <p className="mb-2 text-xs text-gray-500 italic">
                {activeStatus
                  ? `Showing: ${activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)} — click again to clear`
                  : hoverStatus
                    ? `Hovering: ${hoverStatus.charAt(0).toUpperCase() + hoverStatus.slice(1)} — click to pin`
                    : "Click a slice to highlight cards"}
              </p>

              <div className="h-80 min-w-0">
                {mounted && (
                  <ResponsiveContainer width="100%" height={320} minWidth={0}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                        onClick={(entry) => handleSliceClick(entry as any)}
                        onMouseEnter={(entry) => handleSliceHover(entry as any)}
                        onMouseLeave={handleSliceLeave}
                        style={{ cursor: "pointer" }}
                      >
                        {statusData.map((entry) => {
                          const isActive = activeStatus === entry.status;
                          const isHovered = hoverStatus === entry.status;
                          const isDimmed =
                            (activeStatus ?? hoverStatus) !== null &&
                            !(isActive || isHovered);
                          return (
                            <Cell
                              key={entry.name}
                              fill={entry.color}
                              opacity={isDimmed ? 0.25 : 1}
                              stroke={
                                isActive || isHovered ? "#fff" : "transparent"
                              }
                              strokeWidth={isActive || isHovered ? 2 : 0}
                              tabIndex={0}
                              role="button"
                              aria-label={`${entry.name}: ${entry.value} applications`}
                              onFocus={() =>
                                handleSliceHover({ status: entry.status })
                              }
                              onBlur={() => handleSliceLeave()}
                              onKeyDown={(e: any) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  handleSliceClick({ status: entry.status });
                                }
                              }}
                            />
                          );
                        })}
                      </Pie>

                      <Tooltip content={<PieTooltipContent />} />

                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: "12px" }}
                        formatter={(value, entry: any) => (
                          <span
                            style={{
                              opacity:
                                (activeStatus ?? hoverStatus) &&
                                entry.payload.status !==
                                  (activeStatus ?? hoverStatus)
                                  ? 0.35
                                  : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            {value}
                          </span>
                        )}
                      />

                      {/* Center label — updates to reflect hovered/active slice */}
                      <text
                        x="50%"
                        y="45%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#fff"
                        fontSize={22}
                        fontWeight={700}
                      >
                        {(activeStatus ?? hoverStatus)
                          ? (statusData.find(
                              (d) => d.status === (activeStatus ?? hoverStatus),
                            )?.value ?? total)
                          : total}
                      </text>
                      <text
                        x="50%"
                        y="56%"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#9CA3AF"
                        fontSize={11}
                      >
                        {formatStatusLabel(displayStatus)}
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
