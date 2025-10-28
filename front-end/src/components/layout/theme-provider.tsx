"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import { usePreferencesStore } from "@/store/preferences";

function ThemeSync() {
  const { theme, setTheme: setNextTheme } = useTheme();
  const prefTheme = usePreferencesStore((s) => s.theme);

  // When preferences change, update next-themes and html class
  useEffect(() => {
    if (prefTheme && prefTheme !== theme) {
      setNextTheme(prefTheme);
    }
  }, [prefTheme, theme, setNextTheme]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      if (prefTheme === "dark") html.classList.add("dark");
      else html.classList.remove("dark");
    }
  }, [prefTheme]);

  return null;
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      <ThemeSync />
      {children}
    </NextThemeProvider>
  );
}
