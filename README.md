# Poly — carnet de pratique multi-instruments

PWA mobile-first (Vite + React), sans backend : les séances sont lues et
écrites dans un `data.json` versionné dans un repo GitHub via l'API REST
Contents. Même architecture que `sport-tool`.

**État : Phase 0.** L'app propose la séance du jour déjà remplie (quel
instrument, quels exercices, à quel tempo), on coche, et le suivi se fait par
**progression de tempo** et **adhérence au programme** — pas par un score.

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
      "sessionType": "technique",
      "key_of_week": "G",
      "blocks": [
        { "exerciseId": "gammes_2oct_ens", "tempoBpm": 96, "cleanPasses": 3 },
        { "exerciseId": "lecture_a_vue", "note": "Bartók, 8 mesures" }
      ],
      "note": "séance globale (facultatif)"
    }
  ]
}
```

Une séance est identifiée par son `id`. Un bloc n'apparaît que s'il a été
fait : `blocks` est donc le relevé de la séance, pas la liste de ce qui était
prévu. Un bloc à tempo porte `tempoBpm` + `cleanPasses` ; un bloc qualitatif
(lecture à vue, morceau, impro) n'a ni l'un ni l'autre.

`sessionType` vaut une clé de `PROGRAM` (`technique`, `repertoire`, `manche`,
`rythme`) ou `libre` pour tout ce qui n'est pas prescrit : touche secondaire
du soir, habitude voix, composition du dimanche. Les séances `libre` comptent
pour la dernière pratique et l'historique, **jamais** pour l'adhérence.

Les clés inconnues du fichier sont préservées à la lecture comme à l'écriture,
et les champs `drillId` / `boxLeitner` prévus pour la Phase 1 se rangeront
dans un bloc sans migration.

Chaque enregistrement produit un commit
`Séance {date} - {instrument} ({sessionType})`.

## Organisation du code

```
src/
  config/instruments.js   instruments et priorités, rotation hebdo (jour -> instrument
                          + type de séance), cercle des quintes, seuils de fraîcheur
  config/program.js       PROGRAM : le contenu des séances (paliers d'exercices à tempo
                          + blocs continus) et ADHERENCE_TARGETS. Le seul fichier qui
                          connaît le nom d'un exercice.
  lib/github.js           Contents API (GET/PUT), retry sur conflit de sha
  lib/storage.js          localStorage : réglages, cache, brouillon, file d'attente
  lib/ops.js              opérations d'écriture sérialisables (rejouées hors-ligne)
  lib/progression.js      tempo courant, tempo cible, bloc au cap
  lib/tiers.js            palier actif d'une catégorie, blocs du jour
  lib/adherence.js        fenêtre glissante 14 j, réalisé vs cible, dernière pratique
  lib/cycle.js            jour -> (instrument, type de séance) ; date -> tonalité
  hooks/useSettings.js    réglages persistés
  hooks/useData.js        sync GitHub + cache + file d'attente hors-ligne
  components/             TodayScreen, SessionForm, ProgressScreen, HistoryScreen,
                          TokenConfig, Nav
```

## Règles de calcul

- **Progression du tempo** — transposition de la double progression de
  `sport-tool` : **3 passages propres d'affilée → +4 BPM** à la séance
  suivante, jusqu'au `capBpm` du bloc. Un passage raté ne fait pas redescendre
  le tempo, il remet seulement le compteur à zéro.
- **Paliers** — un palier est acquis quand *tous* ses blocs à tempo ont
  atteint leur cap et l'ont tenu (≥ 3 passages propres). Le palier suivant
  devient alors actif et ses blocs remplacent les précédents sur l'écran du
  jour. Les blocs `continuous` s'affichent quel que soit le palier : ils ne
  bloquent ni ne débloquent rien.
- **Adhérence** — nombre de séances par catégorie sur **14 jours glissants**,
  dimanches exclus, comparé à une fourchette `{min, max}` :
  `ok` dans la fourchette · `warn` sous `min` · `low` sous `min/2` ·
  `high` au-dessus de `max` (informatif). Diagnostic, pas un score.
- **Rotation** — le principal alterne piano/guitare un jour sur deux, le
  secondaire est une touche courte sur l'autre instrument (consolidation
  motrice chaque nuit) ; dimanche libre pour la composition. La voix est une
  habitude quotidienne indépendante. Tout est **suggéré, jamais imposé**.
- **Tonalité** — une entrée du cercle des quintes toutes les 2 semaines à
  partir de la date de départ configurée ; elle est figée dans la séance
  (`key_of_week`) au moment de l'enregistrement.

## Pourquoi pas d'XP, de niveau ni de streak

Une métrique qui a besoin d'un plafond anti-triche dès sa conception ne mesure
généralement pas la bonne chose : compter les minutes assis à l'instrument
mesure la présence, pas la compétence. Le tempo par exercice mesure
directement l'automatisme recherché. Et un streak transforme une semaine ratée
en dette qui ne se rembourse jamais ; la fenêtre glissante de 14 jours donne
le même signal utile — « est-ce que je néglige quelque chose ? » — sans jamais
accumuler de dette. Le dimanche est exclu du calcul : l'objectif final est de
composer, ce qui demande du temps non prescrit.

## Graphiques

Une courbe de tempo par exercice, en SVG inline (pas de librairie) : une seule
série par graphique, donc pas de légende — le titre nomme l'exercice et seule
la dernière valeur est étiquetée. Le filet horizontal marque le cap du bloc.
La couleur de donnée (`--data`) est un pas validé pour fond sombre (bande de
luminosité, chroma, séparation CVD, contraste ≥ 3:1 sur la surface des
cartes) ; les couleurs de statut de l'adhérence sont réservées et toujours
accompagnées d'une icône et d'un mot, jamais la couleur seule. Le détail
chiffré de chaque séance reste lisible dans l'Historique.

## Hors-ligne

- Service worker (`vite-plugin-pwa`, `autoUpdate`) : le shell est pré-caché,
  **l'API GitHub n'est jamais mise en cache**.
- Une séance enregistrée sans réseau est appliquée localement et empilée dans
  `poly.pending` (localStorage), puis rejouée au retour de la connexion
  (événement `online`, bouton de synchro, ou prochaine sauvegarde). Une erreur
  d'authentification ou de droits n'est **pas** mise en file : elle s'affiche
  immédiatement.
- Le brouillon de la séance en cours survit à un verrouillage d'écran.
- L'export/import JSON de l'écran Historique sert de filet de secours local.

## Faire évoluer le programme

`config/program.js` est fait pour être corrigé au fil de la pratique : ajouter
un exercice, changer un `capBpm`, réordonner un palier ne demande aucun
changement ailleurs. Un exercice retiré du programme reste lisible dans
l'historique (son `exerciseId` s'affiche tel quel).

## Suite (non implémenté)

- **Phase 1** : cartes accords Leitner (nom → position), champs `drillId` et
  `boxLeitner` déjà réservés dans le schéma de bloc.
- **Phase 2** : enchaînements de progressions en rythme, mini-jeu
  d'intervalles, voisins fonctionnels / modes à la volée.
- **Phase 3** : miroir perceptif, transposition rapide, rythme découplé.
- Horizon long : basse (transfert depuis la guitare), batterie minimale —
  une entrée dans `INSTRUMENTS` et une section dans `PROGRAM`.

Le moteur visé pour ces phases est un `Drill { id, type, prompt(), evaluate(),
tier }` ; les blocs de la Phase 0, déjà structurés en paliers, servent de
brique commune.
