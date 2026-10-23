import { detectVmIndices } from '@/detectors/vmDetector';
import { EventType } from '@/shared/events';
import { browserLanguage, t } from '@/shared/i18n';
import {
  buildEvent,
  buildHandshakeAck,
  buildLog,
  buildPong,
  isSdkMessage,
  readLanguage,
  sanitizeEventPayload,
  type SdkMessage,
} from '@/shared/protocol';
import type { Language, LogEntry } from '@/shared/types';
import { logger, syncContentLogLevel } from './logger';

let initialized = false;
let connected = false;
let sessionId: string | undefined;
let language: Language = browserLanguage();
let pageEnvironmentChecked = false;
let backgroundWarningPosted = false;

function postToPage(message: SdkMessage): void {
  window.postMessage(message, window.location.origin);
}

function sendToBackground(message: Record<string, unknown>): Promise<unknown> {
  try {
    return Promise.resolve(chrome.runtime.sendMessage(message)).catch(() => undefined);
  } catch {
    /* contexte d'extension invalidé (extension rechargée) */
    return Promise.resolve(undefined);
  }
}

function backgroundAccepted(response: unknown): boolean {
  return (
    typeof response === 'object' &&
    response !== null &&
    (response as { ok?: unknown }).ok === true
  );
}

/**
 * Le script de contenu survit au rechargement de l'extension, mais son contexte `chrome.runtime`
 * est invalidé : les heartbeats continuaient donc alors que le service worker n'avait plus de
 * session. On prévient explicitement la page qu'un rechargement est nécessaire.
 */
function warnBackgroundUnavailable(): void {
  if (backgroundWarningPosted) return;
  backgroundWarningPosted = true;
  postToPage(
    buildLog(
      'warn',
      'bridge',
      t('logBackgroundUnavailable', language),
    ),
  );
}

function onMessageFromSdk(event: MessageEvent): void {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;
  if (!isSdkMessage(event.data)) return;

  const message = event.data;
  if (message.type === 'HANDSHAKE') {
    if (typeof message.sessionId !== 'string' || message.sessionId.length === 0) {
      logger.warn('bridge', t('logIgnoredMessage', browserLanguage(), 'HANDSHAKE'));
      return;
    }
    sessionId = message.sessionId;
    language = readLanguage(message);
    connected = true;
    postToPage(buildHandshakeAck(chrome.runtime.getManifest().version));
    void sendToBackground({ type: 'SESSION_STARTED', sessionId, language }).then((response) => {
      if (!backgroundAccepted(response)) warnBackgroundUnavailable();
    });
    logger.info('bridge', t('logBridgeHandshake', language));
    void runPageEnvironmentCheck();
    return;
  }

  if (message.type === 'PING') {
    if (sessionId && message.sessionId && message.sessionId !== sessionId) return;
    // Le PONG ne doit être émis que si le service worker possède encore la session : un
    // script de contenu orphelin répondait auparavant tout seul et masquait la panne.
    void sendToBackground({ type: 'PING_BACKGROUND' }).then((response) => {
      if (!backgroundAccepted(response)) {
        warnBackgroundUnavailable();
        return;
      }
      postToPage(buildPong());
    });
    return;
  }

  if (message.type === 'DISCONNECT') {
    if (!connected) return;
    const endingSession = sessionId;
    connected = false;
    sessionId = undefined;
    void sendToBackground({ type: 'SESSION_ENDED', sessionId: endingSession });
    logger.info('bridge', t('logSessionEnded', language));
    return;
  }

  logger.debug('bridge', t('logIgnoredMessage', language, message.type));
}

function onMessageFromBackground(
  message: unknown,
  sender: chrome.runtime.MessageSender,
): false {
  if (sender.id !== chrome.runtime.id) return false;
  if (typeof message !== 'object' || message === null) return false;
  const data = message as Record<string, unknown>;

  if (data.type === 'FORWARD_EVENT') {
    const payload = sanitizeEventPayload(data.payload);
    if (payload) postToPage(buildEvent(payload));
    return false;
  }

  if (data.type === 'LOG') {
    const entry = data.entry as Partial<LogEntry> | undefined;
    if (
      entry &&
      typeof entry.level === 'string' &&
      typeof entry.module === 'string' &&
      typeof entry.message === 'string'
    ) {
      postToPage(buildLog(entry.level, entry.module, entry.message, entry.context));
    }
    return false;
  }

  if (data.type === 'PING_FROM_EXTENSION') {
    postToPage(buildPong());
    logger.debug('bridge', t('logHeartbeat', language));
    return false;
  }

  return false;
}

async function runPageEnvironmentCheck(): Promise<void> {
  if (pageEnvironmentChecked) return;
  pageEnvironmentChecked = true;

  const reasons = detectVmIndices();
  logger.debug('detectors', t('logPageEnvironment', language), { indices: reasons.length });
  if (reasons.length < 2) return;

  logger.info('detectors', t('logEnvironmentSuspicious', language, reasons.join(', ')), {
    reasons,
  });
  sendToBackground({
    type: 'EXTENSION_EVENT',
    payload: { type: EventType.SUSPICIOUS_ENVIRONMENT, reasons },
  });
}

export function init(): void {
  if (initialized) return;
  initialized = true;
  void syncContentLogLevel();

  window.addEventListener('message', onMessageFromSdk);
  chrome.runtime.onMessage.addListener(onMessageFromBackground);

  logger.info('bridge', t('logBridgeReady', browserLanguage(), window.location.hostname));
}
