"use strict";
(() => {
  // src/content-scripts/hostGate.ts
  void (async () => {
    try {
      const allowed = await chrome.runtime.sendMessage({
        type: "CHECK_HOST",
        hostname: window.location.hostname
      });
      if (allowed !== true) return;
      const bridgeUrl = chrome.runtime.getURL("content-scripts/bridge.js");
      const bridge = await import(
        /* webpackIgnore: true */
        bridgeUrl
      );
      bridge.init?.();
    } catch {
    }
  })();
})();
//# sourceMappingURL=hostGate.js.map
