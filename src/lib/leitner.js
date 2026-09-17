// Système de Leitner à 5 boîtes sur les cartes d'un exercice. L'état
// d'apprentissage vit dans data.json, dans la section de l'exercice :
//   { box, attempts, successes, avgTimeMs, lastSeen }
// Une carte absente est neuve : boîte 1, aucune stat.
//
// Paliers : chaque carte porte un `tier` (1 par défaut). Les cartes neuves
// d'un palier ne sont introduites que lorsque le palier précédent est acquis
// pour moitié (boîte ≥ 2, donc juste du premier coup au moins une fois).
// Une carte déjà vue reste tirée normalement, quel que soit son palier.

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

// Part d'un palier en boîte ≥ 2 à partir de laquelle le suivant s'ouvre.
export const TIER_UNLOCK_SHARE = 0.5

export const tierOf = (card) => card.tier ?? 1

/**
 * État des paliers : [{ tier, total, seen, acquired, unlocked }], triés.
 * Le palier 1 est toujours ouvert ; le suivant s'ouvre quand la moitié du
 * précédent est acquise.
 */
export function tierProgress(cards, stats) {
  const byTier = new Map()
  for (const c of cards) {
    const t = tierOf(c)
    const entry = byTier.get(t) ?? { tier: t, total: 0, seen: 0, acquired: 0, unlocked: false }
    const s = statOf(stats, c.id)
    entry.total++
    if (s.lastSeen) entry.seen++
    if (s.box >= 2) entry.acquired++
    byTier.set(t, entry)
  }
  const tiers = [...byTier.values()].sort((a, b) => a.tier - b.tier)
  tiers.forEach((t, i) => {
    t.unlocked = i === 0 || tiers[i - 1].acquired / tiers[i - 1].total >= TIER_UNLOCK_SHARE
  })
  return tiers
}

/** Cartes qu'on peut tirer : déjà vues, ou d'un palier ouvert. */
export function availableCards(cards, stats) {
  const unlocked = new Set(tierProgress(cards, stats).filter((t) => t.unlocked).map((t) => t.tier))
  return cards.filter((c) => statOf(stats, c.id).lastSeen || unlocked.has(tierOf(c)))
}

export function dueChords(chords, stats, now = Date.now()) {
  return availableCards(chords, stats).filter((c) => isDue(statOf(stats, c.id), now))
}

/**
 * Tirage pondéré (poids 1/boîte) parmi les cartes dues ; si aucune n'est due,
 * parmi toutes les cartes disponibles (vues, ou d'un palier ouvert).
 * `exclude` évite de remontrer la carte qui vient de passer quand il en reste
 * d'autres. `rng` est injectable pour les tests.
 */
export function pickChord(chords, stats, { now = Date.now(), exclude = null, rng = Math.random } = {}) {
  if (!chords.length) return null
  let pool = dueChords(chords, stats, now)
  if (!pool.length) pool = availableCards(chords, stats)
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

/** Vue d'ensemble pour l'en-tête : répartition par boîte, cartes dues, paliers. */
export function deckSummary(chords, stats, now = Date.now()) {
  const byBox = Array.from({ length: BOXES + 1 }, () => 0)
  let seen = 0
  for (const c of chords) {
    const s = statOf(stats, c.id)
    byBox[s.box]++
    if (s.lastSeen) seen++
  }
  const tiers = tierProgress(chords, stats)
  return { total: chords.length, seen, due: dueChords(chords, stats, now).length, byBox, tiers }
}
