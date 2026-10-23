import { formatDateTime, t } from '@/shared/i18n';
import { ExtLogger } from '@/shared/logger';
import type { ExtensionRuntimeState } from '@/shared/types';

const logger = new ExtLogger('info');

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Élément introuvable : ${id}`);
  return found as T;
}

const ui = {
  title: element<HTMLHeadingElement>('title'),
  devBadge: element<HTMLSpanElement>('dev-badge'),
  statusDot: element<HTMLSpanElement>('status-dot'),
  statusText: element<HTMLSpanElement>('status-text'),
  versionLabel: element<HTMLElement>('version-label'),
  version: element<HTMLElement>('version'),
  languageLabel: element<HTMLElement>('language-label'),
  language: element<HTMLElement>('language'),
  enabled: element<HTMLInputElement>('enabled'),
  enabledLabel: element<HTMLSpanElement>('enabled-label'),
  debug: element<HTMLInputElement>('debug'),
  debugLabel: element<HTMLSpanElement>('debug-label'),
  testHostsRow: element<HTMLLabelElement>('test-hosts-row'),
  testHosts: element<HTMLInputElement>('test-hosts'),
  testHostsLabel: element<HTMLSpanElement>('test-hosts-label'),
  allowlistHeading: element<HTMLHeadingElement>('allowlist-heading'),
  allowlistInfo: element<HTMLParagraphElement>('allowlist-info'),
  refresh: element<HTMLButtonElement>('refresh'),
  refreshResult: element<HTMLParagraphElement>('refresh-result'),
};

let state: ExtensionRuntimeState | undefined;

async function send<T>(message: Record<string, unknown>): Promise<T | undefined> {
  try {
    return (await chrome.runtime.sendMessage(message)) as T | undefined;
  } catch (error) {
    logger.warn('popup', t('refreshFailed'), { error: String(error) });
    return undefined;
  }
}

function render(): void {
  if (!state) return;
  const language = state.language;
  document.documentElement.lang = language;

  ui.title.textContent = t('popupTitle', language);
  ui.devBadge.textContent = t('devBuildLabel', language);
  ui.devBadge.classList.toggle('hidden', !state.dev);

  ui.statusDot.classList.toggle('active', !!state.session);
  ui.statusText.textContent = state.session
    ? t('statusActive', language)
    : t('statusNoSession', language);

  ui.versionLabel.textContent = t('versionLabel', language);
  ui.version.textContent = state.version;
  ui.languageLabel.textContent = t('languageLabel', language);
  ui.language.textContent = t(language === 'fr' ? 'languageFr' : 'languageEn', language);

  ui.enabled.checked = state.enabled;
  ui.enabled.disabled = !!state.session;
  ui.enabledLabel.textContent = t('enabledLabel', language);

  ui.debug.checked = state.debug;
  ui.debugLabel.textContent = t('debugLabel', language);

  ui.testHostsRow.classList.toggle('hidden', !state.dev);
  ui.testHosts.checked = state.testHosts;
  ui.testHostsLabel.textContent = t('testHostsLabel', language);

  ui.allowlistHeading.textContent = t('allowlistHeading', language);
  const count = t('allowlistCount', language, String(state.allowlist.count));
  const updated =
    state.allowlist.fetchedAt === undefined
      ? t('allowlistNever', language)
      : t(
          'allowlistUpdated',
          language,
          formatDateTime(state.allowlist.fetchedAt, language),
        );
  ui.allowlistInfo.textContent = `${count} — ${updated}`;
  ui.refresh.textContent = t('refreshAction', language);
}

async function reload(): Promise<void> {
  const next = await send<ExtensionRuntimeState>({ type: 'GET_STATE' });
  if (next) {
    state = next;
    render();
  }
}

ui.enabled.addEventListener('change', () => {
  void (async () => {
    await send({ type: 'SET_ENABLED', enabled: ui.enabled.checked });
    await reload();
  })();
});

ui.debug.addEventListener('change', () => {
  void (async () => {
    await send({ type: 'SET_DEBUG', debug: ui.debug.checked });
    await reload();
  })();
});

ui.testHosts.addEventListener('change', () => {
  void (async () => {
    await send({ type: 'SET_TEST_HOSTS', enabled: ui.testHosts.checked });
    await reload();
  })();
});

ui.refresh.addEventListener('click', () => {
  void (async () => {
    if (!state) return;
    ui.refresh.disabled = true;
    const response = await send<{ ok: boolean }>({ type: 'REFRESH_ALLOWLIST' });
    ui.refreshResult.textContent = t(
      response?.ok ? 'refreshDone' : 'refreshFailed',
      state.language,
    );
    ui.refresh.disabled = false;
    await reload();
  })();
});

void reload();
