import { z } from "zod";
import type { ZodError } from "zod";

// Adjust this list to exactly match your ApplicationStatus union in lib/types.
const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "interview",
  "in_progress",
  "offer",
  "rejected",
] as const;

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

const optionalDateString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional()
  .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), {
    message: "Enter a valid date",
  });

export const applicationSchema = z
  .object({
    company_name: z
      .string()
      .trim()
      .min(1, "Company name is required")
      .max(120, "Company name is too long"),
    job_title: z
      .string()
      .trim()
      .min(1, "Job title is required")
      .max(150, "Job title is too long"),
    status: z.enum(APPLICATION_STATUSES, {
      error: "Select a valid status",
    }),
    job_url: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : v))
      .optional()
      .refine((v) => !v || z.string().url().safeParse(v).success, {
        message: "Enter a valid URL (include https://)",
      }),
    location: optionalTrimmedString,
    salary_range: optionalTrimmedString.pipe(
      z.string().max(60, "Keep this under 60 characters").optional(),
    ),
    notes: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : v))
      .optional()
      .refine((v) => !v || v.length <= 2000, {
        message: "Notes must be under 2000 characters",
      }),
    applied_date: optionalDateString,
    followup_date: optionalDateString,
  })
  .refine(
    (data) => {
      if (!data.applied_date || !data.followup_date) return true;
      return new Date(data.followup_date) >= new Date(data.applied_date);
    },
    {
      message: "Follow-up date can't be before the applied date",
      path: ["followup_date"],
    },
  );

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
export type ApplicationFormErrors = Partial<
  Record<keyof ApplicationFormValues, string>
>;

export function flattenZodErrors(error: ZodError): ApplicationFormErrors {
  const out: ApplicationFormErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ApplicationFormValues | undefined;
    if (key && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}
