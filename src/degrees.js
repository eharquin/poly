// Banque des degrés : 12 tonalités majeures × 7 degrés, en triades. Une carte
// = (tonalité, degré) → accord diatonique, avec sa graphie correcte dans la
// tonalité (le IV de F est Bb, pas A#). Partagée par les deux exercices
// « degré → accord » et « accord → degré ».

import { LETTERS, letterPitchClass, rootPitchClass } from './lib/chordName.js'

// Ordre du cercle des quintes : dièses puis bémols. F# plutôt que Gb (E#dim
// vaut Cb pour l'exotisme, et F# est plus fréquent à la guitare).
export const MAJOR_KEYS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'],
]

const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]
export const ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const TRIAD_QUALITIES = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']

/** Graphie d'une classe de hauteur sur une lettre imposée : (E, 5) → E#. */
function spell(letter, pc) {
  const diff = ((pc - letterPitchClass(letter) + 18) % 12) - 6
  return { root: letter, acc: diff === 1 ? '#' : diff === -1 ? 'b' : '' }
}

/** Les 7 degrés d'une tonalité majeure : [{ root, acc, qual, degree, roman }]. */
export function majorScaleChords(keyRoot, keyAcc) {
  const keyPc = rootPitchClass(keyRoot, keyAcc)
  const start = LETTERS.indexOf(keyRoot)
  return MAJOR_STEPS.map((step, i) => ({
    ...spell(LETTERS[(start + i) % 7], (keyPc + step) % 12),
    qual: TRIAD_QUALITIES[i],
    degree: i + 1,
    roman: ROMANS[i],
  }))
}

export const DEGREE_CARDS = MAJOR_KEYS.flatMap(([root, acc]) => {
  const key = `${root}${acc}`
  return majorScaleChords(root, acc).map((c) => ({ id: `${key}:${c.roman}`, key, ...c }))
})
