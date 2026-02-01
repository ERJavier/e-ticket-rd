import { Geist, Geist_Mono } from "next/font/google";
import { getMessages, getTranslations } from "next-intl/server";

import { DemoBanner } from "@/components/demo-banner";
import { I18nProvider } from "@/components/i18n-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { defaultLocale, type Locale } from "@/i18n/config";

import type { Metadata } from "next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params: _params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: routeLocale } = await _params;
  const locale = routeLocale ?? defaultLocale;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}>) {
  const { locale: routeLocale } = await params;
  const locale = (routeLocale ?? defaultLocale) as Locale;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider initialLocale={locale} initialMessages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DemoBanner />
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
