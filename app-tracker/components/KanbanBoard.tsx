"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import {
  Application,
  ApplicationStatus,
  ActionResult,
  STATUS_ORDER,
  STATUS_CONFIG,
} from "@/lib/types";
import { updateApplicationStatus } from "@/actions/applications";
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

  // Drag and drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] =
    useState<ApplicationStatus | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

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

  const handleSave = useCallback((app: Application) => {
    setApplications((prev) => {
      const exists = prev.find((a) => a.id === app.id);
      if (exists) return prev.map((a) => (a.id === app.id ? app : a));
      return [app, ...prev];
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    // slight opacity delay so the ghost image renders first
    setTimeout(() => {
      const el = document.getElementById(`card-${id}`);
      if (el) el.style.opacity = "0.4";
    }, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggingId) {
      const el = document.getElementById(`card-${draggingId}`);
      if (el) el.style.opacity = "";
    }
    setDraggingId(null);
    setDragOverStatus(null);
    setDragOverId(null);
    dragCounter.current = {};
  }, [draggingId]);

  // Column-level drag events
  const handleColumnDragEnter = useCallback(
    (e: React.DragEvent, status: ApplicationStatus) => {
      e.preventDefault();
      dragCounter.current[status] = (dragCounter.current[status] ?? 0) + 1;
      setDragOverStatus(status);
    },
    [],
  );

  const handleColumnDragLeave = useCallback(
    (e: React.DragEvent, status: ApplicationStatus) => {
      dragCounter.current[status] = (dragCounter.current[status] ?? 1) - 1;
      if (dragCounter.current[status] <= 0) {
        dragCounter.current[status] = 0;
        setDragOverStatus((prev) => (prev === status ? null : prev));
      }
    },
    [],
  );

  const handleColumnDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  function handleColumnDrop(
    e: React.DragEvent,
    targetStatus: ApplicationStatus,
  ) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    setDraggingId(null);
    setDragOverStatus(null);
    setDragOverId(null);
    dragCounter.current = {};

    // ✅ Read previousStatus BEFORE calling setApplications
    const previousStatus = applications.find((a) => a.id === id)?.status;
    if (!previousStatus || previousStatus === targetStatus) return;

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: targetStatus } : a)),
    );

    // Sync to server
    setSyncingId(id);
    setErrorId(null);
    updateApplicationStatus(id, targetStatus).then((result: ActionResult) => {
      setSyncingId(null);
      if (!result.success) {
        // Roll back optimistic update
        setApplications((current) =>
          current.map((a) =>
            a.id === id ? { ...a, status: previousStatus } : a,
          ),
        );
        setErrorId(id);
        setTimeout(() => setErrorId((cur) => (cur === id ? null : cur)), 3000);
      }
    });
  }

  // Card-level drag enter (for fine-grained reorder within column, optional)
  const handleCardDragEnter = useCallback((id: string) => {
    setDragOverId(id);
  }, []);

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-50 mb-1">
          Kanban Board
        </h2>
        <p className="text-sm text-gray-400">Track your job search status</p>
      </div>
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
          const isOver = dragOverStatus === status;
          const isDraggingAcross =
            draggingId !== null && !colApps.find((a) => a.id === draggingId);

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

              {/* Column body — drop target */}
              <div
                onDragEnter={(e) => handleColumnDragEnter(e, status)}
                onDragLeave={(e) => handleColumnDragLeave(e, status)}
                onDragOver={handleColumnDragOver}
                onDrop={(e) => handleColumnDrop(e, status)}
                className={[
                  "min-h-50 rounded-xl p-2 space-y-2.5",
                  config.bgColor,
                  "border",
                  // Highlight drop target
                  isOver && isDraggingAcross
                    ? `${config.borderColor}/60 ring-2 ring-inset ring-current ${config.color} scale-[1.01]`
                    : `${config.borderColor}/20`,
                  "transition-all duration-150",
                  columnScrollable
                    ? "max-h-175 overflow-y-auto scrollbar-thin pr-2"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Drop hint when dragging into empty or foreign column */}
                {isOver && isDraggingAcross && (
                  <div
                    className={[
                      "flex items-center justify-center h-14 rounded-lg border-2 border-dashed",
                      `${config.borderColor}/40 ${config.color}`,
                      "text-xs font-medium opacity-70",
                      "transition-all duration-150",
                    ].join(" ")}
                  >
                    Move here
                  </div>
                )}

                {colApps.length === 0 && !isOver ? (
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
                    <div
                      key={app.id}
                      id={`card-${app.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={handleDragEnd}
                      onDragEnter={() => handleCardDragEnter(app.id)}
                      className={[
                        "relative cursor-grab active:cursor-grabbing transition-all duration-150",
                        draggingId === app.id ? "scale-95" : "",
                        dragOverId === app.id && draggingId !== app.id
                          ? "translate-y-1"
                          : "",
                        syncingId === app.id ? "opacity-60" : "",
                        errorId === app.id
                          ? "ring-2 ring-red-500/60 rounded-xl"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{
                        animationDelay: `${i * 40}ms`,
                        animationFillMode: "backwards",
                      }}
                      title={
                        syncingId === app.id
                          ? "Saving…"
                          : errorId === app.id
                            ? "Failed to save — reverted"
                            : undefined
                      }
                    >
                      <ApplicationCard
                        application={app}
                        onUpdate={handleSave}
                        onDelete={handleDelete}
                      />
                      {/* Syncing spinner overlay */}
                      {syncingId === app.id && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <svg
                            className="w-4 h-4 animate-spin text-gold-400"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
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
