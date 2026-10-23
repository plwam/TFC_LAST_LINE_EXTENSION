# Extension navigateur (Chrome, Manifest V3) — Spécification d'implémentation complète

> **Prérequis de lecture :** `00_PROJECT_OVERVIEW.md` et `02_SDK.md` (protocole `ExtensionBridge`, vu côté SDK — ce document en est le miroir exact côté extension). Ce document remplace toute version antérieure.

---

## 0. Rappel de coexistence avec les autres modules

| Module tiers | Point de contact | Document de référence |
| :--- | :--- | :--- |
| **Backend** | Récupère la liste des domaines clients enregistrés (§5) ; ne reçoit jamais d'événement directement — tout transite par le SDK | `01_BACKEND.md` §3 (nouvel endpoint public) |
| **SDK** | Communication exclusivement via `window.postMessage`, protocole strictement symétrique à `02_SDK.md` §12 | `02_SDK.md` §12 |
| **Tests** | Fichiers miroirs attendus | `04_TESTS.md` §4 |

---

## 1. Le problème de permission à résoudre — et pourquoi il détermine toute l'architecture

Une extension Manifest V3 reçoit ses permissions d'hôte (`host_permissions`) **une seule fois, à l'installation**, déclarées statiquement dans `manifest.json`. Elle ne peut pas s'auto-étendre à de nouveaux domaines en cours de vie — c'est une protection du navigateur, pas une limite technique contournable.

Or le projet a un besoin dynamique : chaque nouveau développeur qui s'inscrit ajoute un nouveau domaine LMS sur lequel l'extension doit s'activer, **sans jamais republier l'extension sur le Chrome Web Store**.

**Solution retenue (Option A, validée)** : l'extension déclare une permission large à l'installation (`<all_urls>`), mais reste **techniquement présente et silencieuse** sur tous les sites. Elle ne s'active (handshake, heartbeat, détection) que sur les domaines figurant dans une liste blanche récupérée dynamiquement depuis le backend. La permission Chrome est large ; le comportement réel est filtré en interne, par notre propre code — pas par le navigateur.

```
Permission Chrome (large, statique)  ⊇  Domaines où l'extension AGIT réellement (dynamique, filtré par nous)
```

C'est le même modèle que des extensions comme Grammarly ou LastPass, qui doivent aussi fonctionner sur un ensemble de sites non connu à l'avance.

---

## 2. Stack technique et justifications

| Technologie | Rôle | Pourquoi ce choix précis |
| :--- | :--- | :--- |
| **Manifest V3** | Format d'extension | Obligatoire (V2 déprécié). Impose un **service worker** non persistant — à concevoir en sachant qu'il peut être tué et redémarré par Chrome à tout moment, jamais de variable en mémoire supposée durable. |
| **TypeScript** | Langage | Cohérence avec le SDK, `EventType` importé du même fichier de types partagé (`@project/shared-types` en monorepo). |
| **Vite + `@crxjs/vite-plugin`** | Build | Seul outil qui gère correctement le rechargement à chaud pour Manifest V3 (service worker + plusieurs content scripts) — les bundlers génériques gèrent mal ce cas. |
| **`chrome.storage.local`** | Cache de la liste d'hôtes | Persiste au-delà des redémarrages du service worker (contrairement à une simple variable JS) — indispensable vu le cycle de vie éphémère de MV3. |
| **`chrome.alarms`** | Planification (heartbeat, rafraîchissement de la liste) | `setInterval` ne survit pas à la suspension du service worker — `chrome.alarms` est l'API prévue par Chrome pour ce cas précis. |

---

## 3. Vue d'ensemble en couches

```
┌──────────────────────────────────────────────────────────────┐
│ 1. MANIFEST                manifest.json                        │  permissions larges, déclaratif
├──────────────────────────────────────────────────────────────┤
│ 2. SERVICE WORKER            background/service-worker.ts        │  cerveau persistant-logique de l'extension
│    ├── Gestion de la liste blanche d'hôtes (§5)                  │
│    ├── Heartbeat (§8)                                             │
│    └── Détection d'environnement au niveau système (§9)           │
├──────────────────────────────────────────────────────────────┤
│ 3. CONTENT SCRIPTS            content-scripts/                    │  injectés sur CHAQUE page (<all_urls>)
│    ├── hostGate.ts  → vérifie si le domaine est autorisé (§6)      │
│    └── bridge.ts    → relais SDK ↔ service worker (§7)             │
├──────────────────────────────────────────────────────────────┤
│ 4. DÉTECTEURS                 detectors/                          │  exécutés depuis le service worker
├──────────────────────────────────────────────────────────────┤
│ 5. POPUP                      popup/                              │  UI d'activation hors session (§10)
└──────────────────────────────────────────────────────────────┘
```

