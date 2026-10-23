// src/background/alarms.ts
var REFRESH_ALARM = "refresh-allowlist";
var HEARTBEAT_ALARM = "extension-heartbeat";
var REFRESH_PERIOD_MINUTES = 30;
var HEARTBEAT_PERIOD_MINUTES = 0.5;
async function ensureAlarms() {
  await chrome.alarms.create(REFRESH_ALARM, { periodInMinutes: REFRESH_PERIOD_MINUTES });
  await chrome.alarms.create(HEARTBEAT_ALARM, { periodInMinutes: HEARTBEAT_PERIOD_MINUTES });
}

// public/_locales/fr/messages.json
var messages_default = {
  extensionName: {
    message: "Exam Surveillance Extension",
    description: "Nom de l'extension."
  },
  extensionDescription: {
    message: "Surveillance d'examen : signale les changements d'onglet, navigations et environnements suspects au SDK ExamSDK.",
    description: "Description affich\xE9e dans le gestionnaire d'extensions."
  },
  popupTitle: {
    message: "Exam Surveillance"
  },
  statusNoSession: {
    message: "Aucune session active"
  },
  statusActive: {
    message: "Session active"
  },
  versionLabel: {
    message: "Version"
  },
  languageLabel: {
    message: "Langue"
  },
  languageFr: {
    message: "Fran\xE7ais"
  },
  languageEn: {
    message: "Anglais"
  },
  enabledLabel: {
    message: "Extension activ\xE9e hors session"
  },
  debugLabel: {
    message: "Journal de d\xE9bogage"
  },
  testHostsLabel: {
    message: "Autoriser les h\xF4tes de test"
  },
  devBuildLabel: {
    message: "Version de d\xE9veloppement"
  },
  allowlistHeading: {
    message: "Liste blanche"
  },
  allowlistCount: {
    message: "$1 h\xF4te(s)"
  },
  allowlistNever: {
    message: "jamais r\xE9cup\xE9r\xE9e"
  },
  allowlistUpdated: {
    message: "mise \xE0 jour : $1"
  },
  refreshAction: {
    message: "Actualiser"
  },
  refreshDone: {
    message: "Liste actualis\xE9e."
  },
  refreshFailed: {
    message: "\xC9chec de l'actualisation."
  },
  notifEnabledTitle: {
    message: "Surveillance r\xE9activ\xE9e"
  },
  notifEnabledBody: {
    message: "L'extension se r\xE9activera sur les domaines d'examen enregistr\xE9s."
  },
  notifDisabledTitle: {
    message: "Surveillance d\xE9sactiv\xE9e"
  },
  notifDisabledBody: {
    message: "L'extension ne s'activera plus sur les domaines d'examen."
  },
  badgeActive: {
    message: "REC"
  },
  logAllowlistFetched: {
    message: "Liste blanche r\xE9cup\xE9r\xE9e ($1 h\xF4te(s))."
  },
  logAllowlistFailed: {
    message: "\xC9chec de r\xE9cup\xE9ration de la liste blanche : $1"
  },
  logAllowlistStale: {
    message: "Cache de la liste blanche p\xE9rim\xE9, rafra\xEEchissement en t\xE2che de fond."
  },
  logHostAllowed: {
    message: "H\xF4te autoris\xE9 : $1"
  },
  logHostDenied: {
    message: "H\xF4te refus\xE9 : $1"
  },
  logSessionStarted: {
    message: "Session d\xE9marr\xE9e (langue $1)."
  },
  logSessionEnded: {
    message: "Session termin\xE9e."
  },
  logEventEmitted: {
    message: "\xC9v\xE9nement \xE9mis : $1"
  },
  logHeartbeat: {
    message: "Heartbeat d'extension envoy\xE9."
  },
  logIgnoredMessage: {
    message: "Message ignor\xE9 (origine, source ou type invalide) : $1"
  },
  logEnabled: {
    message: "Extension activ\xE9e hors session."
  },
  logDisabled: {
    message: "Extension d\xE9sactiv\xE9e hors session."
  },
  logDebugOn: {
    message: "Journal de d\xE9bogage activ\xE9."
  },
  logDebugOff: {
    message: "Journal de d\xE9bogage d\xE9sactiv\xE9."
  },
  logTestHostsOn: {
    message: "H\xF4tes de test autoris\xE9s (d\xE9veloppement uniquement)."
  },
  logTestHostsOff: {
    message: "H\xF4tes de test refus\xE9s."
  },
  logEnvironmentSuspicious: {
    message: "Environnement suspect : $1"
  },
  logTabLost: {
    message: "Onglet de session introuvable, session cl\xF4tur\xE9e."
  },
  logNoSession: {
    message: "Message re\xE7u sans session active."
  },
  logBridgeReady: {
    message: "Pont initialis\xE9 sur $1"
  },
  logBridgeHandshake: {
    message: "Poign\xE9e de main re\xE7ue."
  },
  logPageEnvironment: {
    message: "Analyse de l'environnement de la page termin\xE9e."
  },
  logContentLoaded: {
    message: "Script de page autoris\xE9 \xE0 s'ex\xE9cuter."
  },
  logEventRejected: {
    message: "\xC9v\xE9nement refus\xE9 par le filtre de minimisation : $1"
  },
  logEventForwardFailed: {
    message: "\xC9chec de transmission de l'\xE9v\xE9nement $1"
  },
  logHeartbeatFailed: {
    message: "\xC9chec de l'envoi du heartbeat d'extension."
  },
  logBackgroundUnavailable: {
    message: "Extension recharg\xE9e ou indisponible : rechargez la page d'examen."
  }
};

