import type { EventType } from './events';

export type Language = 'fr' | 'en';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogModule =
  | 'background'
  | 'content'
  | 'popup'
  | 'alarms'
  | 'allowlist'
  | 'detectors'
  | 'bridge';

export interface LogEntry {
  time: string;
  level: LogLevel;
  module: LogModule;
  message: string;
  context?: Record<string, unknown>;
}

export interface AllowlistCache {
  hosts: string[];
  fetchedAt: number;
}

export interface ActiveSession {
  sessionId: string;
  tabId: number;
  examHost: string;
  language: Language;
  startedAt: number;
  awaySince?: number;
}

export interface EventPayload {
  type: EventType;
  [key: string]: unknown;
}

export interface ExtensionRuntimeState {
  session?: ActiveSession;
  language: Language;
  enabled: boolean;
  debug: boolean;
  testHosts: boolean;
  dev: boolean;
  version: string;
  allowlist: {
    count: number;
    fetchedAt?: number;
    stale: boolean;
  };
}
