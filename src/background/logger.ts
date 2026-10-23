import { ExtLogger } from '@/shared/logger';
import { getDebug, getSession } from '@/shared/storage';

export const logger = new ExtLogger('info');

logger.addSink((entry) => {
  void (async () => {
    const session = await getSession();
    if (!session) return;
    try {
      await chrome.tabs.sendMessage(session.tabId, { type: 'LOG', entry });
    } catch {
      /* l'onglet peut avoir été fermé entre-temps */
    }
  })();
});

export async function loadLoggerLevel(): Promise<void> {
  logger.setLevel((await getDebug()) ? 'debug' : 'info');
}
