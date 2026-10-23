import { t } from '@/shared/i18n';
import type { Language } from '@/shared/types';

const ACTIVE_COLOR = '#C62828';

export async function setActiveBadge(language: Language): Promise<void> {
  try {
    await chrome.action.setBadgeBackgroundColor({ color: ACTIVE_COLOR });
    await chrome.action.setBadgeText({ text: t('badgeActive', language) });
  } catch {
    /* l'API badge peut être indisponible (mode test) */
  }
}

export async function clearBadge(): Promise<void> {
  try {
    await chrome.action.setBadgeText({ text: '' });
  } catch {
    /* ignore */
  }
}
