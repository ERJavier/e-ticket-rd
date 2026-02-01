import { cookies } from "next/headers";

import { defaultLocale, locales, type Locale } from "./config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(COOKIE_NAME)?.value;

  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale;
  }

  return defaultLocale;
}

export async function setUserLocale(locale: Locale): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, locale);
}
