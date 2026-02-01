"use client";

import { Check, Globe, Languages } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { locales, type Locale } from "@/i18n/config";
import { useRouter } from "@/i18n/navigation";

// Type-safe accessor functions
const getLocaleFlag = (locale: Locale): string => {
  switch (locale) {
    case "en":
      return "🇺🇸";
    case "es":
      return "🇩🇴";
    case "fr":
      return "🇫🇷";
    case "de":
      return "🇩🇪";
    case "it":
      return "🇮🇹";
    default:
      return "🏳️";
  }
};

const getLocaleLabel = (locale: Locale): string => {
  switch (locale) {
    case "en":
      return "English";
    case "es":
      return "Español";
    case "fr":
      return "Français";
    case "de":
      return "Deutsch";
    case "it":
      return "Italiano";
    default:
      return locale;
  }
};

export function LanguageSwitcher() {
  const t = useTranslations("navigation");
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params.locale as Locale) || "es";
  const [isPending, startTransition] = useTransition();

  // Remove locale prefix from pathname to get the path without locale
  const pathWithoutLocale = pathname.replace(/^\/(en|es|fr|de|it)/, "") || "/";

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    startTransition(() => {
      // Use router.replace to change locale while staying on the same page
      router.replace(pathWithoutLocale, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          aria-label={t("selectLanguage")}
          disabled={isPending}
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">
            <span aria-hidden="true">{getLocaleFlag(currentLocale)}</span>{" "}
            {getLocaleLabel(currentLocale)}
          </span>
          <span className="sm:hidden" aria-hidden="true">
            {getLocaleFlag(currentLocale)}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[200px]">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            className="cursor-pointer"
            onClick={() => handleLocaleChange(locale)}
            aria-current={currentLocale === locale ? "true" : undefined}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span aria-hidden="true">{getLocaleFlag(locale)}</span>
                <span>{getLocaleLabel(locale)}</span>
              </span>
              {currentLocale === locale && (
                <Check className="h-4 w-4" aria-hidden="true" />
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Alternative: Simple button version for mobile or compact layouts
export function LanguageSwitcherCompact() {
  const t = useTranslations("navigation");
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentLocale = (params.locale as Locale) || "es";

  const pathWithoutLocale = pathname.replace(/^\/(en|es|fr|de|it)/, "") || "/";

  // Get next locale in cycle
  const currentIndex = locales.indexOf(currentLocale);
  const nextLocale = locales[(currentIndex + 1) % locales.length];

  const handleLocaleChange = () => {
    router.replace(pathWithoutLocale, { locale: nextLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1 px-2"
      onClick={handleLocaleChange}
      aria-label={t("selectLanguage")}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      <span className="text-sm font-medium uppercase">{currentLocale}</span>
    </Button>
  );
}
