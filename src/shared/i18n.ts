import fr from '../../public/_locales/fr/messages.json';
import en from '../../public/_locales/en/messages.json';
import type { Language } from './types';

type MessageEntry = { message: string };
type MessagePack = Record<string, MessageEntry>;

const PACKS: Record<Language, MessagePack> = {
  fr: fr as MessagePack,
  en: en as MessagePack,
};

export function resolveLanguage(value: unknown): Language {
  return value === 'en' ? 'en' : 'fr';
}

export function browserLanguage(): Language {
  try {
    const ui = chrome.i18n.getUILanguage();
    return ui.toLowerCase().startsWith('en') ? 'en' : 'fr';
  } catch {
    return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en')
      ? 'en'
      : 'fr';
  }
}

function applySubstitutions(text: string, substitutions?: string | string[]): string {
  if (substitutions === undefined) return text;
  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  return values.reduce(
    (acc, value, index) => acc.replaceAll(`$${index + 1}`, value),
    text,
  );
}

/** Traduit une clé `_locales` dans la langue demandée, avec repli sur le français puis la clé. */
export function t(
  key: string,
  language: Language = browserLanguage(),
  substitutions?: string | string[],
): string {
  const entry = PACKS[language][key] ?? PACKS.fr[key];
  return applySubstitutions(entry?.message ?? key, substitutions);
}

export function formatDateTime(timestamp: number, language: Language): string {
  try {
    return new Intl.DateTimeFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toISOString();
  }
}
