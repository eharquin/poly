// Tonalités et armures : les 15 tonalités majeures (0 à 7 dièses, 0 à 7
// bémols) et leurs relatives mineures. Trois banques : armure → tonalité,
// tonalité → armure, relatif.

import { keyAccidentals, majorScaleChords } from './degrees.js'
import { scaleNotes } from './scales.js'

// Cercle des quintes : dièses puis bémols.
const MAJOR_TONICS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'], ['G', 'b'], ['C', 'b'],
]

const tier = (n) => (n <= 2 ? 1 : n <= 5 ? 2 : 3)

// Ordre d'apparition à l'armure : les dièses par quintes, les bémols par quartes.
const SHARPS = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#']
const FLATS = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb']

/** « 4 bémols », « 1 dièse », « aucune altération ». */
export function signatureLabel(count, kind) {
  if (!count) return 'aucune altération'
  return `${count} ${kind === '#' ? 'dièse' : 'bémol'}${count > 1 ? 's' : ''}`
}

/** Les 15 tonalités : { major, minor, count, kind, accidentals, tier }. */
export const KEYS = MAJOR_TONICS.map(([root, acc]) => {
  const scale = majorScaleChords(root, acc)
  const count = keyAccidentals(root, acc)
  const kind = count === 0 ? '' : scale.some((c) => c.acc === 'b') ? 'b' : '#'
  const rel = scaleNotes(root, acc, 'maj')[5] // VIe degré = relative mineure
  return {
    majorRoot: root,
    majorAcc: acc,
    major: `${root}${acc}`,
    minorRoot: rel.root,
    minorAcc: rel.acc,
    minor: `${rel.root}${rel.acc}`,
    count,
    kind,
    accidentals: (kind === 'b' ? FLATS : SHARPS).slice(0, count),
    signature: signatureLabel(count, kind),
    tier: tier(count),
  }
})

/** « 4 bémols : quelle tonalité majeure ? » */
export const SIGNATURE_TO_KEY_CARDS = KEYS.map((k) => ({ ...k, id: `sig:${k.count}${k.kind}` }))

/** « Eb majeur / F mineur : quelle armure ? » */
export const KEY_TO_SIGNATURE_CARDS = KEYS.flatMap((k) => [
  { ...k, id: `key:${k.major}maj`, mode: 'maj', name: `${k.major} majeur` },
  { ...k, id: `key:${k.minor}min`, mode: 'min', name: `${k.minor} mineur` },
])

/** « Le relatif mineur de Eb ? » / « le relatif majeur de F# mineur ? » */
export const RELATIVE_CARDS = KEYS.flatMap((k) => [
  { ...k, id: `rel:${k.major}maj`, from: `${k.major} majeur`, ask: 'mineur', answerRoot: k.minorRoot, answerAcc: k.minorAcc, answer: `${k.minor} mineur` },
  { ...k, id: `rel:${k.minor}min`, from: `${k.minor} mineur`, ask: 'majeur', answerRoot: k.majorRoot, answerAcc: k.majorAcc, answer: `${k.major} majeur` },
])
