import { redirect } from "next/navigation";

// This page redirects to the default locale
// The middleware will handle locale detection and routing
export default function RootPage() {
  redirect("/es");
}
