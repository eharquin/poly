# Poly — carnet de pratique multi-instruments

PWA mobile-first (Vite + React), sans backend : les séances sont lues et
écrites dans un `data.json` versionné dans un repo GitHub via l'API REST
Contents. Même architecture que `sport-tool`.

**État : Phase 0** — log de séances, suggestion de rotation, XP / streak,
historique. Les moteurs d'exercices (drills, Leitner, mini-jeux) arrivent aux
phases suivantes et se brancheront sur le même schéma de données.

## Mise en route

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run lint
```

### Repo de données

1. Créer un repo **privé** (par ex. `poly-data`) contenant un `data.json`
   à la racine — le contenu de `data.example.json` suffit. Le fichier est
   aussi créé automatiquement au premier enregistrement s'il n'existe pas.
2. Générer un **fine-grained PAT** limité à ce seul repo, permission
   `Contents: Read and write`, avec une date d'expiration.
3. Dans l'app, onglet **Réglages** : owner, repo, branche, chemin du fichier,
   token, date d'expiration du token (alerte 7 jours avant), et la date de
   départ du cycle de tonalités. Bouton **Tester la connexion** pour vérifier
   que le token donne bien l'écriture.

Le token ne quitte jamais le `localStorage` du téléphone ; il n'est envoyé
qu'à `api.github.com`.

### Déploiement

`.github/workflows/deploy.yml` publie `dist/` sur GitHub Pages à chaque push
sur `main`. `base: './'` rend le build indépendant du nom du repo.

## Modèle de données

`data.json` :

```json
{
  "sessions": [
    {
      "id": "1234-abcde",
      "date": "2026-09-15",
      "instrument": "piano",
      "minutes": 25,
      "note": "gammes Sol majeur + cadence ii-V-I",
      "key_of_week": "G"
    }
  ]
}
```

Une séance est identifiée par son `id` : plusieurs séances du même instrument
le même jour sont possibles. Les clés inconnues du fichier (sections ajoutées
par une phase ultérieure) sont préservées à la lecture comme à l'écriture, et
les champs `drillId`, `tempsMs`, `tempo`, `boxLeitner` prévus pour la Phase 1+
se rangeront dans l'objet séance sans migration.

Chaque enregistrement produit un commit `Séance {date} - {instrument}`.

## Organisation du code

```
src/
  config/instruments.js   instruments + priorités, rotation hebdo, cercle des quintes,
                          plafond XP, seuils de fraîcheur — tout le paramétrage du plan
  lib/github.js           Contents API (GET/PUT), retry sur conflit de sha
  lib/storage.js          localStorage : réglages, cache, brouillon, file d'attente
  lib/ops.js              opérations d'écriture sérialisables (rejouées hors-ligne)
  lib/stats.js            XP (plafonné), niveau, streak, minutes/semaine, fraîcheur
  lib/cycle.js            jour → rotation ; date → tonalité en cours (fonctions pures)
  hooks/useSettings.js    réglages persistés
  hooks/useData.js        sync GitHub + cache + file d'attente hors-ligne
  components/             TodayScreen, SessionForm, ProgressScreen, HistoryScreen,
                          TokenConfig, Nav
```

## Règles de calcul

- **XP** : 1 XP par minute, **plafonné à 45 min par instrument et par jour**.
  Au-delà, les minutes supplémentaires sur le même instrument ce jour-là ne
  rapportent plus rien — sans ce plafond, 3 h sur un seul instrument
  battraient une semaine alternée piano/guitare, ce qui irait contre
  l'interférence contextuelle sur laquelle repose le plan.
- **Niveau** : palier *n* → *n+1* à 100 × *n* XP (0 / 100 / 300 / 600…).
- **Streak** : jours consécutifs avec au moins une séance. Le jour courant
  encore vide ne casse pas la série — on a jusqu'à minuit.
- **Rotation** : le principal alterne piano/guitare un jour sur deux, le
  secondaire est une touche courte sur l'autre instrument (consolidation
  motrice chaque nuit) ; dimanche libre pour la composition. La voix est une
  habitude quotidienne indépendante. Tout cela est **suggéré, jamais imposé** :
  le formulaire accepte n'importe quel instrument.
- **Tonalité** : une entrée du cercle des quintes toutes les 2 semaines à
  partir de la date de départ configurée ; elle est figée dans la séance
  (`key_of_week`) au moment du log.

## Hors-ligne

- Service worker (`vite-plugin-pwa`, `autoUpdate`) : le shell est pré-caché,
  **l'API GitHub n'est jamais mise en cache**.
- Une séance loguée sans réseau est appliquée localement et empilée dans
  `poly.pending` (localStorage), puis rejouée au retour de la connexion
  (événement `online`, bouton de synchro de la barre du haut, ou prochaine
  sauvegarde). Une erreur d'authentification ou de droits n'est **pas** mise
  en file : elle s'affiche immédiatement.
- L'export/import JSON de l'écran Historique sert de filet de secours local ;
  la source de vérité reste `data.json` sur GitHub.

## Suite (non implémenté)

- **Phase 1** : pools d'exercices par instrument, cartes accords Leitner.
- **Phase 2** : progressions en rythme, mini-jeu d'intervalles, modes.
- **Phase 3** : miroir perceptif, transposition rapide, rythme découplé.
- Horizon long : basse (transfert depuis la guitare), batterie minimale —
  une ligne à ajouter dans `INSTRUMENTS`, sans changement de schéma.

Le moteur visé pour ces phases est un `Drill { id, type, prompt(), evaluate(),
tier }` ; les champs de séance correspondants sont déjà réservés.
