"use client";

import { AlertTriangle, X } from "lucide-react";

interface DiscardChangesDialogProps {
  onClose: () => void;
  onConfirm: () => void;
}

export default function DiscardChangesDialog({
  onClose,
  onConfirm,
}: DiscardChangesDialogProps) {
  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-ink-900 border border-ink-700 rounded-2xl shadow-card-hover animate-fade-slide-up">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink-50 mb-1">
                Discard Changes?
              </h3>
              <p className="text-sm text-ink-400">
                You have unsaved changes. Closing now will discard them. This
                cannot be undone.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-200 hover:bg-ink-700 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 hover:bg-ink-700 transition-all"
            >
              Keep Editing
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-400 text-white transition-all"
            >
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