// public/_locales/en/messages.json
var messages_default2 = {
  extensionName: {
    message: "Exam Surveillance Extension",
    description: "Extension name."
  },
  extensionDescription: {
    message: "Exam surveillance: reports tab switches, navigations and suspicious environments to the ExamSDK SDK.",
    description: "Description shown in the extensions manager."
  },
  popupTitle: {
    message: "Exam Surveillance"
  },
  statusNoSession: {
    message: "No active session"
  },
  statusActive: {
    message: "Active session"
  },
  versionLabel: {
    message: "Version"
  },
  languageLabel: {
    message: "Language"
  },
  languageFr: {
    message: "French"
  },
  languageEn: {
    message: "English"
  },
  enabledLabel: {
    message: "Extension enabled outside sessions"
  },
  debugLabel: {
    message: "Debug log"
  },
  testHostsLabel: {
    message: "Allow test hosts"
  },
  devBuildLabel: {
    message: "Development build"
  },
  allowlistHeading: {
    message: "Allowlist"
  },
  allowlistCount: {
    message: "$1 host(s)"
  },
  allowlistNever: {
    message: "never fetched"
  },
  allowlistUpdated: {
    message: "updated: $1"
  },
  refreshAction: {
    message: "Refresh"
  },
  refreshDone: {
    message: "Allowlist refreshed."
  },
  refreshFailed: {
    message: "Refresh failed."
  },
  notifEnabledTitle: {
    message: "Monitoring re-enabled"
  },
  notifEnabledBody: {
    message: "The extension will activate again on registered exam domains."
  },
  notifDisabledTitle: {
    message: "Monitoring disabled"
  },
  notifDisabledBody: {
    message: "The extension will no longer activate on exam domains."
  },
  badgeActive: {
    message: "REC"
  },
  logAllowlistFetched: {
    message: "Allowlist fetched ($1 host(s))."
  },
  logAllowlistFailed: {
    message: "Allowlist fetch failed: $1"
  },
  logAllowlistStale: {
    message: "Allowlist cache is stale, refreshing in the background."
  },
  logHostAllowed: {
    message: "Host allowed: $1"
  },
  logHostDenied: {
    message: "Host denied: $1"
  },
  logSessionStarted: {
    message: "Session started (language $1)."
  },
  logSessionEnded: {
    message: "Session ended."
  },
  logEventEmitted: {
    message: "Event emitted: $1"
  },
  logHeartbeat: {
    message: "Extension heartbeat sent."
  },
  logIgnoredMessage: {
    message: "Message ignored (invalid origin, source or type): $1"
  },
  logEnabled: {
    message: "Extension enabled outside sessions."
  },
  logDisabled: {
    message: "Extension disabled outside sessions."
  },
  logDebugOn: {
    message: "Debug log enabled."
  },
  logDebugOff: {
    message: "Debug log disabled."
  },
  logTestHostsOn: {
    message: "Test hosts allowed (development only)."
  },
  logTestHostsOff: {
    message: "Test hosts denied."
  },
  logEnvironmentSuspicious: {
    message: "Suspicious environment: $1"
  },
  logTabLost: {
    message: "Session tab not found, session closed."
  },
  logNoSession: {
    message: "Message received without an active session."
  },
  logBridgeReady: {
    message: "Bridge initialised on $1"
  },
  logBridgeHandshake: {
    message: "Handshake received."
  },
  logPageEnvironment: {
    message: "Page environment analysis completed."
  },
  logContentLoaded: {
    message: "Page script allowed to run."
  },
  logEventRejected: {
    message: "Event rejected by the minimisation filter: $1"
  },
  logEventForwardFailed: {
    message: "Failed to forward event $1"
  },
  logHeartbeatFailed: {
    message: "Extension heartbeat delivery failed."
  },
  logBackgroundUnavailable: {
    message: "Extension reloaded or unavailable: reload the exam page."
  }
};

