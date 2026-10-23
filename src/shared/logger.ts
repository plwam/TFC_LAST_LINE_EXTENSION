import type { LogEntry, LogLevel, LogModule } from './types';

const LEVEL_RANK: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const PREFIX = '[ProctorExt]';

export type LogSink = (entry: LogEntry) => void;

function clock(date: Date): string {
  const pad = (value: number, size = 2) => String(value).padStart(size, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
    date.getMilliseconds(),
    3,
  )}`;
}

export function formatEntry(entry: LogEntry): string {
  const context =
    entry.context && Object.keys(entry.context).length > 0
      ? ` ${JSON.stringify(entry.context)}`
      : '';
  return `${PREFIX} ${entry.time} [${entry.level}] [${entry.module}] ${entry.message}${context}`;
}

export class ExtLogger {
  private minLevel: LogLevel = 'info';
  private sinks: LogSink[] = [];

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  getLevel(): LogLevel {
    return this.minLevel;
  }

  addSink(sink: LogSink): void {
    this.sinks.push(sink);
  }

  log(level: LogLevel, module: LogModule, message: string, context?: Record<string, unknown>): void {
    if (LEVEL_RANK[level] < LEVEL_RANK[this.minLevel]) return;
    const entry: LogEntry = { time: clock(new Date()), level, module, message, context };
    this.writeConsole(entry);
    for (const sink of this.sinks) {
      try {
        sink(entry);
      } catch {
        /* un sink défaillant ne doit jamais casser le service worker */
      }
    }
  }

  debug(module: LogModule, message: string, context?: Record<string, unknown>): void {
    this.log('debug', module, message, context);
  }

  info(module: LogModule, message: string, context?: Record<string, unknown>): void {
    this.log('info', module, message, context);
  }

  warn(module: LogModule, message: string, context?: Record<string, unknown>): void {
    this.log('warn', module, message, context);
  }

  error(module: LogModule, message: string, context?: Record<string, unknown>): void {
    this.log('error', module, message, context);
  }

  private writeConsole(entry: LogEntry): void {
    const target = typeof console === 'undefined' ? undefined : console;
    if (!target) return;
    const line = formatEntry(entry);
    if (entry.level === 'error') target.error(line);
    else if (entry.level === 'warn') target.warn(line);
    else if (entry.level === 'debug') target.debug(line);
    else target.info(line);
  }
}
