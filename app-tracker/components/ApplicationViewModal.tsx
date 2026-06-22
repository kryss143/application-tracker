"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Application, STATUS_CONFIG } from "@/lib/types";
import {
  MapPin,
  DollarSign,
  CalendarDays,
  ExternalLink,
  X,
} from "lucide-react";

interface ApplicationViewModalProps {
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}

const ROW_LABEL_CLASS =
  "text-xs font-medium text-ink-300 uppercase tracking-wider mb-1";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateStr));
}

export default function ApplicationViewModal({
  application,
  onClose,
  onEdit,
}: ApplicationViewModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Lock background scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!mounted) return null;

  const config = STATUS_CONFIG[application.status];

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/90" onClick={onClose} />

      <div
        className="relative z-10 w-full max-w-lg bg-ink-900 border border-ink-700 rounded-2xl shadow-card-hover max-h-[90vh] flex flex-col animate-fade-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-700">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-ink-50 truncate">
              {application.company_name}
            </h2>
            <p className="text-sm text-ink-400 truncate">
              {application.job_title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-thin flex-1 p-6 space-y-5">
          <div>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-medium ${config.badgeBg}`}
            >
              {config.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className={ROW_LABEL_CLASS}>Location</div>
              <div className="flex items-center gap-1.5 text-sm text-ink-100">
                <MapPin className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                <span className="truncate">{application.location || "—"}</span>
              </div>
            </div>

            <div>
              <div className={ROW_LABEL_CLASS}>Salary Range</div>
              <div className="flex items-center gap-1.5 text-sm text-ink-100">
                <DollarSign className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                <span className="truncate">
                  {application.salary_range || "—"}
                </span>
              </div>
            </div>

            <div>
              <div className={ROW_LABEL_CLASS}>Applied Date</div>
              <div className="flex items-center gap-1.5 text-sm text-ink-100">
                <CalendarDays className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                <span>{formatDate(application.applied_date)}</span>
              </div>
            </div>

            <div>
              <div className={ROW_LABEL_CLASS}>Follow-up Date</div>
              <div className="flex items-center gap-1.5 text-sm text-ink-100">
                <CalendarDays className="w-3.5 h-3.5 text-ink-500 shrink-0" />
                <span>{formatDate(application.followup_date)}</span>
              </div>
            </div>

            {application.job_url && (
              <div className="col-span-2">
                <div className={ROW_LABEL_CLASS}>Job URL</div>
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{application.job_url}</span>
                </a>
              </div>
            )}

            {application.notes && (
              <div className="col-span-2">
                <div className={ROW_LABEL_CLASS}>Notes</div>
                <p className="text-sm text-ink-200 whitespace-pre-wrap leading-relaxed">
                  {application.notes}
                </p>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-ink-700 text-xs text-ink-600 font-mono">
            Added {formatDate(application.created_at)}
          </div>
        </div>

        {/* Footer — view-only actions: Edit and Cancel */}
        <div className="px-6 py-4 border-t border-ink-700 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 hover:bg-ink-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-gold-400 hover:bg-gold-300 text-ink-950 transition-all"
          >
            Edit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