// src/shared/i18n.ts
var PACKS = {
  fr: messages_default,
  en: messages_default2
};
function resolveLanguage(value) {
  return value === "en" ? "en" : "fr";
}
function browserLanguage() {
  try {
    const ui = chrome.i18n.getUILanguage();
    return ui.toLowerCase().startsWith("en") ? "en" : "fr";
  } catch {
    return typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("en") ? "en" : "fr";
  }
}
function applySubstitutions(text, substitutions) {
  if (substitutions === void 0) return text;
  const values = Array.isArray(substitutions) ? substitutions : [substitutions];
  return values.reduce(
    (acc, value, index) => acc.replaceAll(`$${index + 1}`, value),
    text
  );
}
function t(key, language = browserLanguage(), substitutions) {
  const entry = PACKS[language][key] ?? PACKS.fr[key];
  return applySubstitutions(entry?.message ?? key, substitutions);
}

// src/background/badge.ts
var ACTIVE_COLOR = "#C62828";
async function setActiveBadge(language) {
  try {
    await chrome.action.setBadgeBackgroundColor({ color: ACTIVE_COLOR });
    await chrome.action.setBadgeText({ text: t("badgeActive", language) });
  } catch {
  }
}
async function clearBadge() {
  try {
    await chrome.action.setBadgeText({ text: "" });
  } catch {
  }
}

// src/shared/events.ts
var EXTENSION_EVENT_TYPES = /* @__PURE__ */ new Set([
  "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */,
  "NAVIGATION_EXT" /* NAVIGATION_EXT */,
  "SUSPICIOUS_ENVIRONMENT" /* SUSPICIOUS_ENVIRONMENT */
]);

