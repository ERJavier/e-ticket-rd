"use client";

import { useParams } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";

// Import all message files using relative paths
// Path from src/components/ -> messages/ = ../../messages/
import deMessages from "../../messages/de.json";
import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";
import frMessages from "../../messages/fr.json";
import itMessages from "../../messages/it.json";

import type { Locale } from "@/i18n/config";

const messagesByLocale: Record<Locale, Record<string, unknown>> = {
  de: deMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
  es: esMessages as Record<string, unknown>,
  fr: frMessages as Record<string, unknown>,
  it: itMessages as Record<string, unknown>,
};

// Type-safe message getter function
const getMessagesForLocale = (
  locale: Locale
): Record<string, unknown> | null => {
  switch (locale) {
    case "de":
      return messagesByLocale.de;
    case "en":
      return messagesByLocale.en;
    case "es":
      return messagesByLocale.es;
    case "fr":
      return messagesByLocale.fr;
    case "it":
      return messagesByLocale.it;
    default:
      return null;
  }
};

interface I18nProviderProps {
  children: React.ReactNode;
  initialMessages: Record<string, unknown>;
  initialLocale: Locale;
}

export function I18nProvider({
  children,
  initialMessages,
  initialLocale,
}: I18nProviderProps) {
  const params = useParams();
  const currentLocale = (params.locale as Locale) || initialLocale;
  const [messages, setMessages] = useState(initialMessages);
  const [locale, setLocale] = useState(initialLocale);

  useEffect(() => {
    // When the locale in the URL changes, load the corresponding messages
    if (currentLocale !== locale) {
      const newMessages = getMessagesForLocale(currentLocale);
      if (newMessages) {
        setMessages(newMessages);
        setLocale(currentLocale);
      }
    }
  }, [currentLocale, locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
