// Opérations d'écriture sérialisables (pour la file d'attente hors-ligne).
// Chaque op est un objet JSON ; `applyOp` la rejoue sur une copie des données.
// Un futur exercice ajoute sa section ici et l'utilise via `recordAnswers`.

import { applyAnswers } from './leitner.js'

// Sections de data.json portant l'état Leitner d'un exercice, garanties
// présentes à la lecture (voir github.js).
export const STAT_SECTIONS = ['chordStats', 'pianoChordStats', 'guitarBuildStats', 'pianoBuildStats', 'fretboardNoteStats', 'fretboardFindStats', 'guitarRoleStats', 'pianoRoleStats', 'scaleStats', 'modeParentStats', 'modeNameStats', 'degreeToChordStats', 'degreeToSeventhStats', 'chordToDegreeStats']

/**
 * Enregistre les réponses d'une partie dans la section d'un exercice :
 * [{ chordId, attempts, timeMs, at }]. `chordId` est l'id de la carte (le nom
 * date du premier exercice). `at` est fixé à la réponse, pas au commit, pour
 * qu'une op rejouée hors-ligne garde sa date.
 */
export function recordAnswers(section, answers) {
  if (!STAT_SECTIONS.includes(section)) throw new Error(`section inconnue : ${section}`)
  return { type: 'recordAnswers', section, answers }
}

export function applyOp(data, op) {
  switch (op.type) {
    case 'recordAnswers':
      data[op.section] = applyAnswers(data[op.section], op.answers)
      return data
    case 'recordChordAnswers': // ancienne forme, encore possible dans une file hors-ligne
      data.chordStats = applyAnswers(data.chordStats, op.answers)
      return data
    default:
      return data
  }
}

/** Rejoue une liste d'ops sur des données (clone). */
export function applyOps(data, ops) {
  return ops.reduce((d, item) => applyOp(d, item.op), structuredClone(data))
}

/** Erreur réseau (hors-ligne, DNS…) par opposition à une erreur renvoyée par GitHub. */
export function isNetworkError(e) {
  return e instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false)
}
