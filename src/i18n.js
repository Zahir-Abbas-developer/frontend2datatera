import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from "i18next-http-backend";

// Get saved language from localStorage, or fallback to "en"
const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    lng: savedLanguage, // Use saved language
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json",
    },
  });

export default i18n;
