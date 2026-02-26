import {
  ContactMethod,
  ProjectCategory,
  RequestScope,
  RequestStatus,
  RequestType,
  ServiceType,
} from "@prisma/client";
import { z } from "zod";
import { normalizeNumericInput } from "@/lib/jalali";
import { MAX_UPLOAD_SIZE_BYTES, REQUEST_ALLOWED_MIME_TYPES, isAllowedMimeType } from "@/lib/upload";

const asNumberOrUndefined = (v: unknown) => {
  if (v === null || v === undefined || v === "") {
    return undefined;
  }

  const normalized = typeof v === "string" ? normalizeNumericInput(v) : String(v);
  const number = Number(normalized);
  return Number.isFinite(number) ? number : undefined;
};

export const signInSchema = z.object({
  email: z.email("ایمیل معتبر وارد کنید."),
  password: z.string().min(6, "رمز عبور حداقل ۶ کاراکتر باشد."),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "نام حداقل ۲ کاراکتر باشد."),
  phone: z.string().optional(),
});

export const requestSchema = z.object({
  type: z.enum(RequestType),
  projectType: z.enum(ProjectCategory),
  locationCityFa: z.string().min(2),
  addressFa: z.string().min(2),
  mapPinLat: z.number().optional(),
  mapPinLng: z.number().optional(),
  areaSqm: z.preprocess(asNumberOrUndefined, z.number().int().positive().optional()),
  scope: z.enum(RequestScope),
  budgetMin: z.preprocess(asNumberOrUndefined, z.number().int().positive().optional()),
  budgetMax: z.preprocess(asNumberOrUndefined, z.number().int().positive().optional()),
  budgetRangeText: z.string().optional(),
  timelineTarget: z.string().optional(),
  descriptionFa: z.string().min(10, "توضیحات حداقل ۱۰ کاراکتر باشد."),
  preferredContactMethod: z.enum(ContactMethod),
  meetingStartAt: z.string().optional(),
  meetingEndAt: z.string().optional(),
  availabilitySlotId: z.string().optional(),
  sourceProjectId: z.string().optional(),
  uploadedFiles: z
    .array(
      z.object({
        objectKey: z.string().min(3),
        fileName: z.string().min(1),
        fileType: z.string().min(1).refine((value) => isAllowedMimeType(value, REQUEST_ALLOWED_MIME_TYPES), {
          message: "نوع فایل مجاز نیست.",
        }),
        sizeBytes: z.number().int().positive().max(MAX_UPLOAD_SIZE_BYTES),
      }),
    )
    .optional(),
}).superRefine((value, ctx) => {
  if (value.type === "CONSULTATION" && !value.availabilitySlotId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availabilitySlotId"],
      message: "برای مشاوره باید زمان جلسه انتخاب شود.",
    });
  }

  if (
    value.budgetMin !== undefined &&
    value.budgetMax !== undefined &&
    value.budgetMin > value.budgetMax
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["budgetMax"],
      message: "حداکثر بودجه باید بزرگ‌تر یا مساوی حداقل بودجه باشد.",
    });
  }
});

export const requestStatusSchema = z.object({
  status: z.enum(RequestStatus),
  assignedToId: z.string().optional(),
  note: z.string().optional(),
});

export const estimateSchema = z.object({
  requestId: z.string(),
  costAmount: z.preprocess(asNumberOrUndefined, z.number().positive()),
  timeEstimateText: z.string().min(2),
  nextStepsFa: z.string().min(2),
});

export const projectSchema = z.object({
  slug: z.string().min(3),
  titleFa: z.string().min(2),
  titleEn: z.string().optional(),
  category: z.enum(ProjectCategory),
  locationFa: z.string().min(2),
  year: z.preprocess(asNumberOrUndefined, z.number().int().min(1300).max(2100)),
  areaSqm: z.preprocess(asNumberOrUndefined, z.number().int().positive()),
  scopeFa: z.string().min(2),
  servicesProvided: z.array(z.enum(ServiceType)).min(1),
  descriptionFa: z.string().min(20),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  coverImageUrl: z.string().url(),
  media: z
    .array(
      z.object({
        url: z.string().url(),
        altFa: z.string().min(1),
        type: z.enum(["IMAGE", "VIDEO"]),
        order: z.number().int().nonnegative(),
      }),
    )
    .optional(),
  metaTitleFa: z.string().optional(),
  metaDescriptionFa: z.string().optional(),
});

export const contentBlockSchema = z.object({
  key: z.string().min(2),
  contentFa: z.any(),
  contentEn: z.any().optional(),
});

export const availabilitySchema = z.object({
  startAt: z.string(),
  endAt: z.string(),
  repeatWeeks: z.preprocess(asNumberOrUndefined, z.number().int().min(1).max(24).optional()),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.email().optional().or(z.literal("")),
  message: z.string().min(10),
  type: z.enum(["ESTIMATE", "CONTACT"]),
});
