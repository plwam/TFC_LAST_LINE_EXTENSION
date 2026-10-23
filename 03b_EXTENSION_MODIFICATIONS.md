# 03b : Extension navigateur, modifications à appliquer

> **Complète `03_EXTENSION.md`**, qui reste la référence (architecture à liste blanche d'hôtes, `hostGate`, pont, détecteurs, heartbeat). Tout ce qui n'est pas mentionné ici reste **inchangé**. En cas de conflit, ce fichier prime.
> À lire avec `02_SDK.md` (§12, protocole du pont), `02b`, `02c` et `01_BACKEND.md`.
> Ces modifications viennent des décisions prises depuis la rédaction de `03_EXTENSION.md` : langue fr/en, modèle d'événement unifié, journal console, page de test, minimisation des données.
> Avant de coder, l'agent fournit la liste des **écarts** entre son code existant et ce fichier (§9).

## 1. Ce qui ne change pas (à ne pas casser)

1. **Option A validée** : permission large (`<all_urls>`), extension inerte hors des domaines de la liste blanche.
2. **Liste blanche d'hôtes** : `GET /public/registered-hosts/` (public, noms de domaine uniquement), cache `chrome.storage.local`, rafraîchissement par `chrome.alarms`, `false` par défaut sans cache.
3. **`hostGate.ts`** seul fichier injecté statiquement ; `bridge.js` chargé dynamiquement si l'hôte est autorisé.
4. **Protocole du pont** tel que défini en `02_SDK.md` §12 : canal `examsdk`, messages `HANDSHAKE`, `HANDSHAKE_ACK`, `PING`, `PONG`, `DISCONNECT`, `EVENT`. **Aucun renommage.** Les changements ci-dessous sont **additifs** (champs optionnels, nouveaux types ignorés par un SDK qui ne les connaît pas).
5. Contrôles de sécurité : `sender.id === chrome.runtime.id`, `postMessage` avec `window.location.origin`, vérification `source` et `origin`.
6. L'extension **n'envoie jamais** d'événement ni de donnée de session au backend. Son seul appel réseau est la récupération de la liste blanche.

## 2. Langue (français ou anglais)

1. Le message `HANDSHAKE` du SDK reçoit un champ **optionnel** `language` (`fr` ou `en`). Le SDK l'ajoute (voir `02c` §6).
2. Le pont le transmet au service worker avec `SESSION_STARTED` : `{ sessionId, language }`. La langue est conservée dans `chrome.storage.session` pour survivre à la suspension du service worker.
3. L'interface de l'extension (popup, badge, notifications, messages de log) utilise les fichiers de traduction Chrome (`_locales/fr/messages.json`, `_locales/en/messages.json`). Hors session : langue du navigateur, avec repli sur le français.
4. Aucune chaîne en dur dans le code.
5. **L'extension n'envoie ni `label` ni `description`.** Le SDK les génère à partir du code de l'événement, des détails et de la langue (dictionnaire de `02c` §3), y compris pour les événements venant de l'extension.

## 3. Événements : alignement sur le modèle unifié

1. Les codes sont ceux de l'énumération `EventType` partagée (`@project/shared-types`). Correspondance avec les noms descriptifs utilisés dans `02b` et `02c` : changement d'onglet = `TAB_CHANGE_EXT`, navigation = `NAVIGATION_EXT`. Pour tout autre signal de l'extension, l'agent vérifie le code existant ; s'il manque, il l'ajoute **dans le catalogue partagé**, côté SDK **et** backend (le backend rejette un code inconnu).
2. La forme du message `EVENT` reste celle de `03_EXTENSION.md` §9 (`payload: { type, ...détails }`). Les champs ajoutés par le SDK (`label`, `description`, `language`, `severity`, `confidence_score`, `priority`) ne sont **pas** produits par l'extension.
3. **Minimisation (à confirmer, recommandé).** `NAVIGATION_EXT` n'envoie plus l'adresse complète mais le **domaine seulement** (`domain` à la place de `url`). Les paramètres et chemins d'adresse peuvent contenir des données personnelles. Le SDK adapte sa description en conséquence (`02c` §3).
4. Durée hors onglet : pour `TAB_CHANGE_EXT`, ajouter `duration_ms` à la reprise de l'onglet d'examen, pour que la description du SDK puisse l'indiquer.
5. Le changement de focus de la fenêtre et la sortie de page sont déjà détectés par le **SDK** ; l'extension ne les duplique pas.

## 4. Détection de l'environnement

1. **Permission manquante.** `environmentDetector.ts` utilise `chrome.system.display`, qui exige la permission `system.display`, absente du manifeste de `03_EXTENSION.md` §6. L'ajouter, ou changer de méthode.
2. **Indices d'écrans** (résolution, nombre d'écrans) : conservés, avec la règle existante : indices, jamais preuves, pondérés dans le score de risque.
3. **Ajouts demandés par le chapitre 2 (BF-54, BF-55), à implémenter seulement s'ils n'existent pas déjà :**
   - indices de machine virtuelle (rendu graphique logiciel ou virtualisé, matériel atypique) : au moins deux indices cumulés avant d'émettre un événement ; le contexte de la page est nécessaire (le service worker n'a pas accès au rendu graphique) ;
   - périphériques virtuels : comparaison des noms de caméras et de micros à une **liste configurable** de logiciels de flux virtuels ; les noms ne sont lisibles qu'après autorisation d'accès aux périphériques.
