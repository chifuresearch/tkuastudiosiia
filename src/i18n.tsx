import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { "about_content": "Architectural Digital Twin Lab..." } },
    zh: { translation: { "about_content": "建築數位孿生研究室..." } }
  },
  lng: "zh",
  fallbackLng: "en",
});

export default i18n;