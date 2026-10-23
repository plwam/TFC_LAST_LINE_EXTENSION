// src/detectors/vmDetector.ts
var SOFTWARE_RENDERERS = [
  /swiftshader/i,
  /llvmpipe/i,
  /softpipe/i,
  /microsoft basic render/i,
  /mesa offscreen/i,
  /google swiftshader/i
];
var VIRTUAL_MARKERS = [
  /virtualbox/i,
  /vmware/i,
  /qemu/i,
  /hyper-v/i,
  /parallels/i,
  /virgl/i,
  /xen/i
];
function evaluateVmIndices(input) {
  const renderer = (input.renderer ?? "").toLowerCase();
  const vendor = (input.vendor ?? "").toLowerCase();
  const reasons = /* @__PURE__ */ new Set();
  if (SOFTWARE_RENDERERS.some((pattern) => pattern.test(renderer))) {
    reasons.add("software_renderer");
  }
  if (VIRTUAL_MARKERS.some((pattern) => pattern.test(renderer) || pattern.test(vendor))) {
    reasons.add("virtual_gpu_vendor");
  }
  if (typeof input.hardwareConcurrency === "number" && input.hardwareConcurrency > 0 && input.hardwareConcurrency <= 2) {
    reasons.add("low_cpu");
  }
  if (typeof input.deviceMemory === "number" && input.deviceMemory > 0 && input.deviceMemory <= 2) {
    reasons.add("low_memory");
  }
  if (/headless/i.test(input.userAgent ?? "")) {
    reasons.add("headless");
  }
  return reasons.size >= 2 ? [...reasons] : [];
}
function readWebGlInfo() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return {};
    const debug = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debug) return {};
    return {
      renderer: String(gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) ?? ""),
      vendor: String(gl.getParameter(debug.UNMASKED_VENDOR_WEBGL) ?? "")
    };
  } catch {
    return {};
  }
}
function detectVmIndices() {
  const webgl = readWebGlInfo();
  const nav = typeof navigator === "undefined" ? void 0 : navigator;
  const deviceMemory = nav?.deviceMemory;
  return evaluateVmIndices({
    renderer: webgl.renderer,
    vendor: webgl.vendor,
    hardwareConcurrency: nav?.hardwareConcurrency,
    deviceMemory,
    userAgent: nav?.userAgent
  });
}

// src/shared/events.ts
var EXTENSION_EVENT_TYPES = /* @__PURE__ */ new Set([
  "TAB_CHANGE_EXT" /* TAB_CHANGE_EXT */,
  "NAVIGATION_EXT" /* NAVIGATION_EXT */,
  "SUSPICIOUS_ENVIRONMENT" /* SUSPICIOUS_ENVIRONMENT */
]);

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
function t(key, language2 = browserLanguage(), substitutions) {
  const entry = PACKS[language2][key] ?? PACKS.fr[key];
  return applySubstitutions(entry?.message ?? key, substitutions);
}

// src/shared/protocol.ts
var PROTOCOL_CHANNEL = "examsdk";
var VM_REASONS = [
  "software_renderer",
  "virtual_gpu_vendor",
  "low_cpu",
  "low_memory",
  "headless"
];
var SYSTEM_REASONS = ["abnormal_resolution", "multiple_displays"];
function isSdkMessage(data) {
  if (typeof data !== "object" || data === null) return false;
  const message = data;
  return message.channel === PROTOCOL_CHANNEL && typeof message.type === "string";
}
function readLanguage(message) {
  return resolveLanguage(message.language);
}
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
function buildHandshakeAck(version) {
  return {
    channel: PROTOCOL_CHANNEL,
    type: "HANDSHAKE_ACK",
    timestamp: Date.now(),
    extension_version: version
  };
}
function buildPong() {
  return { channel: PROTOCOL_CHANNEL, type: "PONG", timestamp: Date.now() };
}
function buildEvent(payload) {
  return { channel: PROTOCOL_CHANNEL, type: "EVENT", payload, timestamp: Date.now() };
}
function buildLog(level, module, message, context) {
  return {
    channel: PROTOCOL_CHANNEL,
    type: "LOG",
    level,
    module,
    message,
    context,
    timestamp: Date.now()
  };
}

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
async function getDebug() {
  return await read(chrome.storage.local, KEYS.debug) ?? false;
}

