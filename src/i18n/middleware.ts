import createMiddleware from "next-intl/middleware";

import { defaultLocale, locales } from "./config";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Match all pathnames except for
  // - API routes (/api/*)
  // - Static files (e.g., /favicon.ico)
  // - _next (Next.js internals)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
