"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Application,
  ApplicationStatus,
  STATUS_ORDER,
  STATUS_CONFIG,
} from "@/lib/types";
import { createApplication, updateApplication } from "@/actions/applications";
import { X, Loader2 } from "lucide-react";
import { useToast } from "@/app/contexts/ToastContext";
import DiscardChangesDialog from "../components/DiscardChangeDialog";
import {
  applicationSchema,
  flattenZodErrors,
  type ApplicationFormErrors,
} from "@/lib/schemas/application";

interface ApplicationFormProps {
  application?: Application;
  defaultStatus?: ApplicationStatus;
  onClose: () => void;
  onSave: (app: Application) => void;
}

const INPUT_CLASS =
  "w-full bg-ink-800 border border-ink-600 rounded-xl px-3.5 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:outline-none focus:border-gold-400/50 focus:ring-1 focus:ring-gold-400/20 transition-all";

const INPUT_ERROR_CLASS =
  "border-red-500/60 focus:border-red-500/60 focus:ring-red-500/20";

const LABEL_CLASS =
  "block text-xs font-medium text-ink-300 uppercase tracking-wider mb-1.5";

function buildOptimistic(
  formData: FormData,
  application?: Application,
  idOverride?: string,
): Application {
  const now = new Date().toISOString();
  return {
    id: idOverride ?? application?.id ?? "",
    user_id: application?.user_id ?? "",
    company_name: formData.get("company_name") as string,
    job_title: formData.get("job_title") as string,
    status: formData.get("status") as ApplicationStatus,
    job_url: (formData.get("job_url") as string) || null,
    location: (formData.get("location") as string) || null,
    salary_range: (formData.get("salary_range") as string) || null,
    notes: (formData.get("notes") as string) || null,
    applied_date: (formData.get("applied_date") as string) || null,
    followup_date: (formData.get("followup_date") as string) || null,
    created_at: application?.created_at ?? now,
    updated_at: now,
  };
}

