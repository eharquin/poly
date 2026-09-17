// Intervalles ascendants : nombre (compté en lettres, les deux notes
// comprises) et qualité (fixée par les demi-tons). Deux banques sur les mêmes
// cartes : nommer l'intervalle entre deux notes, ou trouver la note à un
// intervalle donné d'une autre. La graphie compte : une sixte majeure
// au-dessus de E est C#, pas Db (qui serait une septième diminuée).

import { LETTERS, rootPitchClass, spellOnLetter } from '../../lib/chordName.js'

export const NUMBERS = [
  { n: 2, short: '2de', label: 'seconde' },
  { n: 3, short: '3ce', label: 'tierce' },
  { n: 4, short: '4te', label: 'quarte' },
  { n: 5, short: '5te', label: 'quinte' },
  { n: 6, short: '6te', label: 'sixte' },
  { n: 7, short: '7e', label: 'septième' },
  { n: 8, short: '8ve', label: 'octave' },
]
export const QUALITIES = [
  { id: 'dim', label: 'diminuée' },
  { id: 'min', label: 'mineure' },
  { id: 'maj', label: 'majeure' },
  { id: 'perf', label: 'juste' },
  { id: 'aug', label: 'augmentée' },
]

// Demi-tons de la référence : juste (4, 5, 8) ou majeure (2, 3, 6, 7).
const REFERENCE = { 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11, 8: 12 }
const PERFECT = new Set([4, 5, 8])

/** Demi-tons d'un intervalle, ou null si la qualité ne s'applique pas (3ce juste, 5te majeure…). */
export function semitonesOf(n, quality) {
  const ref = REFERENCE[n]
  if (PERFECT.has(n)) return { perf: ref, aug: ref + 1, dim: ref - 1 }[quality] ?? null
  return { maj: ref, min: ref - 1, aug: ref + 1, dim: ref - 2 }[quality] ?? null
}

/** Qualité d'un intervalle de n lettres et s demi-tons, ou null. */
export function qualityOf(n, s) {
  return QUALITIES.map((q) => q.id).find((q) => semitonesOf(n, q) === s) ?? null
}

const numberLabel = (n) => NUMBERS.find((x) => x.n === n).label
const qualityLabel = (q) => QUALITIES.find((x) => x.id === q).label
export const intervalLabel = (n, q) => `${numberLabel(n)} ${qualityLabel(q)}`
export const noteName = (note) => `${note.root}${note.acc}`

/** La note à un intervalle ascendant (n, quality) au-dessus de `from`, ou null si sa graphie déborde. */
export function noteAbove(from, n, quality) {
  const s = semitonesOf(n, quality)
  if (s === null) return null
  const letter = LETTERS[(LETTERS.indexOf(from.root) + n - 1) % 7]
  const note = spellOnLetter(letter, (rootPitchClass(from.root, from.acc) + s) % 12)
  return note && note.acc.length <= 1 ? note : null
}

/** Renversement : nombre complémentaire à 9, qualité miroir. */
export function inversion(n, quality) {
  const mirror = { maj: 'min', min: 'maj', aug: 'dim', dim: 'aug', perf: 'perf' }
  return n === 8 ? null : { n: 9 - n, quality: mirror[quality] }
}

// Paliers : notes naturelles et briques des triades ; toutes les notes et
// les intervalles simples ; le triton et les graphies rares ; les
// augmentés / diminués enharmoniques (à nommer seulement).
const FROM_NOTES = [
  ...['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((r) => [{ root: r, acc: '' }, 1]),
  ...[['C', '#'], ['E', 'b'], ['F', '#'], ['A', 'b'], ['B', 'b']].map(([r, a]) => [{ root: r, acc: a }, 2]),
  ...[['D', 'b'], ['G', 'b'], ['A', '#']].map(([r, a]) => [{ root: r, acc: a }, 3]),
]
const INTERVALS = [
  ...[[3, 'min'], [3, 'maj'], [5, 'perf'], [8, 'perf']].map(([n, q]) => [n, q, 1]),
  ...[[2, 'min'], [2, 'maj'], [4, 'perf'], [6, 'min'], [6, 'maj'], [7, 'min'], [7, 'maj']].map(([n, q]) => [n, q, 2]),
  ...[[4, 'aug'], [5, 'dim']].map(([n, q]) => [n, q, 3]),
  ...[[2, 'aug'], [6, 'aug'], [3, 'dim'], [7, 'dim']].map(([n, q]) => [n, q, 4]),
]

const ALL = FROM_NOTES.flatMap(([from, noteTier]) =>
  INTERVALS.flatMap(([n, quality, intervalTier]) => {
    const to = noteAbove(from, n, quality)
    if (!to) return []
    return [{
      id: `${noteName(from)}:${n}${quality}`,
      from,
      fromName: noteName(from),
      to,
      toName: noteName(to),
      number: n,
      quality,
      semitones: semitonesOf(n, quality),
      label: intervalLabel(n, quality),
      tier: Math.max(noteTier, intervalTier),
    }]
  }),
)

/** « De C à A : quel intervalle ? » — tout, y compris les enharmoniques du palier 4. */
export const INTERVAL_NAME_CARDS = ALL
/** « Une sixte majeure au-dessus de E ? » — sans les augmentés / diminués rares. */
export const INTERVAL_NOTE_CARDS = ALL.filter((c) => c.tier < 4)