// src/content-scripts/logger.ts
var logger = new ExtLogger("info");
logger.addSink((entry) => {
  try {
    void chrome.runtime.sendMessage({ type: "CONTENT_LOG", entry }).catch(() => void 0);
  } catch {
  }
});
async function syncContentLogLevel() {
  logger.setLevel(await getDebug() ? "debug" : "info");
}

// src/content-scripts/bridge.ts
var initialized = false;
var connected = false;
var sessionId;
var language = browserLanguage();
var pageEnvironmentChecked = false;
var backgroundWarningPosted = false;
function postToPage(message) {
  window.postMessage(message, window.location.origin);
}
function sendToBackground(message) {
  try {
    return Promise.resolve(chrome.runtime.sendMessage(message)).catch(() => void 0);
  } catch {
    return Promise.resolve(void 0);
  }
}
function backgroundAccepted(response) {
  return typeof response === "object" && response !== null && response.ok === true;
}
function warnBackgroundUnavailable() {
  if (backgroundWarningPosted) return;
  backgroundWarningPosted = true;
  postToPage(
    buildLog(
      "warn",
      "bridge",
      t("logBackgroundUnavailable", language)
    )
  );
}
function onMessageFromSdk(event) {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;
  if (!isSdkMessage(event.data)) return;
  const message = event.data;
  if (message.type === "HANDSHAKE") {
    if (typeof message.sessionId !== "string" || message.sessionId.length === 0) {
      logger.warn("bridge", t("logIgnoredMessage", browserLanguage(), "HANDSHAKE"));
      return;
    }
    sessionId = message.sessionId;
    language = readLanguage(message);
    connected = true;
    postToPage(buildHandshakeAck(chrome.runtime.getManifest().version));
    void sendToBackground({ type: "SESSION_STARTED", sessionId, language }).then((response) => {
      if (!backgroundAccepted(response)) warnBackgroundUnavailable();
    });
    logger.info("bridge", t("logBridgeHandshake", language));
    void runPageEnvironmentCheck();
    return;
  }
  if (message.type === "PING") {
    if (sessionId && message.sessionId && message.sessionId !== sessionId) return;
    void sendToBackground({ type: "PING_BACKGROUND" }).then((response) => {
      if (!backgroundAccepted(response)) {
        warnBackgroundUnavailable();
        return;
      }
      postToPage(buildPong());
    });
    return;
  }
  if (message.type === "DISCONNECT") {
    if (!connected) return;
    const endingSession = sessionId;
    connected = false;
    sessionId = void 0;
    void sendToBackground({ type: "SESSION_ENDED", sessionId: endingSession });
    logger.info("bridge", t("logSessionEnded", language));
    return;
  }
  logger.debug("bridge", t("logIgnoredMessage", language, message.type));
}
function onMessageFromBackground(message, sender) {
  if (sender.id !== chrome.runtime.id) return false;
  if (typeof message !== "object" || message === null) return false;
  const data = message;
  if (data.type === "FORWARD_EVENT") {
    const payload = sanitizeEventPayload(data.payload);
    if (payload) postToPage(buildEvent(payload));
    return false;
  }
  if (data.type === "LOG") {
    const entry = data.entry;
    if (entry && typeof entry.level === "string" && typeof entry.module === "string" && typeof entry.message === "string") {
      postToPage(buildLog(entry.level, entry.module, entry.message, entry.context));
    }
    return false;
  }
  if (data.type === "PING_FROM_EXTENSION") {
    postToPage(buildPong());
    logger.debug("bridge", t("logHeartbeat", language));
    return false;
  }
  return false;
}
async function runPageEnvironmentCheck() {
  if (pageEnvironmentChecked) return;
  pageEnvironmentChecked = true;
  const reasons = detectVmIndices();
  logger.debug("detectors", t("logPageEnvironment", language), { indices: reasons.length });
  if (reasons.length < 2) return;
  logger.info("detectors", t("logEnvironmentSuspicious", language, reasons.join(", ")), {
    reasons
  });
  sendToBackground({
    type: "EXTENSION_EVENT",
    payload: { type: "SUSPICIOUS_ENVIRONMENT" /* SUSPICIOUS_ENVIRONMENT */, reasons }
  });
}
function init() {
  if (initialized) return;
  initialized = true;
  void syncContentLogLevel();
  window.addEventListener("message", onMessageFromSdk);
  chrome.runtime.onMessage.addListener(onMessageFromBackground);
  logger.info("bridge", t("logBridgeReady", browserLanguage(), window.location.hostname));
}
export {
  init
};
//# sourceMappingURL=bridge.js.map
