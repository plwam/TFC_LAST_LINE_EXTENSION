import { describe, expect, it } from 'vitest';
import { EventType } from '@/shared/events';
import {
  buildHandshakeAck,
  buildPong,
  domainFromUrl,
  isSdkMessage,
  sanitizeEventPayload,
} from '@/shared/protocol';

describe('protocole du pont', () => {
  it('reconnaît uniquement les messages du canal examsdk', () => {
    expect(isSdkMessage({ channel: 'examsdk', type: 'PING' })).toBe(true);
    expect(isSdkMessage({ channel: 'autre', type: 'PING' })).toBe(false);
    expect(isSdkMessage({ type: 'PING' })).toBe(false);
    expect(isSdkMessage(null)).toBe(false);
  });

  it('réduit une navigation à son domaine', () => {
    expect(
      sanitizeEventPayload({
        type: EventType.NAVIGATION_EXT,
        url: 'https://Autre.Example.org/chemin?token=secret#fragment',
      }),
    ).toEqual({ type: EventType.NAVIGATION_EXT, domain: 'autre.example.org' });
    expect(
      sanitizeEventPayload({ type: EventType.NAVIGATION_EXT, domain: 'https://x.example/a' }),
    ).toEqual({ type: EventType.NAVIGATION_EXT, domain: 'x.example' });
  });

  it('refuse une navigation sans domaine exploitable', () => {
    expect(
      sanitizeEventPayload({ type: EventType.NAVIGATION_EXT, url: 'javascript:alert(1)' }),
    ).toBeUndefined();
    expect(sanitizeEventPayload({ type: EventType.NAVIGATION_EXT })).toBeUndefined();
  });

  it('conserve la durée d’absence pour un changement d’onglet', () => {
    expect(
      sanitizeEventPayload({ type: EventType.TAB_CHANGE_EXT, duration_ms: 4200.7 }),
    ).toEqual({ type: EventType.TAB_CHANGE_EXT, duration_ms: 4201 });
    expect(sanitizeEventPayload({ type: EventType.TAB_CHANGE_EXT })).toEqual({
      type: EventType.TAB_CHANGE_EXT,
    });
    expect(
      sanitizeEventPayload({ type: EventType.TAB_CHANGE_EXT, duration_ms: -1 }),
    ).toEqual({ type: EventType.TAB_CHANGE_EXT });
  });

  it('ne conserve que des codes de raison pour un environnement suspect', () => {
    expect(
      sanitizeEventPayload({
        type: EventType.SUSPICIOUS_ENVIRONMENT,
        reasons: ['software_renderer', 'low_cpu', 'valeur brute', 'software_renderer'],
        display_count: 2,
        renderer: 'SwiftShader',
      }),
    ).toEqual({
      type: EventType.SUSPICIOUS_ENVIRONMENT,
      reasons: ['software_renderer', 'low_cpu'],
      display_count: 2,
    });
    expect(
      sanitizeEventPayload({ type: EventType.SUSPICIOUS_ENVIRONMENT, reasons: ['inconnu'] }),
    ).toBeUndefined();
  });

  it('refuse un type d’événement non autorisé', () => {
    expect(sanitizeEventPayload({ type: 'EVIL' })).toBeUndefined();
    expect(sanitizeEventPayload({ type: EventType.FOCUS_LOST })).toBeUndefined();
  });

  it('construit des messages sortants valides', () => {
    expect(buildHandshakeAck('1.2.3')).toMatchObject({
      channel: 'examsdk',
      type: 'HANDSHAKE_ACK',
      extension_version: '1.2.3',
    });
    expect(buildPong()).toMatchObject({ channel: 'examsdk', type: 'PONG' });
  });

  it('extrait un domaine de manière défensive', () => {
    expect(domainFromUrl('https://A.Example.org:8443/x')).toBe('a.example.org');
    expect(domainFromUrl('chrome://settings')).toBeUndefined();
    expect(domainFromUrl('pas une url')).toBeUndefined();
  });
});
