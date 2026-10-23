# Extension navigateur — événements détectés et tâches

> Synthèse de l'implémentation (`src/`). Références : `03_EXTENSION (1).md`, `03b_EXTENSION_MODIFICATIONS.md`.

## 1. Événements envoyés au SDK

L'extension n'est autorisée à émettre que trois codes (`EXTENSION_EVENT_TYPES`, `src/shared/events.ts:45`) :

| Événement | Déclencheur | Charge utile |
|---|---|---|
| `TAB_CHANGE_EXT` | Onglet d'examen quitté, puis reprise (ou retour) | `{}` au départ, `{ duration_ms }` au retour (`src/background/tabActivityDetector.ts:21`) |
| `NAVIGATION_EXT` | Navigation principale vers un **autre domaine** que l'hôte d'examen | `{ domain }` (domaine seul, jamais l'URL complète) |
| `SUSPICIOUS_ENVIRONMENT` | Environnement VM ou système suspect | `{ reasons, display_count? }` |

### Codes de raison

**Côté page** (content script), émis si **au moins 2 indices** (`src/detectors/vmDetector.ts:30`) :

| Code | Condition |
|---|---|
| `software_renderer` | Renderer WebGL logiciel (SwiftShader, llvmpipe, softpipe, Microsoft Basic Render, Mesa Offscreen, Google SwiftShader) |
| `virtual_gpu_vendor` | Marqueur d'hyperviseur (VirtualBox, VMware, QEMU, Hyper-V, Parallels, virGL, Xen) dans le renderer ou le vendor |
| `low_cpu` | `navigator.hardwareConcurrency <= 2` |
| `low_memory` | `navigator.deviceMemory <= 2` (Go) |
| `headless` | `HeadlessChrome` dans le user-agent |

**Côté système** (service worker), émis dès qu'une raison existe (`src/background/environmentDetector.ts:12`) :

| Code | Condition |
|---|---|
| `abnormal_resolution` | Un écran a une largeur < 800 px ou une hauteur < 600 px |
| `multiple_displays` | Plus d'un écran détecté (`chrome.system.display`) |

`display_count` n'est ajouté que si le nombre d'écrans est un entier strictement positif.

## 2. Tâches de l'extension

- **Garde d'hôte** : injecte le pont uniquement si le domaine est autorisé (liste blanche, ou hôte de test en développement) et si l'extension est activée (`src/content-scripts/hostGate.ts`, `src/background/hostAllowlist.ts`).
- **Liste blanche** : récupère `GET /public/registered-hosts/`, cache de 30 min, cache considéré périmé après 2 h, actualisation manuelle depuis la popup.
- **Cycle de session** : `HANDSHAKE` / `HANDSHAKE_ACK` (version + langue), `SESSION_STARTED` / `SESSION_ENDED`, `PING` / `PONG`, `DISCONNECT` (`src/content-scripts/bridge.ts`).
- **Surveillance des onglets** : changement d'onglet, navigation inter-domaines, fermeture de l'onglet d'examen (fin de session) (`src/background/tabActivityDetector.ts`).
- **Environnement** : détection VM dans la page et écrans/résolution via `chrome.system.display` au démarrage de session.
- **Journal** : écriture dans la console du service worker et relais `LOG` vers le SDK (module `extension`), niveau réglable via l'option de débogage.
- **Interface** : popup (état, version, langue, activation, débogage, hôtes de test, liste blanche), badge « actif » pendant la session, notifications d'activation/désactivation.
- **Robustesse** : alarmes (heartbeat 30 s, actualisation de la liste 30 min), état persisté dans `chrome.storage.session`/`local` pour survivre à la suspension du service worker, contrôles `sender.id`, `origin` et canal.

## 3. Ce que l'extension ne fait pas

Focus, presse-papiers, webcam/micro, devtools, plein écran, impression, frappe suspecte, inactivité, etc. ne sont **pas** gérés par l'extension : ces détections relèvent du SDK. L'extension ne fait aucun appel réseau en dehors de la liste blanche.
