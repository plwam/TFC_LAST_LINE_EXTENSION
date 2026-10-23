import { vi } from 'vitest';

type Store = Map<string, unknown>;

function createArea(store: Store) {
  return {
    async get(keys?: string | string[] | Record<string, unknown> | null): Promise<Record<string, unknown>> {
      if (keys === undefined || keys === null) return Object.fromEntries(store);
      const list = typeof keys === 'string' ? [keys] : Array.isArray(keys) ? keys : Object.keys(keys);
      const result: Record<string, unknown> = {};
      for (const key of list) {
        if (store.has(key)) result[key] = store.get(key);
      }
      return result;
    },
    async set(values: Record<string, unknown>): Promise<void> {
      for (const [key, value] of Object.entries(values)) store.set(key, value);
    },
    async remove(keys: string | string[]): Promise<void> {
      for (const key of Array.isArray(keys) ? keys : [keys]) store.delete(key);
    },
    async clear(): Promise<void> {
      store.clear();
    },
  };
}

const localStore: Store = new Map();
const sessionStore: Store = new Map();

const chromeMock = {
  runtime: {
    id: 'test-extension-id',
    getManifest: () => ({ version: '1.0.0' }),
    sendMessage: vi.fn(async () => undefined),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    onStartup: { addListener: vi.fn() },
  },
  storage: {
    local: createArea(localStore),
    session: createArea(sessionStore),
    onChanged: { addListener: vi.fn() },
  },
  tabs: {
    get: vi.fn(async () => ({ id: 1, url: 'https://examens.univ-a.edu/' })),
    sendMessage: vi.fn(async () => undefined),
    onActivated: { addListener: vi.fn() },
    onRemoved: { addListener: vi.fn() },
  },
  webNavigation: {
    onCommitted: { addListener: vi.fn() },
  },
  alarms: {
    create: vi.fn(async () => undefined),
    onAlarm: { addListener: vi.fn() },
  },
  action: {
    setBadgeBackgroundColor: vi.fn(async () => undefined),
    setBadgeText: vi.fn(async () => undefined),
  },
  notifications: {
    create: vi.fn(async () => 'id'),
  },
  system: {
    display: {
      getInfo: vi.fn(async () => []),
    },
  },
  i18n: {
    getUILanguage: () => 'fr-FR',
  },
};

export function installChromeMock(): void {
  Object.defineProperty(globalThis, 'chrome', {
    value: chromeMock,
    configurable: true,
    writable: true,
  });
}

installChromeMock();

export async function resetChromeStorage(): Promise<void> {
  await chromeMock.storage.local.clear();
  await chromeMock.storage.session.clear();
}
