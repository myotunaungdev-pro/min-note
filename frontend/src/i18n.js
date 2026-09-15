import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import myTranslation from './locales/my.json';
import thTranslation from './locales/th.json';

// Consolidates all static language JSON files into a single resource map for the i18next instance
const resources = {
    en: { translation: enTranslation },
    my: { translation: myTranslation },
    th: { translation: thTranslation }
};

const getSavedLanguage = () => {
    try {
        return localStorage.getItem('appLanguage') || 'en';
    } catch (e) {
        return 'en';
    }
};

// Initializes the i18next core plugin with React bindings to enable useTranslation hooks across the app
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: getSavedLanguage(),
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
