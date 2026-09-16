// Tout ce qui est propre au plan d'entraînement vit ici : instruments suivis,
// rotation hebdomadaire, séquenceur de tonalités. Ajouter un instrument plus
// tard (basse, batterie…) = une ligne dans INSTRUMENTS, aucun changement de
// schéma de données.

export const INSTRUMENTS = [
  { id: 'piano', label: 'Piano', priority: 'haute' },
  { id: 'guitare', label: 'Guitare', priority: 'haute' },
  { id: 'voix', label: 'Voix', priority: 'entretien' },
]

// Rotation hebdo — le "principal" (bloc complet, théorie appliquée incluse)
// alterne piano/guitare un jour sur deux (jamais deux fois de suite, pour
// l'interférence contextuelle) ; le "secondaire" est une touche courte
// (5-10 min) sur l'AUTRE instrument, pour que les deux bénéficient d'une
// consolidation motrice pendant le sommeil chaque nuit plutôt qu'une nuit
// sur deux. Affiché en suggestion sur TodayScreen, jamais imposé.
export const WEEKLY_ROTATION = {
  mon: { main: 'piano', secondary: 'guitare' },
  tue: { main: 'guitare', secondary: 'piano' },
  wed: { main: 'piano', secondary: 'guitare' },
  thu: { main: 'guitare', secondary: 'piano' },
  fri: { main: 'piano', secondary: 'guitare' },
  sat: { main: 'guitare', secondary: 'piano' },
  sun: { main: 'libre', secondary: null }, // composition
}

// Voix : habitude quotidienne indépendante, détachée de la rotation
// principale/secondaire ci-dessus (quelques minutes de justesse sans
// repère, avant/après la session ou hors salle).
export const DAILY_VOICE_HABIT = true

// Séquenceur cercle des quintes — une tonalité toutes les 2 semaines,
// à partir d'une date de départ définie dans les réglages.
export const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']

/* ------------------------------------------------------------------ */
/* Dérivés & réglages d'affichage                                      */
/* ------------------------------------------------------------------ */

// Nombre de semaines passées sur une même tonalité avant de passer à la suivante.
export const KEY_CYCLE_WEEKS = 2

// Index = Date#getDay() (0 = dimanche), pour indexer WEEKLY_ROTATION.
export const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

// Jour sans instrument imposé (dimanche) : composition.
export const FREE_DAY = { id: 'libre', label: 'Libre', hint: 'Composition — applique ce qui a été travaillé dans la semaine.' }

// Suggestions de durée affichées sur TodayScreen (jamais imposées).
export const MAIN_HINT = 'bloc complet, théorie appliquée incluse'
export const SECONDARY_HINT = '5-10 min sur l\'autre instrument, avant de dormir'
export const VOICE_HABIT_HINT = 'quelques minutes de justesse sans repère (hors session)'

// Durées proposées en chips dans le formulaire de log.
export const DURATION_CHIPS = [10, 20, 30, 45, 60]

// Plafond d'XP : au-delà, une séance plus longue sur le MÊME instrument le
// même jour ne rapporte plus rien. Anti-bourrage — une journée de 3 h sur un
// seul instrument ne doit pas battre une semaine alternée piano/guitare, sur
// laquelle repose toute l'interférence contextuelle du plan.
export const XP_CAP_MINUTES = 45

// Seuils de fraîcheur (en jours depuis la dernière pratique) par priorité,
// pour le code couleur "dernière pratique".
export const FRESHNESS = {
  haute: { ok: 2, warn: 4 },
  entretien: { ok: 3, warn: 7 },
}

export const INSTRUMENT_IDS = INSTRUMENTS.map((i) => i.id)

export function getInstrument(id) {
  return INSTRUMENTS.find((i) => i.id === id) ?? null
}

/** Libellé affichable, y compris pour un instrument retiré de la config. */
export function instrumentLabel(id) {
  if (id === FREE_DAY.id) return FREE_DAY.label
  return getInstrument(id)?.label ?? id
}

export function freshnessFor(id) {
  return FRESHNESS[getInstrument(id)?.priority] ?? FRESHNESS.entretien
}
