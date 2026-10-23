export const REFRESH_ALARM = 'refresh-allowlist';
export const HEARTBEAT_ALARM = 'extension-heartbeat';

export const REFRESH_PERIOD_MINUTES = 30;
export const HEARTBEAT_PERIOD_MINUTES = 0.5;

export async function ensureAlarms(): Promise<void> {
  await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: REFRESH_PERIOD_MINUTES });
  await chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: HEARTBEAT_PERIOD_MINUTES });
}