**Principe central de cette version** : le content script est injecté sur **toutes** les pages (permission large), mais `hostGate.ts` est la **toute première chose exécutée** — si le domaine n'est pas dans la liste blanche, absolument rien d'autre ne s'exécute. Le reste du content script (bridge, détecteurs) ne charge même pas.

---

## 4. Arborescence complète

```
extension/
├── manifest.json
├── src/
│   ├── background/
│   │   ├── service-worker.ts
│   │   ├── hostAllowlist.ts          # NOUVEAU — gestion de la liste blanche
│   │   └── heartbeatScheduler.ts
│   ├── content-scripts/
│   │   ├── hostGate.ts                # NOUVEAU — porte d'entrée, premier fichier exécuté
│   │   └── bridge.ts
│   ├── detectors/
│   │   ├── tabActivityDetector.ts
│   │   └── environmentDetector.ts
│   ├── popup/
│   │   ├── popup.html
│   │   └── popup.ts
│   └── shared/
│       └── messageTypes.ts
└── icons/
```

---

## 5. Gestion de la liste blanche d'hôtes — `background/hostAllowlist.ts` (la nouveauté centrale)

### 5.1 Contrat avec le Backend

```
GET https://api.examsdk.com/public/registered-hosts/
→ 200 OK
{ "hosts": ["lms-universite-a.edu", "moodle.exemple.org", "..."], "generated_at": "2026-09-13T10:00:00Z" }
```
Endpoint **public, non authentifié** (l'extension n'a pas de `secret_key` à sa disposition — elle n'est pas un tenant, c'est un artefact partagé par tous les tenants). Ne renvoie que des noms de domaine, jamais d'autre information sur les développeurs — voir §14 (limite de confidentialité assumée).

### 5.2 Fonctions

```typescript
interface AllowlistCache { hosts: string[]; fetchedAt: number; }

const CACHE_KEY = 'host_allowlist_cache';
const REFRESH_INTERVAL_MINUTES = 30;
const STALE_AFTER_MS = 2 * 60 * 60 * 1000;   // 2h — au-delà, une liste non rafraîchie est jugée trop ancienne

export async function refreshAllowlist(): Promise<void> {
  try {
    const res = await fetch('https://api.examsdk.com/public/registered-hosts/');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { hosts } = await res.json();
    await chrome.storage.local.set({ [CACHE_KEY]: { hosts, fetchedAt: Date.now() } satisfies AllowlistCache });
  } catch {
    // Échec silencieux volontaire : on garde le cache existant plutôt que de vider la liste
    // (éviter qu'une panne réseau temporaire désactive l'extension partout d'un coup)
  }
}

export async function isHostAllowed(hostname: string): Promise<boolean> {
  const { [CACHE_KEY]: cache } = await chrome.storage.local.get(CACHE_KEY) as { [CACHE_KEY]?: AllowlistCache };
  if (!cache) return false;                                    // aucun cache = prembattre de sécurité, rien n'est autorisé
  if (Date.now() - cache.fetchedAt > STALE_AFTER_MS) {
    refreshAllowlist();                                          // tente un rafraîchissement en tâche de fond
    // mais on continue avec le cache existant pour cette vérification, plutôt que de bloquer sur le réseau
  }
  return cache.hosts.some(h => hostname === h || hostname.endsWith(`.${h}`));  // supporte les sous-domaines
}
```

| Fonction | Rôle | Justification de chaque décision |
| :--- | :--- | :--- |
| `refreshAllowlist` | Récupère la liste à jour et la persiste | Échec réseau → **on garde l'ancien cache plutôt que de le vider** : mieux vaut fonctionner avec une liste légèrement périmée que de désactiver l'extension partout à la moindre coupure réseau du backend |
| `isHostAllowed` | Vérifie un domaine donné | Pas de cache du tout (premier lancement, jamais eu de réseau) → retourne `false` par défaut, **jamais `true`** — principe de précaution : en cas de doute, l'extension reste inactive plutôt que de s'activer par erreur sur un site non enregistré |
| Support des sous-domaines (`endsWith`) | Un LMS peut être sur `examens.universite-a.edu` alors que le développeur a enregistré `universite-a.edu` | Évite de forcer chaque développeur à lister exhaustivement tous ses sous-domaines |

