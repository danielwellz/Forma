import dayjs from "dayjs";
import jalaliday from "jalaliday";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/fa";

dayjs.extend(utc);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);
dayjs.extend(jalaliday);

export function toFaDigits(value: string | number) {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}

export function toEnDigits(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

export function normalizeNumericInput(value: string) {
  return toEnDigits(value)
    .trim()
    .replace(/[,\u060C\u066C]/g, "")
    .replace(/[^\d.-]/g, "");
}

export function formatNumberFa(value: number | string) {
  const normalized = typeof value === "number" ? value : Number(normalizeNumericInput(value));
  if (!Number.isFinite(normalized)) {
    return "-";
  }

  return toFaDigits(normalized.toLocaleString("fa-IR"));
}

export function formatJalali(date: Date | string | null | undefined, withTime = false) {
  if (!date) {
    return "-";
  }

  const fmt = withTime ? "YYYY/MM/DD HH:mm" : "YYYY/MM/DD";
  return toFaDigits(dayjs(date).calendar("jalali").locale("fa").format(fmt));
}

export function formatCurrencyToman(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "-";
  }

  return `${toFaDigits(Math.round(amount).toLocaleString("fa-IR"))} تومان`;
}

export function formatCurrencyRial(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "-";
  }

  return `${toFaDigits(Math.round(amount).toLocaleString("fa-IR"))} ریال`;
}

export function formatDualCurrency(amount?: number | null) {
  if (amount === null || amount === undefined) {
    return "-";
  }

  const rial = Math.round(amount);
  const toman = Math.round(rial / 10);
  return `${formatCurrencyRial(rial)} (تقریبی: ${formatCurrencyToman(toman)})`;
}

export const toPersianDigits = toFaDigits;
export const toEnglishDigits = toEnDigits;
