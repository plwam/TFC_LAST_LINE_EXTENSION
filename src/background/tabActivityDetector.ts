import { EventType } from '@/shared/events';
import { t } from '@/shared/i18n';
import { domainFromUrl } from '@/shared/protocol';
import {
  clearSession,
  getSession,
  patchSession,
} from '@/shared/storage';
import { clearBadge } from './badge';
import { forwardEvent } from './forwardEvent';
import { logger } from './logger';

export async function onTabActivated(tabId: number): Promise<void> {
  const session = await getSession();
  if (!session) return;

  if (tabId === session.tabId) {
    if (session.awaySince === undefined) return;
    const duration = Date.now() - session.awaySince;
    await patchSession({ awaySince: undefined });
    await forwardEvent(session.tabId, {
      type: EventType.TAB_CHANGE_EXT,
      duration_ms: duration,
    });
    return;
  }

  if (session.awaySince !== undefined) return;
  await patchSession({ awaySince: Date.now() });
  await forwardEvent(session.tabId, { type: EventType.TAB_CHANGE_EXT });
}

export async function onNavigationCommitted(details: {
  tabId: number;
  frameId: number;
  url: string;
}): Promise<void> {
  if (details.frameId !== 0) return;
  const session = await getSession();
  if (!session || details.tabId !== session.tabId) return;

  const domain = domainFromUrl(details.url);
  if (!domain || domain === session.examHost) return;

  await forwardEvent(session.tabId, { type: EventType.NAVIGATION_EXT, domain });
}

export async function onTabRemoved(tabId: number): Promise<void> {
  const session = await getSession();
  if (!session || session.tabId !== tabId) return;
  const language = session.language;
  await clearSession();
  await clearBadge();
  logger.warn('background', t('logTabLost', language));
}

export function registerTabActivityDetection(): void {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    void onTabActivated(tabId);
  });
  chrome.webNavigation.onCommitted.addListener((details) => {
    void onNavigationCommitted(details);
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    void onTabRemoved(tabId);
  });
}
