import { HEARTBEAT_ALARM, REFRESH_ALARM, ensureAlarms } from './alarms';
import { clearBadge, setActiveBadge } from './badge';
import { runSystemEnvironmentCheck } from './environmentDetector';
import { forwardEvent } from './forwardEvent';
import {
  getAllowlistInfo,
  isHostAllowed,
  refreshAllowlist,
} from './hostAllowlist';
import { loadLoggerLevel, logger } from './logger';
import { notifyDisabled, notifyEnabled } from './notifications';
import { registerTabActivityDetection } from './tabActivityDetector';
import { browserLanguage, resolveLanguage, t } from '@/shared/i18n';
import { domainFromUrl, normalizeHost, sanitizeEventPayload } from '@/shared/protocol';
import {
  clearSession,
  clearSessionLanguage,
  getDebug,
  getEnabled,
  getSession,
  getSessionLanguage,
  getTestHosts,
  setDebug,
  setEnabled,
  setSession,
  setSessionLanguage,
  setTestHosts,
} from '@/shared/storage';
import type {
  ActiveSession,
  ExtensionRuntimeState,
  LogEntry,
  LogLevel,
  LogModule,
} from '@/shared/types';

const LOG_LEVELS: readonly LogLevel[] = ['debug', 'info', 'warn', 'error'];
const LOG_MODULES: readonly LogModule[] = [
  'background',
  'content',
  'popup',
  'alarms',
  'allowlist',
  'detectors',
  'bridge',
];

function isLogEntry(value: unknown): value is LogEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<LogEntry>;
  return (
    typeof entry.message === 'string' &&
    typeof entry.level === 'string' &&
    (LOG_LEVELS as readonly string[]).includes(entry.level) &&
    typeof entry.module === 'string' &&
    (LOG_MODULES as readonly string[]).includes(entry.module) &&
    (entry.context === undefined || (typeof entry.context === 'object' && entry.context !== null))
  );
}

/**
 * Sérialise les écritures de session : un `SESSION_ENDED` d'une ancienne instance du SDK ne doit
 * pas effacer la session tout juste créée par la nouvelle (démarrage/redémarrage rapide).
 */
let sessionMutation: Promise<unknown> = Promise.resolve();

