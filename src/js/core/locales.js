import IntlMessageFormat from "intl-messageformat";

export const defaultLocale = "fr";

const MESSAGES = {
  fr: {
    'My String': 'Ma string',
  },
  en: {
    'My String': 'Ma string',
  }
};

export const getMessage = ID => {
  const locale = window.LOCALE || defaultLocale;
  try {
    const msg = new IntlMessageFormat(MESSAGES[`${locale}`][ID], defaultLocale);
    return msg ? msg.format() : ID;
  } catch (error) {
    return ID;
  }
};

export default getMessage;
