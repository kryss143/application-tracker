"use client";

import { useState } from "react";
import { Application, STATUS_CONFIG } from "@/lib/types";
import {
  MapPin,
  DollarSign,
  CalendarDays,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import ApplicationForm from "./ApplicationForm";
import DeleteDialog from "./DeleteDialog";

interface ApplicationCardProps {
  application: Application;
  onUpdate: (app: Application) => void;
  onDelete: (id: string) => void;
  style?: React.CSSProperties;
}

export default function ApplicationCard({
  application,
  onUpdate,
  onDelete,
  style,
}: ApplicationCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const config = STATUS_CONFIG[application.status];

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        style={style}
        className={`group relative bg-ink-800 border border-ink-700 rounded-xl p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-default border-l-2 ${config.borderColor}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <h3 className="font-medium text-ink-50 text-sm leading-snug truncate">
              {application.company_name}
            </h3>
            <p className="text-ink-400 text-xs mt-0.5 truncate">
              {application.job_title}
            </p>
          </div>

          {/* Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-200 hover:bg-ink-700 transition-all opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-ink-800 border border-ink-600 rounded-xl shadow-card-hover overflow-hidden min-w-[130px]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEdit(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-200 hover:bg-ink-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-ink-400" />
                    Edit
                  </button>
                  {application.job_url && (
                    <a
                      href={application.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowMenu(false)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-ink-200 hover:bg-ink-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-ink-400" />
                      Open URL
                    </a>
                  )}
                  <div className="border-t border-ink-600" />
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDelete(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-1.5">
          {application.location && (
            <div className="flex items-center gap-1.5 text-ink-500 text-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.location}</span>
            </div>
          )}
          {application.salary_range && (
            <div className="flex items-center gap-1.5 text-ink-500 text-xs">
              <DollarSign className="w-3 h-3 shrink-0" />
              <span className="truncate">{application.salary_range}</span>
            </div>
          )}
          {application.applied_date && (
            <div className="flex items-center gap-1.5 text-ink-500 text-xs">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span>Applied {formatDate(application.applied_date)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-ink-700 flex items-center justify-between">
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${config.badgeBg}`}>
            {config.label}
          </span>
          <span className="text-ink-600 text-xs font-mono">
            {formatDate(application.created_at) ?? ""}
          </span>
        </div>
      </div>

      {showEdit && (
        <ApplicationForm
          application={application}
          onClose={() => setShowEdit(false)}
          onSave={onUpdate}
        />
      )}

      {showDelete && (
        <DeleteDialog
          application={application}
          onClose={() => setShowDelete(false)}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
