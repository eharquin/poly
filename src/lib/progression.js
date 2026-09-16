// Progression du tempo, transposée de la double progression de sport-tool :
// là-bas on monte la charge quand toutes les séries sont au haut de la
// fourchette ; ici on monte le tempo quand le passage sort proprement
// plusieurs fois d'affilée. Le scalaire qui mappe sur l'automatisme
// recherché, c'est le BPM auquel le passage reste propre.

import { getBlockConfig, isTempoBlock } from '../config/program.js'
import { sortedSessions } from './ops.js'

// Passages propres d'affilée nécessaires pour monter, et pas d'incrément.
export const CLEAN_PASSES_REQUIRED = 3
export const TEMPO_STEP_BPM = 4

/** Historique chronologique d'un exercice : une entrée par séance où il a été fait. */
export function getBlockEntries(sessions, exerciseId) {
  const out = []
  for (const session of sortedSessions(sessions)) {
    for (const block of session.blocks ?? []) {
      if (block.exerciseId === exerciseId) {
        out.push({ date: session.date, sessionId: session.id, ...block })
      }
    }
  }
  return out
}

const lastEntry = (sessions, exerciseId) => getBlockEntries(sessions, exerciseId).at(-1) ?? null

/**
 * Dernier tempo enregistré pour cet exercice, ou son tempo de départ si
 * aucun historique. `null` pour un bloc continu (pas de mécanique de tempo).
 */
export function getCurrentTempo(sessions, exerciseId) {
  const config = getBlockConfig(exerciseId)
  if (!isTempoBlock(config)) return null
  return lastEntry(sessions, exerciseId)?.tempoBpm ?? config.startTempoBpm
}

/**
 * Tempo à viser à la prochaine séance : le tempo courant, +TEMPO_STEP_BPM si
 * la dernière séance a produit CLEAN_PASSES_REQUIRED passages propres
 * d'affilée. Plafonné au capBpm du bloc. Un passage non propre ne fait pas
 * redescendre le tempo — il remet seulement le compteur à zéro, ce que
 * l'utilisateur enregistre en loguant moins de passages propres.
 */
export function getNextTarget(sessions, exerciseId) {
  const config = getBlockConfig(exerciseId)
  if (!isTempoBlock(config)) return null
  const last = lastEntry(sessions, exerciseId)
  if (!last) return config.startTempoBpm
  const earned = (last.cleanPasses ?? 0) >= CLEAN_PASSES_REQUIRED
  const next = earned ? last.tempoBpm + TEMPO_STEP_BPM : last.tempoBpm
  return Math.min(next, config.capBpm)
}

/**
 * Bloc considéré comme acquis : le cap atteint ET tenu proprement.
 * C'est le signal que lit lib/tiers.js pour débloquer le palier suivant.
 */
export function isAtCap(sessions, exerciseId) {
  const config = getBlockConfig(exerciseId)
  if (!isTempoBlock(config)) return false
  const last = lastEntry(sessions, exerciseId)
  if (!last) return false
  return last.tempoBpm >= config.capBpm && (last.cleanPasses ?? 0) >= CLEAN_PASSES_REQUIRED
}

/** Série pour la courbe de tempo : [{ date, tempoBpm, cleanPasses }]. */
export function getTempoHistory(sessions, exerciseId) {
  return getBlockEntries(sessions, exerciseId)
    .filter((e) => typeof e.tempoBpm === 'number')
    .map(({ date, tempoBpm, cleanPasses }) => ({ date, tempoBpm, cleanPasses: cleanPasses ?? 0 }))
}

/** Tous les exercices à tempo déjà travaillés au moins une fois. */
export function practisedExerciseIds(sessions) {
  const ids = new Set()
  for (const session of sessions) {
    for (const block of session.blocks ?? []) {
      if (typeof block.tempoBpm === 'number') ids.add(block.exerciseId)
    }
  }
  return [...ids]
}

/* ------------------------------------------------------------------ */
/* Stagnation                                                          */
/* ------------------------------------------------------------------ */

// Nombre de séances au même tempo à partir duquel on considère qu'un bloc
// bloque et qu'il faut changer d'approche plutôt que réessayer à l'identique.
export const STAGNATION_SESSIONS = 3

/**
 * Technique de déblocage proposée quand un bloc stagne. Indication d'usage,
 * pas une donnée du schéma. Formulée comme une piste à essayer : le
 * raisonnement (alterner contrôle moteur lent guidé par rétroaction et salve
 * balistique courte) est plausible, ce n'est pas un résultat à présenter
 * comme démontré.
 */
export const STAGNATION_HINT =
  'Piste de déblocage : isole 4-6 notes du passage, joue-les très lentement pour vérifier la propreté, ' +
  'puis tente une salve courte à vitesse maximale sur ces seules notes avant de revenir au tempo cible du bloc entier.'

/**
 * Bloc coincé : les dernières séances se suivent au même tempo sans que le
 * cap soit atteint. Renvoie le nombre de séances consécutives à ce tempo.
 */
export function getStagnation(sessions, exerciseId) {
  const config = getBlockConfig(exerciseId)
  if (!isTempoBlock(config)) return { stagnating: false, count: 0, tempoBpm: null }

  const entries = getBlockEntries(sessions, exerciseId).filter((e) => typeof e.tempoBpm === 'number')
  const last = entries.at(-1)
  if (!last || last.tempoBpm >= config.capBpm) return { stagnating: false, count: 0, tempoBpm: null }

  let count = 0
  for (let i = entries.length - 1; i >= 0 && entries[i].tempoBpm === last.tempoBpm; i--) count++
  return { stagnating: count >= STAGNATION_SESSIONS, count, tempoBpm: last.tempoBpm }
}
