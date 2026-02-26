import { cookies } from "next/headers";

export type Lang = "fa" | "en";

export async function getCurrentLang(): Promise<Lang> {
  const jar = await cookies();
  const lang = jar.get("lang")?.value;
  return lang === "en" ? "en" : "fa";
}

export function t(lang: Lang, fa: string, en: string) {
  return lang === "en" ? en : fa;
}
