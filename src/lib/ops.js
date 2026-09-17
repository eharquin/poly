// Opérations d'écriture sérialisables (pour la file d'attente hors-ligne).
// Chaque op est un objet JSON ; `applyOp` la rejoue sur une copie des données.
// Un futur exercice ajoute son op ici et sa section dans data.json.

import { applyAnswers } from './leitner.js'

/**
 * Enregistre les réponses d'une partie dans `chordStats` :
 * [{ chordId, attempts, timeMs, at }]. `at` est fixé à la réponse, pas au
 * commit, pour qu'une op rejouée hors-ligne garde sa date.
 */
export function recordChordAnswers(answers) {
  return { type: 'recordChordAnswers', answers }
}

export function applyOp(data, op) {
  switch (op.type) {
    case 'recordChordAnswers':
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