function serializeSession<T>(operation: () => Promise<T>): Promise<T> {
  const run = sessionMutation.then(operation, operation);
  sessionMutation = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function bootstrap(): Promise<void> {
  await loadLoggerLevel();
  await ensureAlarms();

  const session = await getSession();
  if (session) {
    try {
      await chrome.tabs.get(session.tabId);
      await setActiveBadge(session.language);
    } catch {
      await clearSession();
      await clearSessionLanguage();
      await clearBadge();
    }
  } else {
    await clearBadge();
  }

  const info = await getAllowlistInfo();
  if (info.fetchedAt === undefined || info.stale) {
    void refreshAllowlist();
  }
}

async function onSessionStarted(
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  const data = message as { sessionId?: unknown; language?: unknown };
  if (typeof data.sessionId !== 'string' || !data.sessionId || !sender.tab?.id) {
    sendResponse({ ok: false });
    return;
  }

  const language = resolveLanguage(data.language);
  const examHost = domainFromUrl(sender.tab.url ?? '') ?? 'unknown';
  const session: ActiveSession = {
    sessionId: data.sessionId,
    tabId: sender.tab.id,
    examHost,
    language,
    startedAt: Date.now(),
  };

  await serializeSession(async () => {
    await setSession(session);
    await setSessionLanguage(language);
    await setActiveBadge(language);
  });
  logger.info('background', t('logSessionStarted', language, language), {
    session_id: session.sessionId,
    host: examHost,
  });
  sendResponse({ ok: true });

  await runSystemEnvironmentCheck(session.tabId, language);
}

async function onRuntimeMessage(
  message: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
): Promise<void> {
  const data = message as Record<string, unknown>;
  const type = typeof data.type === 'string' ? data.type : undefined;
  if (!type) {
    sendResponse({ ok: false });
    return;
  }

  switch (type) {
    case 'CHECK_HOST': {
      if (typeof data.hostname !== 'string') {
        sendResponse(false);
        return;
      }
      const language = await getSessionLanguage();
      const allowed = await isHostAllowed(data.hostname);
      logger.info(
        'background',
        t(allowed ? 'logHostAllowed' : 'logHostDenied', language, normalizeHost(data.hostname)),
      );
      sendResponse(allowed);
      return;
    }

    case 'SESSION_STARTED':
      void onSessionStarted(data, sender, sendResponse);
      return;

    case 'SESSION_ENDED': {
      await serializeSession(async () => {
        const session = await getSession();
        // Fin d'une session obsolète : la session courante appartient déjà à une autre instance
        // du SDK, on ne l'efface pas.
        if (
          session &&
          typeof data.sessionId === 'string' &&
          session.sessionId !== data.sessionId
        ) {
          return;
        }
        const language = session?.language ?? (await getSessionLanguage());
        await clearSession();
        await clearSessionLanguage();
        await clearBadge();
        logger.info('background', t('logSessionEnded', language));
      });
      sendResponse({ ok: true });
      return;
    }

    case 'PING_BACKGROUND': {
      const session = await getSession();
      sendResponse({ ok: !!session && session.tabId === sender.tab?.id });
      return;
    }

    case 'EXTENSION_EVENT': {
      const session = await getSession();
      if (!session || sender.tab?.id !== session.tabId) {
        logger.debug('background', t('logNoSession', await getSessionLanguage()));
        sendResponse({ ok: false });
        return;
      }
      const payload = sanitizeEventPayload(data.payload);
      if (!payload) {
        sendResponse({ ok: false });
        return;
      }
      const forwarded = await forwardEvent(session.tabId, payload);
      sendResponse({ ok: forwarded });
      return;
    }

    case 'CONTENT_LOG': {
      if (isLogEntry(data.entry)) {
        logger.log(data.entry.level, data.entry.module, data.entry.message, data.entry.context);
      }
      sendResponse({ ok: true });
      return;
    }

    case 'GET_STATE': {
      sendResponse(await getRuntimeState());
      return;
    }

    case 'SET_ENABLED': {
      const enabled = data.enabled === true;
      const session = await getSession();
      const language = session?.language ?? (await getSessionLanguage());
      if (session) {
        sendResponse({ ok: false, reason: 'session_active' });
        return;
      }
      await setEnabled(enabled);
      logger.info('background', t(enabled ? 'logEnabled' : 'logDisabled', language));
      if (enabled) await notifyEnabled(browserLanguage());
      else await notifyDisabled(browserLanguage());
      sendResponse({ ok: true });
      return;
    }

    case 'SET_DEBUG': {
      const debug = data.debug === true;
      await setDebug(debug);
      await loadLoggerLevel();
      logger.info('background', t(debug ? 'logDebugOn' : 'logDebugOff', await getSessionLanguage()));
      sendResponse({ ok: true });
      return;
    }

    case 'SET_TEST_HOSTS': {
      if (!__DEV__) {
        sendResponse({ ok: false });
        return;
      }
      const enabled = data.enabled === true;
      await setTestHosts(enabled);
      logger.info(
        'background',
        t(enabled ? 'logTestHostsOn' : 'logTestHostsOff', await getSessionLanguage()),
      );
      sendResponse({ ok: true });
      return;
    }

    case 'REFRESH_ALLOWLIST': {
      const ok = await refreshAllowlist();
      sendResponse({ ok, allowlist: await getAllowlistInfo() });
      return;
    }

    default:
      logger.debug('background', t('logIgnoredMessage', browserLanguage(), type));
      sendResponse({ ok: false });
  }
}

async function getRuntimeState(): Promise<ExtensionRuntimeState> {
  const session = await getSession();
  const language = session?.language ?? (await getSessionLanguage());
  return {
    session,
    language,
    enabled: await getEnabled(),
    debug: await getDebug(),
    testHosts: __DEV__ ? await getTestHosts() : false,
    dev: __DEV__,
    version: __EXTENSION_VERSION__,
    allowlist: await getAllowlistInfo(),
  };
}

async function onAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name === REFRESH_ALARM) {
    await refreshAllowlist();
    return;
  }
  if (alarm.name !== HEARTBEAT_ALARM) return;

  const session = await getSession();
  if (!session) return;

  try {
    await chrome.tabs.get(session.tabId);
  } catch {
    await clearSession();
    await clearSessionLanguage();
    await clearBadge();
    logger.warn('background', t('logTabLost', session.language));
    return;
  }

  try {
    await chrome.tabs.sendMessage(session.tabId, { type: 'PING_FROM_EXTENSION' });
    logger.debug('alarms', t('logHeartbeat', session.language));
  } catch (error) {
    logger.debug('alarms', t('logHeartbeatFailed', session.language), { error: String(error) });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  void bootstrap();
});
chrome.runtime.onStartup.addListener(() => {
  void bootstrap();
});
chrome.alarms.onAlarm.addListener((alarm) => {
  void onAlarm(alarm);
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (sender.id !== chrome.runtime.id) {
    logger.warn('background', t('logIgnoredMessage', browserLanguage(), 'sender'));
    return false;
  }
  void onRuntimeMessage(message, sender, sendResponse);
  return true;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.debug_logging) {
    void loadLoggerLevel();
  }
});

registerTabActivityDetection();
void bootstrap();
