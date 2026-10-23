import { EventType, EXTENSION_EVENT_TYPES } from './events';
import { resolveLanguage } from './i18n';
import type { EventPayload, Language } from './types';

export const PROTOCOL_CHANNEL = 'examsdk';

export const SDK_MESSAGE_TYPES = ['HANDSHAKE', 'PING', 'DISCONNECT'] as const;
export type SdkMessageType = (typeof SDK_MESSAGE_TYPES)[number];

export interface SdkMessage {
  channel: string;
  type: string;
  sessionId?: string;
  timestamp?: number;
  language?: string;
  payload?: unknown;
  level?: string;
  module?: string;
  message?: string;
  context?: Record<string, unknown>;
  extension_version?: string;
}

export const VM_REASONS = [
  'software_renderer',
  'virtual_gpu_vendor',
  'low_cpu',
  'low_memory',
  'headless',
] as const;

export type VmReason = (typeof VM_REASONS)[number];

export const SYSTEM_REASONS = ['abnormal_resolution', 'multiple_displays'] as const;

export type SystemReason = (typeof SYSTEM_REASONS)[number];

export function isSdkMessage(data: unknown): data is SdkMessage {
  if (typeof data !== 'object' || data === null) return false;
  const message = data as { channel?: unknown; type?: unknown };
  return message.channel === PROTOCOL_CHANNEL && typeof message.type === 'string';
}

export function readLanguage(message: SdkMessage): Language {
  return resolveLanguage(message.language);
}

export function normalizeHost(value: string): string {
  return value.trim().toLowerCase().replace(/^\[|\]$/g, '').replace(/:\d+$/, '');
}

export function domainFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return undefined;
    return normalizeHost(parsed.hostname) || undefined;
  } catch {
    return undefined;
  }
}

export function isTestHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function sanitizeDomain(value: string): string | undefined {
  const candidate = value.includes('://') ? domainFromUrl(value) : normalizeHost(value);
  if (!candidate) return undefined;
  if (!/^[a-z0-9.-]+$/.test(candidate)) return undefined;
  if (candidate.startsWith('.') || candidate.endsWith('.') || candidate.includes('..')) {
    return undefined;
  }
  return candidate;
}

function optionalDuration(payload: Record<string, unknown>): number | undefined {
  const value = payload.duration_ms;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : undefined;
}

/**
 * Réduit un événement à sa forme autorisée avant tout envoi :
 * - `NAVIGATION_EXT` ne conserve que le domaine (jamais l'URL complète) ;
 * - `SUSPICIOUS_ENVIRONMENT` ne conserve que des codes de raison, jamais une valeur brute ;
 * - tout autre type est refusé.
 */
export function sanitizeEventPayload(payload: unknown): EventPayload | undefined {
  if (typeof payload !== 'object' || payload === null) return undefined;
  const input = payload as Record<string, unknown>;
  const type = input.type;
  if (typeof type !== 'string' || !EXTENSION_EVENT_TYPES.has(type as EventType)) return undefined;

  if (type === EventType.NAVIGATION_EXT) {
    const domain =
      typeof input.domain === 'string'
        ? sanitizeDomain(input.domain)
        : typeof input.url === 'string'
          ? sanitizeDomain(input.url)
          : undefined;
    return domain ? { type: EventType.NAVIGATION_EXT, domain } : undefined;
  }

  if (type === EventType.TAB_CHANGE_EXT) {
    const duration = optionalDuration(input);
    return duration === undefined
      ? { type: EventType.TAB_CHANGE_EXT }
      : { type: EventType.TAB_CHANGE_EXT, duration_ms: duration };
  }

  const reasons = Array.isArray(input.reasons)
    ? [...new Set(input.reasons.filter((reason): reason is string => typeof reason === 'string'))].filter(
        (reason) => (VM_REASONS as readonly string[]).includes(reason) || (SYSTEM_REASONS as readonly string[]).includes(reason),
      )
    : [];
  if (reasons.length === 0) return undefined;

  const result: EventPayload = { type: EventType.SUSPICIOUS_ENVIRONMENT, reasons };
  const displayCount = input.display_count;
  if (typeof displayCount === 'number' && Number.isInteger(displayCount) && displayCount > 0) {
    result.display_count = displayCount;
  }
  return result;
}

export function buildHandshakeAck(version: string): SdkMessage {
  return {
    channel: PROTOCOL_CHANNEL,
    type: 'HANDSHAKE_ACK',
    timestamp: Date.now(),
    extension_version: version,
  };
}

export function buildPong(): SdkMessage {
  return { channel: PROTOCOL_CHANNEL, type: 'PONG', timestamp: Date.now() };
}

export function buildEvent(payload: EventPayload): SdkMessage {
  return { channel: PROTOCOL_CHANNEL, type: 'EVENT', payload, timestamp: Date.now() };
}

export function buildLog(
  level: string,
  module: string,
  message: string,
  context?: Record<string, unknown>,
): SdkMessage {
  return {
    channel: PROTOCOL_CHANNEL,
    type: 'LOG',
    level,
    module,
    message,
    context,
    timestamp: Date.now(),
  };
}
