import {
  ContactMethod,
  ProjectCategory,
  RequestScope,
  RequestStatus,
  RequestType,
  ServiceType,
} from "@prisma/client";

export const APP_NAME_FA = "فرما";
export const APP_NAME_EN = "Forma";
export const APP_SITE_NAME = "فرما | Forma";

export const roleLabelsFa: Record<string, string> = {
  SUPER_ADMIN: "سوپر ادمین",
  ADMIN: "ادمین",
  EDITOR: "ادیتور",
  SALES: "فروش",
  CLIENT: "کاربر",
};

export const projectCategoryLabelsFa: Record<ProjectCategory, string> = {
  RESIDENTIAL: "مسکونی",
  VILLA: "ویلا",
  COMMERCIAL: "تجاری",
  OFFICE: "اداری",
  CAFE: "کافه",
  RESTAURANT: "رستوران",
};

export const serviceTypeLabelsFa: Record<ServiceType, string> = {
  ARCHITECTURE: "معماری",
  INTERIOR: "طراحی داخلی",
  RENOVATION: "بازسازی",
  DESIGN_BUILD: "طراحی-ساخت",
};

export const requestTypeLabelsFa: Record<RequestType, string> = {
  ESTIMATE: "درخواست برآورد",
  CONSULTATION: "درخواست مشاوره",
};

export const requestStatusLabelsFa: Record<RequestStatus, string> = {
  NEW: "جدید",
  IN_REVIEW: "در حال بررسی",
  NEEDS_INFO: "نیاز به اطلاعات",
  ESTIMATE_SENT: "برآورد ارسال شد",
  MEETING_SCHEDULED: "جلسه تنظیم شد",
  WON: "موفق",
  LOST: "ناموفق",
  ARCHIVED: "بایگانی",
};

export const requestScopeLabelsFa: Record<RequestScope, string> = {
  DESIGN_ONLY: "فقط طراحی",
  DESIGN_BUILD: "طراحی + اجرا",
  RENOVATION: "بازسازی",
};

export const contactMethodLabelsFa: Record<ContactMethod, string> = {
  PHONE: "تلفن",
  WHATSAPP: "واتساپ",
  EMAIL: "ایمیل",
};

export const statusFlow: RequestStatus[] = [
  "NEW",
  "IN_REVIEW",
  "NEEDS_INFO",
  "ESTIMATE_SENT",
  "MEETING_SCHEDULED",
  "WON",
  "LOST",
  "ARCHIVED",
];
