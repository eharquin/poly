// Système de Leitner à 5 boîtes sur les accords. L'état d'apprentissage
// vit dans data.json sous `chordStats[id]` :
//   { box, attempts, successes, avgTimeMs, lastSeen }
// Un accord absent est neuf : boîte 1, aucune stat.

export const BOXES = 5

// Intervalle minimum (jours) avant réapparition, par boîte. Boîte 1 : à
// chaque session.
export const BOX_INTERVALS_DAYS = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 15 }

const DAY_MS = 24 * 60 * 60 * 1000

// Poids de la moyenne glissante du temps de réponse : la dernière mesure
// compte pour 30 %, l'historique pour 70 %.
const AVG_ALPHA = 0.3

export function emptyStat() {
  return { box: 1, attempts: 0, successes: 0, avgTimeMs: null, lastSeen: null }
}

export function statOf(stats, chordId) {
  return stats?.[chordId] ?? emptyStat()
}

/** Dû si jamais vu, ou si lastSeen + intervalle(box) <= now. */
export function isDue(stat, now = Date.now()) {
  if (!stat?.lastSeen) return true
  const interval = BOX_INTERVALS_DAYS[stat.box] ?? 0
  return Date.parse(stat.lastSeen) + interval * DAY_MS <= now
}

export function dueChords(chords, stats, now = Date.now()) {
  return chords.filter((c) => isDue(statOf(stats, c.id), now))
}

/**
 * Tirage pondéré (poids 1/boîte) parmi les accords dus ; si aucun n'est dû,
 * dans toute la banque. `exclude` évite de remontrer l'accord qui vient de
 * passer quand il en reste d'autres. `rng` est injectable pour les tests.
 */
export function pickChord(chords, stats, { now = Date.now(), exclude = null, rng = Math.random } = {}) {
  if (!chords.length) return null
  let pool = dueChords(chords, stats, now)
  if (!pool.length) pool = chords
  if (exclude && pool.length > 1) pool = pool.filter((c) => c.id !== exclude)
  const weights = pool.map((c) => 1 / statOf(stats, c.id).box)
  const total = weights.reduce((a, b) => a + b, 0)
  let r = rng() * total
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i]
    if (r < 0) return pool[i]
  }
  return pool[pool.length - 1]
}

/**
 * Nouvel état après une question résolue. `attempts` = nombre de clics sur
 * Valider avant la bonne réponse, `timeMs` = chrono jusqu'à celle-ci.
 * Du premier coup → boîte suivante (plafonnée) ; sinon → boîte 1.
 */
export function applyAnswer(stat, { attempts, timeMs, at }) {
  const prev = stat ?? emptyStat()
  const firstTry = attempts === 1
  return {
    box: firstTry ? Math.min(prev.box + 1, BOXES) : 1,
    attempts: prev.attempts + attempts,
    successes: prev.successes + 1,
    avgTimeMs: prev.avgTimeMs == null ? Math.round(timeMs) : Math.round(prev.avgTimeMs * (1 - AVG_ALPHA) + timeMs * AVG_ALPHA),
    lastSeen: at,
  }
}

/** Applique une liste de réponses [{ chordId, attempts, timeMs, at }] à une copie des stats. */
export function applyAnswers(stats, answers) {
  const next = { ...(stats ?? {}) }
  for (const a of answers) next[a.chordId] = applyAnswer(next[a.chordId], a)
  return next
}

/** Vue d'ensemble pour l'en-tête : répartition par boîte, accords dus. */
export function deckSummary(chords, stats, now = Date.now()) {
  const byBox = Array.from({ length: BOXES + 1 }, () => 0)
  let seen = 0
  let due = 0
  for (const c of chords) {
    const s = statOf(stats, c.id)
    byBox[s.box]++
    if (s.lastSeen) seen++
    if (isDue(s, now)) due++
  }
  return { total: chords.length, seen, due, byBox }
}
