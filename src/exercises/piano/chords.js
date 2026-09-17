// Banque des accords de piano : les 12 fondamentales × les 18 qualités,
// générées depuis les formules de lib/tones.js (position fondamentale
// resserrée). Contrairement à la guitare, il n'y a qu'un doigté canonique,
// donc pas de liste à la main. `keys` = demi-tons depuis le Do de l'octave
// de la fondamentale, pour le clavier SVG.

import { QUALITIES, formatChordName, rootPitchClass } from '../../lib/chordName.js'
import { BUILDABLE, INTERVALS } from '../../lib/tones.js'

// Graphie usuelle des fondamentales : C# et F# en dièses, Eb / Ab / Bb en bémols.
const ROOTS = [
  ['C', ''], ['C', '#'], ['D', ''], ['E', 'b'], ['E', ''], ['F', ''],
  ['F', '#'], ['G', ''], ['A', 'b'], ['A', ''], ['B', 'b'], ['B', ''],
]

export const PIANO_CHORDS = ROOTS.flatMap(([root, acc]) =>
  QUALITIES.map((qual) => {
    const pc = rootPitchClass(root, acc)
    return { id: `${root}${acc}${qual}`, root, acc, qual, name: formatChordName({ root, acc, qual }), keys: INTERVALS[qual].map((i) => pc + i) }
  }),
)

// Pour « construire l'accord » : pas les 11 et 13, dont le voicing omet des
// notes (tierce, quinte) qu'on ne peut pas reprocher au joueur d'ajouter.
export const PIANO_BUILD_CHORDS = PIANO_CHORDS.filter((c) => BUILDABLE(c.qual))
