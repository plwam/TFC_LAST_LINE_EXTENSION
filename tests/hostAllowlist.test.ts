import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAllowlist,
  hostMatches,
  isHostAllowed,
  refreshAllowlist,
} from '@/background/hostAllowlist';
import { KEYS } from '@/shared/storage';
import { installChromeMock, resetChromeStorage } from './setup';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('liste blanche d’hôtes', () => {
  beforeEach(async () => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    installChromeMock();
    await resetChromeStorage();
  });

  it('accepte le domaine exact et ses sous-domaines', () => {
    expect(hostMatches('examens.univ-a.edu', ['univ-a.edu'])).toBe(true);
    expect(hostMatches('univ-a.edu', ['univ-a.edu'])).toBe(true);
    expect(hostMatches('examens.univ-b.edu', ['univ-a.edu'])).toBe(false);
    expect(hostMatches('evil-univ-a.edu', ['univ-a.edu'])).toBe(false);
  });

  it('refuse tout sans cache (précaution par défaut)', async () => {
    expect(await isHostAllowed('examens.univ-a.edu')).toBe(false);
  });

  it('accepte un hôte présent dans un cache frais', async () => {
    await chrome.storage.local.set({
      [KEYS.allowlist]: { hosts: ['univ-a.edu'], fetchedAt: Date.now() },
    });
    expect(await isHostAllowed('examens.univ-a.edu')).toBe(true);
    expect(await isHostAllowed('autre.example.org')).toBe(false);
  });

  it('refuse tout quand l’extension est désactivée hors session', async () => {
    await chrome.storage.local.set({
      [KEYS.allowlist]: { hosts: ['univ-a.edu'], fetchedAt: Date.now() },
      [KEYS.enabled]: false,
    });
    expect(await isHostAllowed('examens.univ-a.edu')).toBe(false);
  });

  it('autorise localhost uniquement en développement et si l’option est active', async () => {
    expect(await isHostAllowed('localhost')).toBe(false);
    await chrome.storage.local.set({ [KEYS.testHosts]: true });
    expect(await isHostAllowed('localhost')).toBe(true);
    expect(await isHostAllowed('127.0.0.1')).toBe(true);
    expect(await isHostAllowed('localhost.evil.example')).toBe(false);
  });

  it('normalise les hôtes renvoyés par le backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({ hosts: ['https://Exam.Example.org/path', 'Exam.Example.org'], count: 2 }),
      ),
    );
    expect(await fetchAllowlist()).toEqual(['exam.example.org']);
  });

  it('conserve le cache quand le rafraîchissement échoue', async () => {
    const cache = { hosts: ['univ-a.edu'], fetchedAt: Date.now() };
    await chrome.storage.local.set({ [KEYS.allowlist]: cache });
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 500)));
    expect(await refreshAllowlist()).toBe(false);
    expect((await chrome.storage.local.get(KEYS.allowlist))[KEYS.allowlist]).toEqual(cache);
  });

  it('rafraîchit un cache périmé sans bloquer la vérification courante', async () => {
    await chrome.storage.local.set({
      [KEYS.allowlist]: { hosts: ['old.example'], fetchedAt: Date.now() - 3 * 60 * 60 * 1000 },
    });
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ hosts: ['new.example'] })));
    expect(await isHostAllowed('new.example')).toBe(false);
    await vi.waitFor(async () => {
      const stored = (await chrome.storage.local.get(KEYS.allowlist))[KEYS.allowlist] as {
        hosts: string[];
      };
      expect(stored.hosts).toContain('new.example');
    });
    expect(await isHostAllowed('new.example')).toBe(true);
  });

  it('refuse une liste vide', async () => {
    await chrome.storage.local.set({
      [KEYS.allowlist]: { hosts: [], fetchedAt: Date.now() },
    });
    expect(await isHostAllowed('examens.univ-a.edu')).toBe(false);
  });
});