4. Chaque nouveau signal possède un code `EventType` (§3.1) et des détails sobres (par exemple la liste des raisons, jamais de donnée brute).

## 5. Heartbeat : point d'attention sur la période

`03_EXTENSION.md` §10 prévoit `chrome.alarms` avec `periodInMinutes: 0.1` (environ 6 secondes). **À ma connaissance, Chrome impose une période minimale de l'ordre de 30 secondes aux extensions publiées** (la valeur fine ne s'applique qu'aux extensions chargées en mode développeur) ; l'agent vérifie dans la documentation de `chrome.alarms` pour la version cible.

Conséquences :
1. Les tests en mode développeur peuvent passer à 6 secondes alors que la production aura une période plus longue.
2. Le délai avant `extension_heartbeat_lost` côté SDK doit être **au moins trois fois la période effective**, soit plusieurs dizaines de secondes en production.
3. **Détection plus rapide sans alarme :** le SDK envoie déjà `PING` et le pont répond `PONG` (§1.4). Ce circuit utilise des minuteurs de la page, pas du service worker, et n'est donc pas soumis à la période minimale des alarmes. Si l'extension est désactivée ou supprimée, le pont ne répond plus. Recommandation : faire reposer la détection de perte d'extension sur ce `PING` / `PONG` (cadence de quelques secondes), et garder l'alarme comme mécanisme complémentaire. À valider avec le code actuel du SDK.
4. Le pont vérifie que son contexte est encore valide (`chrome.runtime.id` défini) avant de répondre ; un contexte invalidé ne répond plus.

## 6. Journal console de l'extension

1. Format : `[ProctorExt] hh:mm:ss.mmm [niveau] [module] message  { contexte }`, mêmes niveaux que le SDK (`02c` §2).
2. Modules : `background`, `content`, `popup`, `alarms`, `allowlist`, `detectors`, `bridge`.
3. Journaliser : état de la liste blanche (récupérée, échec, âge du cache), décision de `hostGate` (autorisé ou non, avec le domaine), poignée de main, début et fin de session, chaque événement émis, heartbeats (`debug`), messages ignorés, erreurs.
4. Niveau par défaut `info`. L'option de débogage de la popup active `debug` (conservée dans `chrome.storage.local`).
5. Les logs sont écrits dans la console du service worker **et** envoyés au SDK par un nouveau message **additif** `LOG` (`level`, `module`, `message`, `context`), que le SDK réémet par `on('log')` avec le module `extension`. Un SDK qui ne connaît pas `LOG` l'ignore.
6. Aucune donnée personnelle : domaine seulement, jamais d'adresse complète ni de contenu de page.

## 7. Mode test et page de test

