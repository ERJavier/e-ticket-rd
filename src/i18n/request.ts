import { getRequestConfig } from "next-intl/server";

import { defaultLocale, locales } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` is derived from the `[locale]` route segment and/or middleware.
  // Avoid `cookies()` here so builds can prerender safely.
  let locale = await requestLocale;

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
