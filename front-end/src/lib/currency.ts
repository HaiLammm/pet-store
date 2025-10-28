import { usePreferencesStore } from "@/store/preferences";

export function formatCurrencyRaw(amount: number, currency: "USD" | "VND") {
  try {
    const locale = currency === "VND" ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function useCurrency() {
  const currency = usePreferencesStore((s) => s.currency);
  const fmt = (amount: number) => formatCurrencyRaw(amount, currency);
  return { currency, format: fmt };
}