### 5.3 Planification du rafraîchissement — `background/heartbeatScheduler.ts` (partagé avec le heartbeat, même mécanisme `chrome.alarms`)

```typescript
chrome.alarms.create('refresh-allowlist', { periodInMinutes: REFRESH_INTERVAL_MINUTES });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-allowlist') refreshAllowlist();
});
chrome.runtime.onInstalled.addListener(() => refreshAllowlist());   // premier chargement immédiat à l'installation
chrome.runtime.onStartup.addListener(() => refreshAllowlist());      // au redémarrage du navigateur
```

---

## 6. Manifest — `manifest.json`

```json
{
  "manifest_version": 3,
  "name": "Exam Surveillance Extension",
  "version": "1.0.0",
  "permissions": ["tabs", "webNavigation", "storage", "alarms"],
  "host_permissions": ["http://*/*", "https://*/*"],
  "background": { "service_worker": "background/service-worker.js", "type": "module" },
  "content_scripts": [
    { "matches": ["<all_urls>"], "js": ["content-scripts/hostGate.js"], "run_at": "document_start" }
  ],
  "action": { "default_popup": "popup/popup.html" }
}
```

| Champ | Valeur | Justification |
| :--- | :--- | :--- |
| `host_permissions` | `http://*/*`, `https://*/*` | Permission large assumée (§1) — **à justifier explicitement dans la fiche Chrome Web Store** lors de la soumission, en expliquant le modèle de filtrage interne |
| `content_scripts.matches` | `<all_urls>` | Injecté partout, mais `hostGate.ts` coupe court immédiatement si non autorisé |
| `run_at: document_start` | Avant le rendu de la page | Le gate doit s'exécuter le plus tôt possible — inutile d'attendre le chargement complet d'une page sur laquelle on ne fera rien |
| Pas de `content_scripts.js` autre que `hostGate.js` | Le reste (`bridge.js`) est injecté dynamiquement | Voir §7 — évite de charger inutilement tout le code du bridge sur des millions de pages non concernées |

---

## 7. Porte d'entrée du content script — `content-scripts/hostGate.ts`

**Rôle** : unique fichier statiquement injecté sur toutes les pages. Sa seule responsabilité est de décider si le reste doit s'exécuter.

```typescript
(async () => {
  const allowed = await chrome.runtime.sendMessage({ type: 'CHECK_HOST', hostname: window.location.hostname });
  if (!allowed) return;                          // arrêt immédiat — rien d'autre n'est chargé, aucune trace d'activité

  const bridgeModule = await import(chrome.runtime.getURL('content-scripts/bridge.js'));
  bridgeModule.init();
})();
```

| Fonction | Rôle | Pourquoi un import dynamique plutôt qu'un simple `if` |
| :--- | :--- | :--- |
| IIFE async | Point d'entrée unique | `document_start` interdit `await` au niveau module dans certains contextes — l'IIFE async contourne ça proprement |
| `chrome.runtime.sendMessage({ type: 'CHECK_HOST' })` | Délègue la vérification au service worker (qui a accès à `chrome.storage.local`) | Le content script n'a pas d'accès direct simple à `chrome.storage` dans tous les contextes — centraliser la logique de vérification dans le service worker (source unique de vérité) évite toute divergence |
| `import()` dynamique de `bridge.js` | Ne charge le code du bridge (et donc toute la logique DOM/messages) que si vraiment nécessaire | Sur les millions de pages non concernées, le navigateur de l'utilisateur ne télécharge/parse **jamais** ce code — impact mémoire/CPU nul sur les sites non-clients |

Le message `CHECK_HOST` est traité côté service worker :
```typescript
// service-worker.ts, extrait
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'CHECK_HOST') {
    isHostAllowed(msg.hostname).then(sendResponse);
    return true;   // indique une réponse asynchrone à chrome.runtime
  }
});
```

---

## 8. Le pont — `content-scripts/bridge.ts` (chargé uniquement si le domaine est autorisé)

