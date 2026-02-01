export type Locale = (typeof locales)[number];

export const locales = ["en", "es", "fr", "de", "it"] as const;
export const defaultLocale: Locale = "es";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇩🇴",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
};
