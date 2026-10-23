import { EventType } from '@/shared/events';
import { t } from '@/shared/i18n';
import type { SystemReason } from '@/shared/protocol';
import { logger } from './logger';
import { forwardEvent } from './forwardEvent';

export interface SystemEnvironmentReport {
  reasons: SystemReason[];
  displayCount: number;
}

export async function detectSystemEnvironment(): Promise<SystemEnvironmentReport> {
  try {
    const displays = await chrome.system.display.getInfo();
    const displayCount = Array.isArray(displays) ? displays.length : 0;
    const reasons: SystemReason[] = [];
    if (displays.some((display) => display.bounds.width < 800 || display.bounds.height < 600)) {
      reasons.push('abnormal_resolution');
    }
    if (displayCount > 1) reasons.push('multiple_displays');
    return { reasons, displayCount };
  } catch {
    return { reasons: [], displayCount: 0 };
  }
}

export async function runSystemEnvironmentCheck(
  tabId: number,
  language: 'fr' | 'en',
): Promise<void> {
  const report = await detectSystemEnvironment();
  if (report.reasons.length === 0) return;
  logger.info('detectors', t('logEnvironmentSuspicious', language, report.reasons.join(', ')), {
    reasons: report.reasons,
  });
  await forwardEvent(tabId, {
    type: EventType.SUSPICIOUS_ENVIRONMENT,
    reasons: report.reasons,
    display_count: report.displayCount,
  });
}
