import { getTranslations } from "next-intl/server";

import { FormContainer } from "@/components/forms/eticket-form-container";

import type { ApplicationData } from "@/lib/schemas/forms";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: `${t("title")} | Form`,
    description: t("description"),
  };
}

interface FormPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ import?: string }>;
}

export default async function FormPage({
  params,
  searchParams,
}: FormPageProps) {
  // Await params and searchParams in Next.js 15

  const { locale: _locale } = await params;
  const queryParams = await searchParams;

  // Decode imported data from URL parameter (server-side)
  let importedData: Partial<ApplicationData> | undefined;

  if (queryParams.import) {
    try {
      const decodedData = atob(decodeURIComponent(queryParams.import));
      importedData = JSON.parse(decodedData);
    } catch (error) {
      // Invalid data in URL - ignore silently
      // eslint-disable-next-line no-console
      console.warn("Invalid import data in URL:", error);
    }
  }

  return (
    <FormContainer
      initialData={importedData}
      config={{
        showApplicationCode: true,
        enableDraftRecovery: !importedData, // Disable draft recovery for imports
      }}
    />
  );
}
