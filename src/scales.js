// Banque des gammes : majeures et mineures naturelles, sur les 15 toniques
// usuelles de chaque (jusqu'à 7 dièses et 7 bémols). Une carte = une gamme,
// la réponse = ses 7 notes avec leur graphie (C# majeur a un E# et un B#).

import { LETTERS, rootPitchClass, spellOnLetter } from './lib/chordName.js'

export const MODES = {
  maj: { label: 'majeur', steps: [0, 2, 4, 5, 7, 9, 11] },
  min: { label: 'mineur naturel', steps: [0, 2, 3, 5, 7, 8, 10] },
}

// Cercle des quintes, dièses puis bémols.
const MAJOR_TONICS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'], ['G', 'b'], ['C', 'b'],
]
const MINOR_TONICS = [
  ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'], ['G', '#'], ['D', '#'], ['A', '#'],
  ['D', ''], ['G', ''], ['C', ''], ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'],
]

/** Les 7 notes d'une gamme : [{ root, acc }], une lettre par degré. */
export function scaleNotes(root, acc, mode) {
  const pc = rootPitchClass(root, acc)
  const start = LETTERS.indexOf(root)
  return MODES[mode].steps.map((step, i) => spellOnLetter(LETTERS[(start + i) % 7], (pc + step) % 12))
}

export const noteName = (n) => `${n.root}${n.acc}`

const cards = (tonics, mode) =>
  tonics.map(([root, acc]) => {
    const notes = scaleNotes(root, acc, mode)
    return { id: `${root}${acc}:${mode}`, tonic: `${root}${acc}`, mode, name: `${root}${acc} ${MODES[mode].label}`, notes, letters: notes.map((n) => n.root) }
  })

export const SCALE_CARDS = [...cards(MAJOR_TONICS, 'maj'), ...cards(MINOR_TONICS, 'min')]
