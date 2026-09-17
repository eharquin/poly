// Banque des accords de piano : les 12 fondamentales × les 18 qualités,
// générées depuis une formule (intervalles en demi-tons, position fondamentale
// resserrée). Contrairement à la guitare, il n'y a qu'un doigté canonique,
// donc pas de liste à la main. `keys` = demi-tons depuis le Do de l'octave
// de la fondamentale, pour le clavier SVG.

import { QUALITIES, rootPitchClass } from './lib/chordName.js'

// Graphie usuelle des fondamentales : C# et F# en dièses, Eb / Ab / Bb en bémols.
const ROOTS = [
  ['C', ''], ['C', '#'], ['D', ''], ['E', 'b'], ['E', ''], ['F', ''],
  ['F', '#'], ['G', ''], ['A', 'b'], ['A', ''], ['B', 'b'], ['B', ''],
]

// Voicings : les enrichissements (9, 11, 13) à l'octave, la tierce omise
// dans le 11 et la quinte dans le 13, comme on les joue.
export const VOICINGS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  6: [0, 4, 7, 9],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  9: [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  11: [0, 7, 10, 14, 17],
  13: [0, 4, 10, 14, 21],
  add9: [0, 4, 7, 14],
}

export const PIANO_CHORDS = ROOTS.flatMap(([root, acc]) =>
  QUALITIES.map((qual) => {
    const pc = rootPitchClass(root, acc)
    return { id: `${root}${acc}${qual}`, root, acc, qual, keys: VOICINGS[qual].map((i) => pc + i) }
  }),
)
