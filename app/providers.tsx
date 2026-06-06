"use client";
import { AuthProvider } from "@/lib/session-client";
import { I18nProvider } from "@/lib/i18n";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>{children}</I18nProvider>
    </AuthProvider>
  );
}