// src/shared/logger.ts
var LEVEL_RANK = { debug: 0, info: 1, warn: 2, error: 3 };
var PREFIX = "[ProctorExt]";
function clock(date) {
  const pad = (value, size = 2) => String(value).padStart(size, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
    date.getMilliseconds(),
    3
  )}`;
}
function formatEntry(entry) {
  const context = entry.context && Object.keys(entry.context).length > 0 ? ` ${JSON.stringify(entry.context)}` : "";
  return `${PREFIX} ${entry.time} [${entry.level}] [${entry.module}] ${entry.message}${context}`;
}
var ExtLogger = class {
  minLevel = "info";
  sinks = [];
  constructor(minLevel = "info") {
    this.minLevel = minLevel;
  }
  setLevel(level) {
    this.minLevel = level;
  }
  getLevel() {
    return this.minLevel;
  }
  addSink(sink) {
    this.sinks.push(sink);
  }
  log(level, module, message, context) {
    if (LEVEL_RANK[level] < LEVEL_RANK[this.minLevel]) return;
    const entry = { time: clock(/* @__PURE__ */ new Date()), level, module, message, context };
    this.writeConsole(entry);
    for (const sink of this.sinks) {
      try {
        sink(entry);
      } catch {
      }
    }
  }
  debug(module, message, context) {
    this.log("debug", module, message, context);
  }
  info(module, message, context) {
    this.log("info", module, message, context);
  }
  warn(module, message, context) {
    this.log("warn", module, message, context);
  }
  error(module, message, context) {
    this.log("error", module, message, context);
  }
  writeConsole(entry) {
    const target = typeof console === "undefined" ? void 0 : console;
    if (!target) return;
    const line = formatEntry(entry);
    if (entry.level === "error") target.error(line);
    else if (entry.level === "warn") target.warn(line);
    else if (entry.level === "debug") target.debug(line);
    else target.info(line);
  }
};

// src/shared/storage.ts
var KEYS = {
  allowlist: "host_allowlist_cache",
  session: "active_session",
  language: "session_language",
  enabled: "extension_enabled",
  debug: "debug_logging",
  testHosts: "debug_allow_test_hosts"
};
async function read(area, key) {
  const result = await area.get(key);
  return result[key];
}
async function getSession() {
  return read(chrome.storage.session, KEYS.session);
}
async function setSession(session) {
  await chrome.storage.session.set({ [KEYS.session]: session });
}
async function patchSession(patch) {
  const current = await getSession();
  if (!current) return void 0;
  const next = { ...current, ...patch };
  await setSession(next);
  return next;
}
async function clearSession() {
  await chrome.storage.session.remove(KEYS.session);
}
async function getSessionLanguage() {
  const language = await read(chrome.storage.session, KEYS.language);
  return language === "en" ? "en" : language === "fr" ? "fr" : browserLanguage();
}
async function setSessionLanguage(language) {
  await chrome.storage.session.set({ [KEYS.language]: language });
}
async function clearSessionLanguage() {
  await chrome.storage.session.remove(KEYS.language);
}
async function getEnabled() {
  return await read(chrome.storage.local, KEYS.enabled) ?? true;
}
async function setEnabled(enabled) {
  await chrome.storage.local.set({ [KEYS.enabled]: enabled });
}
async function getDebug() {
  return await read(chrome.storage.local, KEYS.debug) ?? false;
}
async function setDebug(debug) {
  await chrome.storage.local.set({ [KEYS.debug]: debug });
}
async function setTestHosts(enabled) {
  await chrome.storage.local.set({ [KEYS.testHosts]: enabled });
}
async function getAllowlistCache() {
  return read(chrome.storage.local, KEYS.allowlist);
}
async function setAllowlistCache(cache) {
  await chrome.storage.local.set({ [KEYS.allowlist]: cache });
}

// src/background/logger.ts
var logger = new ExtLogger("info");
logger.addSink((entry) => {
  void (async () => {
    const session = await getSession();
    if (!session) return;
    try {
      await chrome.tabs.sendMessage(session.tabId, { type: "LOG", entry });
    } catch {
    }
  })();
});
async function loadLoggerLevel() {
  logger.setLevel(await getDebug() ? "debug" : "info");
}

// src/shared/protocol.ts
var VM_REASONS = [
  "software_renderer",
  "virtual_gpu_vendor",
  "low_cpu",
  "low_memory",
  "headless"
];
var SYSTEM_REASONS = ["abnormal_resolution", "multiple_displays"];
function normalizeHost(value) {
  return value.trim().toLowerCase().replace(/^\[|\]$/g, "").replace(/:\d+$/, "");
}
function domainFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return void 0;
    return normalizeHost(parsed.hostname) || void 0;
  } catch {
    return void 0;
  }
}
function sanitizeDomain(value) {
  const candidate = value.includes("://") ? domainFromUrl(value) : normalizeHost(value);
  if (!candidate) return void 0;
  if (!/^[a-z0-9.-]+$/.test(candidate)) return void 0;
  if (candidate.startsWith(".") || candidate.endsWith(".") || candidate.includes("..")) {
    return void 0;
  }
  return candidate;
}
function optionalDuration(payload) {
  const value = payload.duration_ms;
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : void 0;
}
function sanitizeEventPayload(payload) {
  if (typeof payload !== "object" || payload === null) return void 0;
  const input = payload;
  const type = input.type;
  if (typeof type !== "string" || !EXTENSION_EVENT_TYPES.has(type)) return void 0;
  if (type === "NAVIGATION_EXT" /* NAVIGATION_EXT */) {
    const domain = typeof input.domain === "string" ? sanitizeDomain(input.domain) : typeof input.url === "string" ? sanitizeDomain(input.url) : void 0;
    return domain ? { type: "NAVIGATION_EXT" /* NAVIGATION_EXT */, domain } : void 0;
  }
  if (type === "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */) {
    const duration = optionalDuration(input);
    return duration === void 0 ? { type: "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */ } : { type: "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */, duration_ms: duration };
  }
  const reasons = Array.isArray(input.reasons) ? [...new Set(input.reasons.filter((reason) => typeof reason === "string"))].filter(
    (reason) => VM_REASONS.includes(reason) || SYSTEM_REASONS.includes(reason)
  ) : [];
  if (reasons.length === 0) return void 0;
  const result = { type: "SUSPICIOUS_ENVIRONMENT" /* SUSPICIOUS_ENVIRONMENT */, reasons };
  const displayCount = input.display_count;
  if (typeof displayCount === "number" && Number.isInteger(displayCount) && displayCount > 0) {
    result.display_count = displayCount;
  }
  return result;
}

// src/background/forwardEvent.ts
async function forwardEvent(tabId, payload) {
  const language = await getSessionLanguage();
  const safe = sanitizeEventPayload(payload);
  if (!safe) {
    logger.warn("background", t("logEventRejected", language), { type: payload.type });
    return false;
  }
  try {
    await chrome.tabs.sendMessage(tabId, { type: "FORWARD_EVENT", payload: safe });
    logger.info("background", t("logEventEmitted", language, safe.type));
    return true;
  } catch (error) {
    logger.debug("background", t("logEventForwardFailed", language, safe.type), {
      error: String(error)
    });
    return false;
  }
}

// src/background/environmentDetector.ts
async function detectSystemEnvironment() {
  try {
    const displays = await chrome.system.display.getInfo();
    const displayCount = Array.isArray(displays) ? displays.length : 0;
    const reasons = [];
    if (displays.some((display) => display.bounds.width < 800 || display.bounds.height < 600)) {
      reasons.push("abnormal_resolution");
    }
    if (displayCount > 1) reasons.push("multiple_displays");
    return { reasons, displayCount };
  } catch {
    return { reasons: [], displayCount: 0 };
  }
}
async function runSystemEnvironmentCheck(tabId, language) {
  const report = await detectSystemEnvironment();
  if (report.reasons.length === 0) return;
  logger.info("detectors", t("logEnvironmentSuspicious", language, report.reasons.join(", ")), {
    reasons: report.reasons
  });
  await forwardEvent(tabId, {
    type: "SUSPICIOUS_ENVIRONMENT" /* SUSPICIOUS_ENVIRONMENT */,
    reasons: report.reasons,
    display_count: report.displayCount
  });
}

// src/background/hostAllowlist.ts
var STALE_AFTER_MS = 2 * 60 * 60 * 1e3;
var FETCH_TIMEOUT_MS = 1e4;
var inFlight = null;
function hostMatches(hostname, hosts) {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return hosts.some((entry) => {
    const allowed = normalizeHost(entry);
    return !!allowed && (host === allowed || host.endsWith(`.${allowed}`));
  });
}
async function fetchAllowlist(fetchImpl = fetch) {
  const controller = typeof AbortController === "undefined" ? void 0 : new AbortController();
  const timer = controller ? setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS) : void 0;
  try {
    const response = await fetchImpl(`${"https://api.examsdk.com"}/public/registered-hosts/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: controller?.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const body = await response.json();
    if (!Array.isArray(body.hosts)) throw new Error("r\xE9ponse invalide");
    const hosts = body.hosts.filter((host) => typeof host === "string").map((host) => normalizeHost(domainFromUrl(host) ?? host)).filter((host) => host.length > 0);
    return [...new Set(hosts)].sort();
  } finally {
    if (timer !== void 0) clearTimeout(timer);
  }
}
async function doRefresh() {
  const language = await getSessionLanguage();
  try {
    const hosts = await fetchAllowlist();
    const cache = { hosts, fetchedAt: Date.now() };
    await setAllowlistCache(cache);
    logger.info("allowlist", t("logAllowlistFetched", language, String(hosts.length)), {
      count: hosts.length
    });
    return true;
  } catch (error) {
    logger.warn("allowlist", t("logAllowlistFailed", language, String(error)));
    return false;
  }
}
function refreshAllowlist() {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
async function isHostAllowed(hostname) {
  const host = normalizeHost(hostname);
  if (!host) return false;
  if (!await getEnabled()) return false;
  const language = await getSessionLanguage();
  if (false) {
    logger.debug("allowlist", t("logHostAllowed", language, host), { host });
    return true;
  }
  const cache = await getAllowlistCache();
  if (!cache) return false;
  if (Date.now() - cache.fetchedAt > STALE_AFTER_MS) {
    logger.info("allowlist", t("logAllowlistStale", language), {
      age_ms: Date.now() - cache.fetchedAt
    });
    void refreshAllowlist();
  }
  return hostMatches(host, cache.hosts);
}
async function getAllowlistInfo() {
  const cache = await getAllowlistCache();
  if (!cache) return { count: 0, stale: true };
  return {
    count: cache.hosts.length,
    fetchedAt: cache.fetchedAt,
    stale: Date.now() - cache.fetchedAt > STALE_AFTER_MS
  };
}

// src/background/notifications.ts
var ICON = "icons/icon128.png";
async function notify(id, title, message) {
  try {
    await chrome.notifications.create(id, {
      type: "basic",
      iconUrl: ICON,
      title,
      message
    });
  } catch {
  }
}
async function notifyEnabled(language) {
  await notify(
    `enabled-${Date.now()}`,
    t("notifEnabledTitle", language),
    t("notifEnabledBody", language)
  );
}
async function notifyDisabled(language) {
  await notify(
    `disabled-${Date.now()}`,
    t("notifDisabledTitle", language),
    t("notifDisabledBody", language)
  );
}

// src/background/tabActivityDetector.ts
async function onTabActivated(tabId) {
  const session = await getSession();
  if (!session) return;
  if (tabId === session.tabId) {
    if (session.awaySince === void 0) return;
    const duration = Date.now() - session.awaySince;
    await patchSession({ awaySince: void 0 });
    await forwardEvent(session.tabId, {
      type: "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */,
      duration_ms: duration
    });
    return;
  }
  if (session.awaySince !== void 0) return;
  await patchSession({ awaySince: Date.now() });
  await forwardEvent(session.tabId, { type: "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */ });
}
async function onNavigationCommitted(details) {
  if (details.frameId !== 0) return;
  const session = await getSession();
  if (!session || details.tabId !== session.tabId) return;
  const domain = domainFromUrl(details.url);
  if (!domain || domain === session.examHost) return;
  await forwardEvent(session.tabId, { type: "NAVIGATION_EXT" /* NAVIGATION_EXT */, domain });
}
async function onTabRemoved(tabId) {
  const session = await getSession();
  if (!session || session.tabId !== tabId) return;
  const language = session.language;
  await clearSession();
  await clearBadge();
  logger.warn("background", t("logTabLost", language));
}
function registerTabActivityDetection() {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    void onTabActivated(tabId);
  });
  chrome.webNavigation.onCommitted.addListener((details) => {
    void onNavigationCommitted(details);
  });
  chrome.tabs.onRemoved.addListener((tabId) => {
    void onTabRemoved(tabId);
  });
}

// src/background/service-worker.ts
var LOG_LEVELS = ["debug", "info", "warn", "error"];
var LOG_MODULES = [
  "background",
  "content",
  "popup",
  "alarms",
  "allowlist",
  "detectors",
  "bridge"
];
function isLogEntry(value) {
  if (typeof value !== "object" || value === null) return false;
  const entry = value;
  return typeof entry.message === "string" && typeof entry.level === "string" && LOG_LEVELS.includes(entry.level) && typeof entry.module === "string" && LOG_MODULES.includes(entry.module) && (entry.context === void 0 || typeof entry.context === "object" && entry.context !== null);
}
var sessionMutation = Promise.resolve();
function serializeSession(operation) {
  const run = sessionMutation.then(operation, operation);
  sessionMutation = run.then(
    () => void 0,
    () => void 0
  );
  return run;
}
async function bootstrap() {
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
  if (info.fetchedAt === void 0 || info.stale) {
    void refreshAllowlist();
  }
}
async function onSessionStarted(message, sender, sendResponse) {
  const data = message;
  if (typeof data.sessionId !== "string" || !data.sessionId || !sender.tab?.id) {
    sendResponse({ ok: false });
    return;
  }
  const language = resolveLanguage(data.language);
  const examHost = domainFromUrl(sender.tab.url ?? "") ?? "unknown";
  const session = {
    sessionId: data.sessionId,
    tabId: sender.tab.id,
    examHost,
    language,
    startedAt: Date.now()
  };
  await serializeSession(async () => {
    await setSession(session);
    await setSessionLanguage(language);
    await setActiveBadge(language);
  });
  logger.info("background", t("logSessionStarted", language, language), {
    session_id: session.sessionId,
    host: examHost
  });
  sendResponse({ ok: true });
  await runSystemEnvironmentCheck(session.tabId, language);
}
async function onRuntimeMessage(message, sender, sendResponse) {
  const data = message;
  const type = typeof data.type === "string" ? data.type : void 0;
  if (!type) {
    sendResponse({ ok: false });
    return;
  }
  switch (type) {
    case "CHECK_HOST": {
      if (typeof data.hostname !== "string") {
        sendResponse(false);
        return;
      }
      const language = await getSessionLanguage();
      const allowed = await isHostAllowed(data.hostname);
      logger.info(
        "background",
        t(allowed ? "logHostAllowed" : "logHostDenied", language, normalizeHost(data.hostname))
      );
      sendResponse(allowed);
      return;
    }
    case "SESSION_STARTED":
      void onSessionStarted(data, sender, sendResponse);
      return;
    case "SESSION_ENDED": {
      await serializeSession(async () => {
        const session = await getSession();
        if (session && typeof data.sessionId === "string" && session.sessionId !== data.sessionId) {
          return;
        }
        const language = session?.language ?? await getSessionLanguage();
        await clearSession();
        await clearSessionLanguage();
        await clearBadge();
        logger.info("background", t("logSessionEnded", language));
      });
      sendResponse({ ok: true });
      return;
    }
    case "PING_BACKGROUND": {
      const session = await getSession();
      sendResponse({ ok: !!session && session.tabId === sender.tab?.id });
      return;
    }
    case "EXTENSION_EVENT": {
      const session = await getSession();
      if (!session || sender.tab?.id !== session.tabId) {
        logger.debug("background", t("logNoSession", await getSessionLanguage()));
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
    case "CONTENT_LOG": {
      if (isLogEntry(data.entry)) {
        logger.log(data.entry.level, data.entry.module, data.entry.message, data.entry.context);
      }
      sendResponse({ ok: true });
      return;
    }
    case "GET_STATE": {
      sendResponse(await getRuntimeState());
      return;
    }
    case "SET_ENABLED": {
      const enabled = data.enabled === true;
      const session = await getSession();
      const language = session?.language ?? await getSessionLanguage();
      if (session) {
        sendResponse({ ok: false, reason: "session_active" });
        return;
      }
      await setEnabled(enabled);
      logger.info("background", t(enabled ? "logEnabled" : "logDisabled", language));
      if (enabled) await notifyEnabled(browserLanguage());
      else await notifyDisabled(browserLanguage());
      sendResponse({ ok: true });
      return;
    }
    case "SET_DEBUG": {
      const debug = data.debug === true;
      await setDebug(debug);
      await loadLoggerLevel();
      logger.info("background", t(debug ? "logDebugOn" : "logDebugOff", await getSessionLanguage()));
      sendResponse({ ok: true });
      return;
    }
    case "SET_TEST_HOSTS": {
      if (true) {
        sendResponse({ ok: false });
        return;
      }
      const enabled = data.enabled === true;
      await setTestHosts(enabled);
      logger.info(
        "background",
        t(enabled ? "logTestHostsOn" : "logTestHostsOff", await getSessionLanguage())
      );
      sendResponse({ ok: true });
      return;
    }
    case "REFRESH_ALLOWLIST": {
      const ok = await refreshAllowlist();
      sendResponse({ ok, allowlist: await getAllowlistInfo() });
      return;
    }
    default:
      logger.debug("background", t("logIgnoredMessage", browserLanguage(), type));
      sendResponse({ ok: false });
  }
}
async function getRuntimeState() {
  const session = await getSession();
  const language = session?.language ?? await getSessionLanguage();
  return {
    session,
    language,
    enabled: await getEnabled(),
    debug: await getDebug(),
    testHosts: false ? await getTestHosts2() : false,
    dev: false,
    version: "1.0.0",
    allowlist: await getAllowlistInfo()
  };
}
async function onAlarm(alarm) {
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
    logger.warn("background", t("logTabLost", session.language));
    return;
  }
  try {
    await chrome.tabs.sendMessage(session.tabId, { type: "PING_FROM_EXTENSION" });
    logger.debug("alarms", t("logHeartbeat", session.language));
  } catch (error) {
    logger.debug("alarms", t("logHeartbeatFailed", session.language), { error: String(error) });
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
    logger.warn("background", t("logIgnoredMessage", browserLanguage(), "sender"));
    return false;
  }
  void onRuntimeMessage(message, sender, sendResponse);
  return true;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.debug_logging) {
    void loadLoggerLevel();
  }
});
registerTabActivityDetection();
void bootstrap();
//# sourceMappingURL=service-worker.js.map
