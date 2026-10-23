import { t } from '@/shared/i18n';
import { sanitizeEventPayload } from '@/shared/protocol';
import { getSessionLanguage } from '@/shared/storage';
import type { EventPayload } from '@/shared/types';
import { logger } from './logger';

export async function forwardEvent(tabId: number, payload: EventPayload): Promise<boolean> {
  const language = await getSessionLanguage();
  const safe = sanitizeEventPayload(payload);
  if (!safe) {
    logger.warn('background', t('logEventRejected', language), { type: payload.type });
    return false;
  }

  try {
    await chrome.tabs.sendMessage(tabId, { type: 'FORWARD_EVENT', payload: safe });
    logger.info('background', t('logEventEmitted', language, safe.type));
    return true;
  } catch (error) {
    logger.debug('background', t('logEventForwardFailed', language, safe.type), {
      error: String(error),
    });
    return false;
  }
}
