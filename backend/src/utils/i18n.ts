// https://react.i18next.com/guides/quick-start

import i18next from 'i18next';

import en_translations from '../locales/en/translation.json';
import de_translations from '../locales/de/translation.json';

// the translations
const resources = {
  en: {
    translation: en_translations,
  },
  de: {
    translation: de_translations,
  },
};

export async function init() {
  await i18next.init({
    // https://www.i18next.com/overview/configuration-options
    resources,
    initImmediate: true, // make this a blocking call, i.e. load translations synchronously. Should be fine for development and even for production in such a small app
    lng: 'de', // FIXME: Set this dynamically
    debug: true,

    keySeparator: false, // we do not use keys in form messages.welcome
    nsSeparator: false,

    interpolation: {
      escapeValue: false,
    },
  });
}

export const i18nextInstance = i18next;