1. **Problème pratique.** La page de test (`02c` §5) est servie sur `localhost`, qui n'est pas dans la liste blanche : `hostGate` bloquerait l'extension et aucun événement d'extension ne serait testable.
2. **Solution.** Option de débogage de la popup « Autoriser les hôtes de test » (`localhost`, `127.0.0.1`), conservée dans `chrome.storage.local`, qui s'ajoute à la liste blanche dans `isHostAllowed`. Elle est **compilée uniquement dans les versions de développement** (variable de build) et **absente de la version publiée**, pour ne pas ouvrir de contournement.
3. `HANDSHAKE_ACK` reçoit un champ **optionnel** `extension_version`, et le SDK expose à la page de test l'état de l'extension : détectée ou non, version, dernier `PONG`, dernier message reçu.
4. L'extension ne sait pas si le SDK est en `mode: 'test'` et se comporte de la même façon.

## 8. Interface

Popup (`03_EXTENSION.md` §12) enrichie : état (aucune session, session active), version, langue courante, interrupteur d'activation hors session, option de débogage, et (développement seulement) option des hôtes de test. Le **badge** de l'extension indique visiblement l'état actif pendant une session (BF-61, BNF-24). Notifications d'activation et de désactivation hors session (BF-52).

## 9. Écarts à vérifier dans le code existant (à fournir avant de coder)

1. L'endpoint `GET /public/registered-hosts/` existe-t-il dans le backend, avec le champ `Project.site_url` ? Le compte rendu de l'agent ne mentionne que les routes machine.
2. `NAVIGATION_EXT` envoie-t-il l'adresse complète ?
3. Le manifeste contient-il `system.display` ?
4. Quelle période réelle d'alarme est utilisée, et quel délai le SDK applique-t-il avant `extension_heartbeat_lost` ?
5. Les codes `EventType` de tous les signaux d'extension existent-ils dans le SDK **et** le backend ?
6. Le SDK ignore-t-il proprement un message de type inconnu (`LOG`) ?
7. Tableau de correspondance des noms descriptifs de `02b` et `02c` avec les codes réels.

## 10. Critères d'acceptation

1. Sur un hôte non autorisé, rien n'est exécuté au-delà de `hostGate` ; aucun message n'est envoyé à la page.
2. Les événements de l'extension portent des codes `EventType` valides, acceptés par le backend, sans `label` ni `description` de l'extension.
3. `NAVIGATION_EXT` ne contient que le domaine (si la décision §3.3 est confirmée).
4. L'interface, les notifications et les logs de l'extension suivent la langue du `HANDSHAKE` (fr et en testés).
5. Les logs de l'extension apparaissent dans la page de test avec le module `extension`.
6. Avec l'option de débogage, `localhost` est autorisé en développement ; la version publiée ne contient pas cette option.
7. La perte de l'extension est détectée dans le délai prévu avec la période d'alarme **réelle** de la version publiée.
8. Aucun appel réseau de l'extension en dehors de la récupération de la liste blanche.

## 11. Tests à ajouter à `04_TESTS.md` §4

| Test | Résultat attendu |
|---|---|
| Liste blanche vide ou périmée | Comportement du §5 de `03_EXTENSION.md` conservé (inactif si aucun cache) |
| Hôte de test activé en développement | `localhost` autorisé ; version publiée refuse |
| `HANDSHAKE` avec `language: 'en'` | Popup, badge et logs en anglais |
| Message `LOG` de l'extension | Relayé par `on('log')` du SDK, module `extension` |
| `NAVIGATION_EXT` | Domaine seulement dans le payload |
| Message falsifié (origine ou source incorrectes) | Ignoré et journalisé |

## 12. Points à confirmer

1. Passer de l'adresse complète au domaine pour `NAVIGATION_EXT` (recommandé).
2. Faire reposer la détection de perte d'extension sur `PING` / `PONG` plutôt que sur l'alarme (§5).
3. Ajout des détecteurs de machine virtuelle et de périphériques virtuels (§4.3).
4. Nonce de session et numéro de séquence sur les messages du pont : amélioration facultative pour réduire la falsification par un script de la page, à traiter plus tard.
