import { ExtLogger } from '@/shared/logger';
import { getDebug } from '@/shared/storage';

export const logger = new ExtLogger('info');

logger.addSink((entry) => {
  try {
    void chrome.runtime
      .sendMessage({ type: 'CONTENT_LOG', entry })
      .catch(() => undefined);
  } catch {
    /* contexte d'extension invalidé (extension rechargée) */
  }
});

export async function syncContentLogLevel(): Promise<void> {
  logger.setLevel((await getDebug()) ? 'debug' : 'info');
}
