export const defaultLocale = "fr";

const MESSAGES = {
  fr: {
    'My String': 'Ma string',
  },
  en: {
    'My String': 'My string',
  }
};

export const getCurrentlocale = () => (typeof MILL3WP.locale !== "undefined" ? MILL3WP.locale : defaultLocale);

export const getMessage = (ID) => {
  const locale = getCurrentlocale();
  const messagesForLocale = MESSAGES[locale] !== undefined ? MESSAGES[locale] : null;

  // if no messages for locale, return ID
  if( !messagesForLocale ) return ID;

  // return found message for current locale, or ID if not found
  return messagesForLocale[ID] !== undefined ? messagesForLocale[ID] : ID;
};

export default getMessage;
