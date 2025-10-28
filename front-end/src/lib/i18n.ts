import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enCommon from "../locales/en/common.json";
import viCommon from "../locales/vi/common.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init(
    {
      fallbackLng: "en",
      debug: false,
      resources: {
        en: {
          common: enCommon,
        },
        vi: {
          common: viCommon,
        },
      },
      interpolation: {
        escapeValue: false,
      },
    },
    (err) => {
      if (err) {
        console.error("i18next initialization failed:", err);
      } else {
        console.log("i18next initialized successfully");
      }
    }
  );

export default i18n;
