"use strict";
(() => {
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
  function browserLanguage() {
    try {
      const ui2 = chrome.i18n.getUILanguage();
      return ui2.toLowerCase().startsWith("en") ? "en" : "fr";
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
  function formatDateTime(timestamp, language) {
    try {
      return new Intl.DateTimeFormat(language === "fr" ? "fr-FR" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(timestamp));
    } catch {
      return new Date(timestamp).toISOString();
    }
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

  // src/popup/popup.ts
  var logger = new ExtLogger("info");
  function element(id) {
    const found = document.getElementById(id);
    if (!found) throw new Error(`\xC9l\xE9ment introuvable : ${id}`);
    return found;
  }
  var ui = {
    title: element("title"),
    devBadge: element("dev-badge"),
    statusDot: element("status-dot"),
    statusText: element("status-text"),
    versionLabel: element("version-label"),
    version: element("version"),
    languageLabel: element("language-label"),
    language: element("language"),
    enabled: element("enabled"),
    enabledLabel: element("enabled-label"),
    debug: element("debug"),
    debugLabel: element("debug-label"),
    testHostsRow: element("test-hosts-row"),
    testHosts: element("test-hosts"),
    testHostsLabel: element("test-hosts-label"),
    allowlistHeading: element("allowlist-heading"),
    allowlistInfo: element("allowlist-info"),
    refresh: element("refresh"),
    refreshResult: element("refresh-result")
  };
  var state;
  async function send(message) {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      logger.warn("popup", t("refreshFailed"), { error: String(error) });
      return void 0;
    }
  }
  function render() {
    if (!state) return;
    const language = state.language;
    document.documentElement.lang = language;
    ui.title.textContent = t("popupTitle", language);
    ui.devBadge.textContent = t("devBuildLabel", language);
    ui.devBadge.classList.toggle("hidden", !state.dev);
    ui.statusDot.classList.toggle("active", !!state.session);
    ui.statusText.textContent = state.session ? t("statusActive", language) : t("statusNoSession", language);
    ui.versionLabel.textContent = t("versionLabel", language);
    ui.version.textContent = state.version;
    ui.languageLabel.textContent = t("languageLabel", language);
    ui.language.textContent = t(language === "fr" ? "languageFr" : "languageEn", language);
    ui.enabled.checked = state.enabled;
    ui.enabled.disabled = !!state.session;
    ui.enabledLabel.textContent = t("enabledLabel", language);
    ui.debug.checked = state.debug;
    ui.debugLabel.textContent = t("debugLabel", language);
    ui.testHostsRow.classList.toggle("hidden", !state.dev);
    ui.testHosts.checked = state.testHosts;
    ui.testHostsLabel.textContent = t("testHostsLabel", language);
    ui.allowlistHeading.textContent = t("allowlistHeading", language);
    const count = t("allowlistCount", language, String(state.allowlist.count));
    const updated = state.allowlist.fetchedAt === void 0 ? t("allowlistNever", language) : t(
      "allowlistUpdated",
      language,
      formatDateTime(state.allowlist.fetchedAt, language)
    );
    ui.allowlistInfo.textContent = `${count} \u2014 ${updated}`;
    ui.refresh.textContent = t("refreshAction", language);
  }
  async function reload() {
    const next = await send({ type: "GET_STATE" });
    if (next) {
      state = next;
      render();
    }
  }
  ui.enabled.addEventListener("change", () => {
    void (async () => {
      await send({ type: "SET_ENABLED", enabled: ui.enabled.checked });
      await reload();
    })();
  });
  ui.debug.addEventListener("change", () => {
    void (async () => {
      await send({ type: "SET_DEBUG", debug: ui.debug.checked });
      await reload();
    })();
  });
  ui.testHosts.addEventListener("change", () => {
    void (async () => {
      await send({ type: "SET_TEST_HOSTS", enabled: ui.testHosts.checked });
      await reload();
    })();
  });
  ui.refresh.addEventListener("click", () => {
    void (async () => {
      if (!state) return;
      ui.refresh.disabled = true;
      const response = await send({ type: "REFRESH_ALLOWLIST" });
      ui.refreshResult.textContent = t(
        response?.ok ? "refreshDone" : "refreshFailed",
        state.language
      );
      ui.refresh.disabled = false;
      await reload();
    })();
  });
  void reload();
})();
//# sourceMappingURL=popup.js.map
