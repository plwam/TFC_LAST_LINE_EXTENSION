import { t } from '@/shared/i18n';
import {
  domainFromUrl,
  isTestHost,
  normalizeHost,
} from '@/shared/protocol';
import {
  getAllowlistCache,
  getEnabled,
  getSessionLanguage,
  getTestHosts,
  setAllowlistCache,
} from '@/shared/storage';
import type { AllowlistCache } from '@/shared/types';
import { logger } from './logger';

export const STALE_AFTER_MS = 2 * 60 * 60 * 1000;
export const REFRESH_INTERVAL_MINUTES = 30;
const FETCH_TIMEOUT_MS = 10_000;

let inFlight: Promise<boolean> | null = null;

export function hostMatches(hostname: string, hosts: readonly string[]): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return hosts.some((entry) => {
    const allowed = normalizeHost(entry);
    return !!allowed && (host === allowed || host.endsWith(`.${allowed}`));
  });
}

export async function fetchAllowlist(fetchImpl: typeof fetch = fetch): Promise<string[]> {
  const controller = typeof AbortController === 'undefined' ? undefined : new AbortController();
  const timer = controller
    ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    : undefined;
  try {
    const response = await fetchImpl(`${__API_BASE_URL__}/public/registered-hosts/`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller?.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = (await response.json()) as { hosts?: unknown };
    if (!Array.isArray(body.hosts)) throw new Error('réponse invalide');
    const hosts = body.hosts
      .filter((host): host is string => typeof host === 'string')
      .map((host) => normalizeHost(domainFromUrl(host) ?? host))
      .filter((host) => host.length > 0);
    return [...new Set(hosts)].sort();
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

async function doRefresh(): Promise<boolean> {
  const language = await getSessionLanguage();
  try {
    const hosts = await fetchAllowlist();
    const cache: AllowlistCache = { hosts, fetchedAt: Date.now() };
    await setAllowlistCache(cache);
    logger.info('allowlist', t('logAllowlistFetched', language, String(hosts.length)), {
      count: hosts.length,
    });
    return true;
  } catch (error) {
    logger.warn('allowlist', t('logAllowlistFailed', language, String(error)));
    return false;
  }
}

export function refreshAllowlist(): Promise<boolean> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export async function isHostAllowed(hostname: string): Promise<boolean> {
  const host = normalizeHost(hostname);
  if (!host) return false;
  if (!(await getEnabled())) return false;

  const language = await getSessionLanguage();

  if (__DEV__ && (await getTestHosts()) && isTestHost(host)) {
    logger.debug('allowlist', t('logHostAllowed', language, host), { host });
    return true;
  }

  const cache = await getAllowlistCache();
  if (!cache) return false;
  if (Date.now() - cache.fetchedAt > STALE_AFTER_MS) {
    logger.info('allowlist', t('logAllowlistStale', language), {
      age_ms: Date.now() - cache.fetchedAt,
    });
    void refreshAllowlist();
  }

  return hostMatches(host, cache.hosts);
}

export async function getAllowlistInfo(): Promise<{
  count: number;
  fetchedAt?: number;
  stale: boolean;
}> {
  const cache = await getAllowlistCache();
  if (!cache) return { count: 0, stale: true };
  return {
    count: cache.hosts.length,
    fetchedAt: cache.fetchedAt,
    stale: Date.now() - cache.fetchedAt > STALE_AFTER_MS,
  };
}
