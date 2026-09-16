# Poly — carnet de pratique multi-instruments

PWA mobile-first (Vite + React), sans backend : les séances sont lues et
écrites dans un `data.json` versionné dans un repo GitHub via l'API REST
Contents. Même architecture que `sport-tool`.

**État : Phase 0 + premier drill de la Phase 1.** L'app propose la séance du
jour déjà remplie (quel instrument, quels exercices, à quel tempo), on coche,
et le suivi se fait par **progression de tempo** et **adhérence au
programme** — pas par un score. Un onglet **Exercices** ajoute le premier
drill sans instrument : nommer un accord de guitare à partir de sa grille,
en répétition espacée.

## Mise en route

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
npm run lint
npm test         # logique pure + validation de chaque voicing du pool d'accords
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
`rythme`), `libre` pour tout ce qui n'est pas prescrit (touche secondaire du
soir, habitude voix, composition du dimanche), ou `drill` pour une série
d'exercices sans instrument. Les séances `libre` comptent pour la dernière
pratique et l'historique, **jamais** pour l'adhérence ; les séances `drill`
ne comptent ni pour l'adhérence ni pour la dernière pratique (pas de mains
sur l'instrument), seulement pour l'historique.

Une séance `drill` porte une réponse par bloc :

```json
{ "drillId": "chord_name", "cardId": "E_maj_3", "correct": true, "boxLeitner": 2 }
```

`boxLeitner` est la boîte où était la carte au moment de la réponse — un
instantané pour l'historique. L'état du paquet n'est stocké nulle part : il
se rejoue depuis ces blocs, comme les paliers se déduisent des tempos.

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
  config/chords.js        pool de cartes du drill accords, par paliers ; barrés générés
                          depuis un gabarit + une case
  lib/theory.js           classes de hauteur, formules d'accords, accordage, degré dans
                          une tonalité — et la vérification de chaque voicing
  lib/drills.js           moteur Drill { id, type, prompt(), evaluate() } + registre
  lib/leitner.js          boîtes, échéances, file du jour, dérivés de l'historique
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
- **Stagnation** — quand un bloc reste au même tempo sur 3 séances sans
  atteindre son cap, l'écran du jour le signale et propose une piste de
  déblocage (isoler 4-6 notes, très lentement, puis une salve courte à
  vitesse maximale sur ces seules notes). C'est une indication d'usage, pas
  une donnée du schéma — et une piste plausible, pas un résultat démontré.
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

## Exercices (sans instrument)

**Nommer l'accord** : une grille (SVG, 6 cordes, 5 cases, sillet ou numéro
de case, barrés dessinés) et deux taps pour répondre — la fondamentale parmi
douze (les enharmonies sont une seule pastille, `C#/Db`), puis la qualité
(maj, m, 7, m7, maj7, dim, dim7, m7♭5, sus2, sus4). Ni saisie libre à
parser, ni QCM à reconnaître.

Le retour est là que ça apprend : nom et qualité, notes de l'accord, corde de
la fondamentale (colorée sur la grille), degré dans la tonalité de la semaine
quand l'accord y est diatonique, forme et palier. Une réponse partiellement
juste (bonne fondamentale, mauvaise qualité) est nommée comme telle.

**Répétition espacée** — Leitner à 5 boîtes. Juste → boîte suivante ; faux →
retour en boîte 1. Revue après 1 / 2 / 4 / 8 / 16 jours selon la boîte. La
série du jour = les cartes dues (boîtes faibles d'abord) + jusqu'à 5
nouvelles dans l'ordre des paliers, 30 au plus. Une carte ratée revient en
fin de série sans être comptée deux fois. La série est enregistrée d'un seul
commit à la fin (ou « Terminer maintenant »), et survit à un verrouillage
d'écran via un brouillon local.

**Pool** — 57 cartes en trois paliers : accords ouverts (26), barrés formes
E et A en majeur / mineur / 7 (17), tétrades mobiles, diminués,
demi-diminués et formes hautes (14). Les barrés sont générés depuis un
gabarit et une case : la même forme change de nom avec la case, c'est la
théorie du manche qu'on veut construire. **Chaque voicing est vérifié** :
les cordes jouées doivent sonner exactement les notes de l'accord annoncé
(à une tolérance près, usuelle à la guitare : la quinte peut manquer dans une
tétrade — le C7 ouvert n'a pas de sol).

Le moteur est le `Drill { id, type, prompt(), evaluate() }` prévu depuis le
début : l'écran ne connaît que ce contrat, Leitner ne connaît que
`{ cardId, correct }`. Le drill suivant (piano, intervalles, oreille) s'y
ajoute sans toucher à l'écran ni à l'espacement.

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

- **Phase 1** (entamée) : le sens rappel des cartes accords (nom → position,
  construire la grille), puis les pools piano.
- **Phase 2** : enchaînements de progressions en rythme, mini-jeu
  d'intervalles, voisins fonctionnels / modes à la volée.
- **Phase 3** : miroir perceptif, transposition rapide, rythme découplé.
- Horizon long : basse (transfert depuis la guitare), batterie minimale —
  une entrée dans `INSTRUMENTS` et une section dans `PROGRAM`.

Le moteur visé pour ces phases est un `Drill { id, type, prompt(), evaluate(),
tier }` ; les blocs de la Phase 0, déjà structurés en paliers, servent de
brique commune.
