import { t } from '@/shared/i18n';
import type { Language } from '@/shared/types';

const ICON = 'icons/icon128.png';

async function notify(id: string, title: string, message: string): Promise<void> {
  try {
    await chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: ICON,
      title,
      message,
    });
  } catch {
    /* notifications refusées ou API indisponible */
  }
}

export async function notifyEnabled(language: Language): Promise<void> {
  await notify(
    `enabled-${Date.now()}`,
    t('notifEnabledTitle', language),
    t('notifEnabledBody', language),
  );
}

export async function notifyDisabled(language: Language): Promise<void> {
  await notify(
    `disabled-${Date.now()}`,
    t('notifDisabledTitle', language),
    t('notifDisabledBody', language),
  );
}
