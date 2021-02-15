import IntlMessageFormat from "intl-messageformat";

export const defaultLocale = "fr";

const MESSAGES = {
  fr: {
    'My String': 'Ma string',
  },
  en: {
    'My String': 'My string',
  }
};

export const getCurrentlocale = () => (typeof window.LOCALE !== "undefined" ? window.LOCALE : defaultLocale);

export const getMessage = ID => {
  const locale = getCurrentlocale();
  try {
    const msg = new IntlMessageFormat(MESSAGES[`${locale}`][ID], defaultLocale);
    return msg ? msg.format() : ID;
  } catch (error) {
    return ID;
  }
};

export default getMessage;