**Rôle** : symétrique exact de `ExtensionBridge` côté SDK (`02_SDK.md` §12) — mêmes types de message, même machine à états, vue depuis l'autre bout du canal.

```typescript
export function init(): void {
  window.addEventListener('message', onMessageFromSdk);
  chrome.runtime.onMessage.addListener(onMessageFromServiceWorker);
}

function onMessageFromSdk(event: MessageEvent): void {
  if (event.source !== window) return;
  if (event.origin !== window.location.origin) return;
  const msg = event.data;
  if (msg?.channel !== 'examsdk') return;

  if (msg.type === 'HANDSHAKE') {
    window.postMessage({ channel: 'examsdk', type: 'HANDSHAKE_ACK', timestamp: Date.now() }, window.location.origin);
    chrome.runtime.sendMessage({ type: 'SESSION_STARTED', sessionId: msg.sessionId });
  }
  if (msg.type === 'PING') {
    window.postMessage({ channel: 'examsdk', type: 'PONG', timestamp: Date.now() }, window.location.origin);
  }
  if (msg.type === 'DISCONNECT') {
    chrome.runtime.sendMessage({ type: 'SESSION_ENDED' });
  }
}

function onMessageFromServiceWorker(msg: any): void {
  // Relais dans l'autre sens : un événement détecté par le service worker (changement d'onglet, environnement suspect)
  // doit remonter jusqu'au SDK dans la page
  if (msg.type === 'FORWARD_EVENT') {
    window.postMessage({ channel: 'examsdk', type: 'EVENT', payload: msg.payload, timestamp: Date.now() }, window.location.origin);
  }
}
```