export default function ApplicationForm({
  application,
  defaultStatus = "wishlist",
  onClose,
  onSave,
}: ApplicationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplicationFormErrors>({});
  const [optimisticId, setOptimisticId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [mouseDownOnBackdrop, setMouseDownOnBackdrop] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  // Guards against SSR mismatch — document.body only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!optimisticId) {
      try {
        setOptimisticId(crypto.randomUUID());
      } catch {
        setOptimisticId(`temp-${Date.now()}`);
      }
    }
  }, [optimisticId]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Close on Escape for good measure.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") attemptClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const isEdit = !!application;

  // Confirms before discarding unsaved changes, otherwise closes immediately.
  function attemptClose() {
    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    onClose();
  }

  function handleBackdropMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    setMouseDownOnBackdrop(e.target === e.currentTarget);
  }

  function handleBackdropMouseUp(e: React.MouseEvent<HTMLDivElement>) {
    if (mouseDownOnBackdrop && e.target === e.currentTarget) {
      attemptClose();
    }
    setMouseDownOnBackdrop(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    // Validate client-side input shape before hitting the server action.
    const parsed = applicationSchema.safeParse(raw);

    if (!parsed.success) {
      const errors = flattenZodErrors(parsed.error);
      setFieldErrors(errors);
      setError("Please fix the highlighted fields");
      return;
    }

    setLoading(true);
    const companyName = parsed.data.company_name;
    const result = isEdit
      ? await updateApplication(application.id, formData)
      : await createApplication(formData);

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      setLoading(false);
      showToast(
        "error",
        result.error ?? `Failed to ${isEdit ? "update" : "add"} application`,
      );
      return;
    }

    const idForOptimistic = isEdit
      ? application!.id
      : (optimisticId ??
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `temp-${Date.now()}`));

    onSave(buildOptimistic(formData, application, idForOptimistic));
    showToast(
      "success",
      isEdit
        ? `${companyName} updated successfully`
        : `${companyName} added successfully`,
    );
    setIsDirty(false);
    onClose();
    router.refresh();
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-form-title"
    >
      <div
        className="absolute inset-0 bg-ink-950/90"
        onMouseDown={handleBackdropMouseDown}
        onMouseUp={handleBackdropMouseUp}
      />

      <div
        className="relative z-10 w-full max-w-lg bg-ink-900 border border-ink-700 rounded-2xl shadow-card-hover max-h-[90vh] flex flex-col animate-fade-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-700">
          <h2
            id="app-form-title"
            className="font-display text-xl font-semibold text-ink-50"
          >
            {isEdit ? "Edit Application" : "Add Application"}
          </h2>
          <button
            onClick={attemptClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-100 hover:bg-ink-700 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-thin flex-1">
          <form
            id="app-form"
            onSubmit={handleSubmit}
            onChange={() => setIsDirty(true)}
            noValidate
            className="p-6 space-y-5"
          >
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={LABEL_CLASS}>Company Name *</label>
                <input
                  name="company_name"
                  type="text"
                  defaultValue={application?.company_name}
                  placeholder="Google, Meta, Stripe…"
                  className={`${INPUT_CLASS} ${
                    fieldErrors.company_name ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.company_name && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.company_name}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className={LABEL_CLASS}>Job Title *</label>
                <input
                  name="job_title"
                  type="text"
                  defaultValue={application?.job_title}
                  placeholder="Senior Software Engineer"
                  className={`${INPUT_CLASS} ${
                    fieldErrors.job_title ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.job_title && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.job_title}
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className={LABEL_CLASS}>Status *</label>
                <select
                  name="status"
                  defaultValue={application?.status ?? defaultStatus}
                  className={`${INPUT_CLASS} ${
                    fieldErrors.status ? INPUT_ERROR_CLASS : ""
                  }`}
                >
                  {STATUS_ORDER.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
                {fieldErrors.status && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.status}
                  </p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className={LABEL_CLASS}>Location</label>
                <input
                  name="location"
                  type="text"
                  defaultValue={application?.location ?? ""}
                  placeholder="San Francisco, CA"
                  className={`${INPUT_CLASS} ${
                    fieldErrors.location ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.location && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.location}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className={LABEL_CLASS}>Job URL</label>
                <input
                  name="job_url"
                  type="text"
                  defaultValue={application?.job_url ?? ""}
                  placeholder="https://jobs.example.com/…"
                  className={`${INPUT_CLASS} ${
                    fieldErrors.job_url ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.job_url && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.job_url}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className={LABEL_CLASS}>Salary Range</label>
                <input
                  name="salary_range"
                  type="text"
                  defaultValue={application?.salary_range ?? ""}
                  placeholder="₱120k - ₱160k"
                  className={`${INPUT_CLASS} ${
                    fieldErrors.salary_range ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.salary_range && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.salary_range}
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>Applied Date</label>
                <input
                  name="applied_date"
                  type="date"
                  defaultValue={application?.applied_date ?? ""}
                  className={`${INPUT_CLASS} [&::-webkit-calendar-picker-indicator]:filter-[invert(0.8)_sepia(1)_saturate(3)_hue-rotate(10deg)] ${
                    fieldErrors.applied_date ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.applied_date && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.applied_date}
                  </p>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>Follow-up Date</label>
                <input
                  name="followup_date"
                  type="date"
                  defaultValue={application?.followup_date ?? ""}
                  className={`${INPUT_CLASS} [&::-webkit-calendar-picker-indicator]:filter-[invert(0.8)_sepia(1)_saturate(3)_hue-rotate(10deg)] ${
                    fieldErrors.applied_date ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.followup_date && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.followup_date}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className={LABEL_CLASS}>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={application?.notes ?? ""}
                  placeholder="Add any notes, contacts, or follow-up info…"
                  className={`${INPUT_CLASS} resize-none ${
                    fieldErrors.notes ? INPUT_ERROR_CLASS : ""
                  }`}
                />
                {fieldErrors.notes && (
                  <p className="mt-1 text-xs text-red-400">
                    {fieldErrors.notes}
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-ink-700 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={attemptClose}
            className="px-4 py-2 rounded-xl text-sm text-ink-300 hover:text-ink-100 hover:bg-ink-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="app-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-gold-400 hover:bg-gold-300 text-ink-950 transition-all disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Application"}
          </button>
        </div>
      </div>

      {showDiscardDialog && (
        <DiscardChangesDialog
          onClose={() => setShowDiscardDialog(false)}
          onConfirm={() => {
            setShowDiscardDialog(false);
            setIsDirty(false);
            showToast("error", "Changes discarded");
            onClose();
          }}
        />
      )}
    </div>,
    document.body,
  );
}
