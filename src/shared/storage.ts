import type { ActiveSession, AllowlistCache, Language } from './types';
import { browserLanguage } from './i18n';

export const KEYS = {
  allowlist: 'host_allowlist_cache',
  session: 'active_session',
  language: 'session_language',
  enabled: 'extension_enabled',
  debug: 'debug_logging',
  testHosts: 'debug_allow_test_hosts',
} as const;

type SessionArea = NonNullable<typeof chrome.storage.session>;

async function read<T>(area: chrome.storage.StorageArea, key: string): Promise<T | undefined> {
  const result = await area.get(key);
  return result[key] as T | undefined;
}

export async function getSession(): Promise<ActiveSession | undefined> {
  return read<ActiveSession>(chrome.storage.session, KEYS.session);
}

export async function setSession(session: ActiveSession): Promise<void> {
  await chrome.storage.session.set({ [KEYS.session]: session });
}

export async function patchSession(patch: Partial<ActiveSession>): Promise<ActiveSession | undefined> {
  const current = await getSession();
  if (!current) return undefined;
  const next = { ...current, ...patch };
  await setSession(next);
  return next;
}

export async function clearSession(): Promise<void> {
  await chrome.storage.session.remove(KEYS.session);
}

export async function getSessionLanguage(): Promise<Language> {
  const language = await read<Language>(chrome.storage.session, KEYS.language);
  return language === 'en' ? 'en' : language === 'fr' ? 'fr' : browserLanguage();
}

export async function setSessionLanguage(language: Language): Promise<void> {
  await chrome.storage.session.set({ [KEYS.language]: language });
}

export async function clearSessionLanguage(): Promise<void> {
  await chrome.storage.session.remove(KEYS.language);
}

export async function getEnabled(): Promise<boolean> {
  return (await read<boolean>(chrome.storage.local, KEYS.enabled)) ?? true;
}

export async function setEnabled(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEYS.enabled]: enabled });
}

export async function getDebug(): Promise<boolean> {
  return (await read<boolean>(chrome.storage.local, KEYS.debug)) ?? false;
}

export async function setDebug(debug: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEYS.debug]: debug });
}

export async function getTestHosts(): Promise<boolean> {
  return (await read<boolean>(chrome.storage.local, KEYS.testHosts)) ?? false;
}

export async function setTestHosts(enabled: boolean): Promise<void> {
  await chrome.storage.local.set({ [KEYS.testHosts]: enabled });
}

export async function getAllowlistCache(): Promise<AllowlistCache | undefined> {
  return read<AllowlistCache>(chrome.storage.local, KEYS.allowlist);
}

export async function setAllowlistCache(cache: AllowlistCache): Promise<void> {
  await chrome.storage.local.set({ [KEYS.allowlist]: cache });
}

export function sessionArea(): SessionArea {
  return chrome.storage.session;
}
