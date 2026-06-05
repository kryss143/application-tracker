"use client";

import { useState, useMemo } from "react";
import {
  Application,
  ApplicationStatus,
  STATUS_ORDER,
  STATUS_CONFIG,
} from "@/lib/types";
import ApplicationCard from "./ApplicationCard";
import ApplicationForm from "./ApplicationForm";
import { Search, SlidersHorizontal, Plus, Inbox } from "lucide-react";

interface KanbanBoardProps {
  initialApplications: Application[];
}

export default function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] =
    useState<Application[]>(initialApplications);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"created_at" | "applied_date">(
    "created_at",
  );
  const [showAdd, setShowAdd] = useState(false);
  const [addStatus, setAddStatus] = useState<ApplicationStatus>("wishlist");

  const filtered = useMemo(() => {
    return applications
      .filter((app) => {
        const q = search.toLowerCase();
        const matchesSearch =
          !q ||
          app.company_name.toLowerCase().includes(q) ||
          app.job_title.toLowerCase().includes(q);
        const matchesStatus =
          filterStatus === "all" || app.status === filterStatus;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const aDate = a[sortBy] ?? a.created_at;
        const bDate = b[sortBy] ?? b.created_at;
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      });
  }, [applications, search, filterStatus, sortBy]);

  function handleSave(app: Application) {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      if (exists) return prev.map((a) => (a.id === app.id ? app : a));
      return [app, ...prev];
    });
  }

  function handleDelete(id: string) {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
          <input
            type="text"
            placeholder="Search by company or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ink-800 border border-ink-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-500" />
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ApplicationStatus | "all")
              }
              className="bg-ink-800 border border-ink-600 rounded-xl pl-9 pr-8 py-2.5 text-sm text-ink-300 focus:outline-none focus:border-gold-400/50 appearance-none"
            >
              <option value="all">All statuses</option>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "created_at" | "applied_date")
            }
            className="bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-sm text-ink-300 focus:outline-none focus:border-gold-400/50 appearance-none"
          >
            <option value="created_at">Date added</option>
            <option value="applied_date">Applied date</option>
          </select>

          <button
            onClick={() => {
              setAddStatus("wishlist");
              setShowAdd(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gold-400 hover:bg-gold-300 text-ink-950 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STATUS_ORDER.map((status) => {
          const colApps = filtered.filter((a) => a.status === status);
          const config = STATUS_CONFIG[status];
          const columnScrollable = colApps.length > 5;

          return (
            <div key={status} className="flex-none w-72">
              {/* Column header */}
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full bg-current ${config.color}`}
                  />
                  <span className="text-sm font-medium text-ink-200">
                    {config.label}
                  </span>
                  <span className="text-xs font-mono text-ink-500 bg-ink-800 border border-ink-700 rounded-full px-2 py-0.5">
                    {colApps.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAddStatus(status);
                    setShowAdd(true);
                  }}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-ink-600 hover:text-ink-300 hover:bg-ink-700 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Column body */}
              <div
                className={`min-h-50 rounded-xl p-2 space-y-2.5 ${config.bgColor} border ${config.borderColor}/20 ${
                  columnScrollable
                    ? "max-h-175 overflow-y-auto scrollbar-thin pr-2"
                    : ""
                }`}
              >
                {colApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Inbox
                      className="w-6 h-6 text-ink-600 mb-2"
                      strokeWidth={1.5}
                    />
                    <p className="text-xs text-ink-600">No applications yet</p>
                    <button
                      onClick={() => {
                        setAddStatus(status);
                        setShowAdd(true);
                      }}
                      className="mt-2 text-xs text-ink-500 hover:text-gold-400 transition-colors"
                    >
                      + Add one
                    </button>
                  </div>
                ) : (
                  colApps.map((app, i) => (
                    <ApplicationCard
                      key={app.id}
                      application={app}
                      onUpdate={handleSave}
                      onDelete={handleDelete}
                      style={{
                        animationDelay: `${i * 40}ms`,
                        animationFillMode: "backwards",
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAdd && (
        <ApplicationForm
          defaultStatus={addStatus}
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