| Fonction | Rôle | Point de sécurité |
| :--- | :--- | :--- |
| `onMessageFromSdk` | Traite les messages venant de la page (SDK) | Double vérification `source`/`origin` — identique à l'exigence côté SDK |
| `onMessageFromServiceWorker` | Relaie les événements détectés au niveau navigateur (tabs, environnement) vers la page | Le content script est le **seul** intermédiaire possible entre le service worker (pas d'accès direct à `window` de la page) et le SDK |

---

## 9. Détecteurs — exécutés depuis le service worker — `detectors/`

### 9.1 `tabActivityDetector.ts`
```typescript
export function startTabActivityDetection(sessionTabId: number): void {
  chrome.tabs.onActivated.addListener(({ tabId }) => {
    if (tabId !== sessionTabId) forwardEvent(sessionTabId, 'TAB_CHANGE_EXT', {});
  });
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.tabId === sessionTabId && details.frameId === 0) {
      forwardEvent(sessionTabId, 'NAVIGATION_EXT', { url: details.url });
    }
  });
}

function forwardEvent(tabId: number, type: string, payload: object): void {
  chrome.tabs.sendMessage(tabId, { type: 'FORWARD_EVENT', payload: { type, ...payload } });
}
```
**Pourquoi ça doit être ici et pas dans le SDK** : `chrome.tabs`/`chrome.webNavigation` sont des API d'extension, invisibles depuis une page web classique — c'est exactement la capacité "profonde" que l'extension apporte par rapport au SDK seul (cf. `00_PROJECT_OVERVIEW.md`).

### 9.2 `environmentDetector.ts`
```typescript
export async function detectSuspiciousEnvironment(): Promise<EnvironmentReport> {
  const info = await chrome.system.display.getInfo();     // nécessite la permission "system.display"
  const abnormalResolution = info.some(d => d.bounds.width < 800);   // seuil indicatif
  return { abnormalResolution, displayCount: info.length };
}
```
**Limite assumée, explicitement documentée** : ce sont des indices de suspicion (résolution, nombre d'écrans), jamais une preuve formelle de machine virtuelle — ils alimentent le score de risque agrégé côté backend (`01_BACKEND.md` §5), ils ne bloquent jamais une session à eux seuls.

---

## 10. Heartbeat — `background/heartbeatScheduler.ts` (complète §5.3)

```typescript
chrome.alarms.create('heartbeat', { periodInMinutes: 0.1 });   // ~6s
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== 'heartbeat') return;
  chrome.tabs.query({ active: true }, (tabs) => {
    tabs.forEach(tab => chrome.tabs.sendMessage(tab.id!, { type: 'PING_FROM_EXTENSION' }));
  });
});
```
**Piège MV3 à éviter absolument** : un `setInterval` classique dans le service worker s'arrête dès que Chrome suspend le worker après ~30s d'inactivité — `chrome.alarms` est l'unique mécanisme fiable pour une action périodique qui survit à ces suspensions.

---

## 11. Sécurité contre l'injection de faux événements

```typescript
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return;    // rejette tout message qui ne vient pas de l'extension elle-même
  // ... traitement normal
});
```
Empêche un script tiers présent sur la page (ou une autre extension malveillante) d'injecter de faux messages `chrome.runtime` pour simuler des événements — génère `SIMULATED_EVENT_DETECTED` côté SDK si une tentative est repérée.

---

## 12. Popup — `popup/popup.ts`

Interface minimale : statut actuel (`Connecté à une session active` / `Aucune session`), bouton d'activation/désactivation manuelle **utilisable uniquement hors session active** (cohérent avec `02_SDK.md`, la désactivation en cours de session est détectée par le heartbeat et bloque la poursuite de l'examen, mais n'est jamais empêchée techniquement).

---

## 13. Flux complet de bout en bout

```
1. Installation de l'extension
   → chrome.runtime.onInstalled → refreshAllowlist() → cache initial en chrome.storage.local
   → chrome.alarms créées : 'heartbeat' (6s) et 'refresh-allowlist' (30min)

2. Étudiant navigue vers n'importe quel site
   → hostGate.ts s'exécute (document_start)
   → sendMessage('CHECK_HOST') → service worker → isHostAllowed(hostname)
      - non autorisé → return, RIEN d'autre ne s'exécute
      - autorisé → import dynamique de bridge.js → bridge.init()

3. Le SDK (sur la page) initialise et envoie HANDSHAKE
   → bridge.ts reçoit, vérifie origin, répond HANDSHAKE_ACK
   → notifie le service worker (SESSION_STARTED) → démarre tabActivityDetector pour cet onglet

4. En continu :
   - heartbeat : service worker → PING_FROM_EXTENSION → bridge.ts → PONG → SDK
   - tabActivityDetector détecte un changement d'onglet → forwardEvent → bridge.ts → postMessage EVENT → SDK
   - refreshAllowlist toutes les 30 min, en tâche de fond

5. Fin de session : SDK envoie DISCONNECT
   → bridge.ts → service worker (SESSION_ENDED) → arrêt de tabActivityDetector pour cet onglet
```

---

## 14. Checklist de sécurité

- [ ] `hostGate.ts` est le seul fichier statiquement injecté — tout le reste est chargé dynamiquement, uniquement si autorisé.
- [ ] Aucun cache de liste blanche = comportement par défaut `false` (jamais `true` par défaut).
- [ ] `postMessage` sortant toujours avec `window.location.origin`, jamais `'*'`.
- [ ] `chrome.runtime.onMessage` vérifie systématiquement `sender.id === chrome.runtime.id`.
- [ ] L'extension ne prétend jamais empêcher sa propre désactivation — seulement la détecter (heartbeat côté SDK).

## 15. Limites assumées

| Limite | Raison |
| :--- | :--- |
| Permission `<all_urls>` large, filtrée en interne | Contrainte structurelle de Manifest V3 — pas de permission dynamique par domaine sans friction utilisateur (Option A retenue) |
| Liste blanche potentiellement périmée jusqu'à 2h en cas de panne réseau prolongée du backend | Compromis assumé pour éviter qu'une panne temporaire désactive l'extension partout |
| L'endpoint public `/public/registered-hosts/` expose la liste des domaines clients à quiconque | Nécessaire au mécanisme, limité aux noms de domaine uniquement — jamais de nom d'entreprise ou d'information commerciale |
| Détection d'environnement (résolution, écrans) : indices, pas preuves | Alimente le score de risque, ne bloque jamais seule une session |
| Désactivation de l'extension : détectable, pas empêchable | Limite technique du navigateur, Ch.1 §3.1.2 |

---

## 16. Renvoi vers les autres documents

- Endpoint `GET /public/registered-hosts/` à ajouter côté backend, champ `Project.site_url` nécessaire → `01_BACKEND.md` (à mettre à jour)
- Protocole `postMessage` complet, vu côté SDK → `02_SDK.md` §12
- Tests attendus, notamment la simulation d'un cache de liste blanche vide/périmé → `04_TESTS.md` §4
