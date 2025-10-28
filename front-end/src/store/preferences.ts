import { create } from "zustand";
import { persist } from "zustand/middleware";

type Language = "en" | "vi";
type Currency = "USD" | "VND";
type ThemeMode = "light" | "dark";

interface PreferencesState {
  language: Language;
  currency: Currency;
  theme: ThemeMode;
  setLanguage: (lng: Language) => void;
  setCurrency: (cur: Currency) => void;
  setTheme: (mode: ThemeMode) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      language: "en",
      currency: "USD",
      theme: "light",
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "preferences-store" }
  )
);
