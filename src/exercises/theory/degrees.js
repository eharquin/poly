// Banque des degrés : 12 tonalités majeures × 7 degrés, en triades puis en
// tétrades (accords de septième). Une carte = (tonalité, degré) → accord
// diatonique, avec sa graphie correcte dans la tonalité (le IV de F est Bb,
// pas A#). Partagée par les exercices « degré → accord » et « accord → degré ».

import { LETTERS, rootPitchClass, spellOnLetter } from '../../lib/chordName.js'

// Ordre du cercle des quintes : dièses puis bémols. F# plutôt que Gb (E#dim
// vaut Cb pour l'exotisme, et F# est plus fréquent à la guitare).
export const MAJOR_KEYS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'],
]

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]
export const ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const TRIAD_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']
const SEVENTH_QUALITIES = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5']

/**
 * Les 7 degrés d'une tonalité majeure : [{ root, acc, qual, degree, roman,
 * seventh }], en triades ou en tétrades.
 */
export function majorScaleChords(keyRoot, keyAcc, { seventh = false } = {}) {
  const keyPc = rootPitchClass(keyRoot, keyAcc)
  const start = LETTERS.indexOf(keyRoot)
  const qualities = seventh ? SEVENTH_QUALITIES : TRIAD_QUALITIES
  return MAJOR_STEPS.map((step, i) => ({
    ...spellOnLetter(LETTERS[(start + i) % 7], (keyPc + step) % 12),
    qual: qualities[i],
    degree: i + 1,
    roman: ROMANS[i],
    seventh,
  }))
}

const cards = (seventh) =>
  MAJOR_KEYS.flatMap(([root, acc]) => {
    const key = `${root}${acc}`
    return majorScaleChords(root, acc, { seventh }).map((c) => ({ id: `${key}:${c.roman}${seventh ? '7' : ''}`, key, ...c }))
  })

export const DEGREE_CARDS = cards(false)
export const DEGREE_SEVENTH_CARDS = cards(true)
