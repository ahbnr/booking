// https://react.i18next.com/guides/quick-start

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en_translations from './locales/en/translation.json';
import de_translations from './locales/de/translation.json';

import FrontendConfig from './booking-frontend.config';

const { REACT_APP_DEV_MODE } = process.env;

// the translations
const resources = {
  en: {
    translation: en_translations,
  },
  de: {
    translation: de_translations,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    // https://www.i18next.com/overview/configuration-options
    resources,
    initImmediate: true, // make this a blocking call, i.e. load translations synchronously. Should be fine for development and even for production in such a small app
    lng: FrontendConfig.language || 'de',
    debug: REACT_APP_DEV_MODE === '1',

    keySeparator: false, // we do not use keys in form messages.welcome
    nsSeparator: false,

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
