// « Rôle de la note » à la guitare : une carte par (grille, corde jouée), le
// nom de l'accord affiché — on apprend quelle note sonne sur quelle corde.

import { formatChordName, rootPitchClass } from '../../lib/chordName.js'
import { STANDARD_TUNING } from '../../lib/tones.js'
import { ROLE_OF_INTERVAL, ROLE_QUALITIES } from '../common/roles.js'
import CHORDS from './chords.json' with { type: 'json' }

const STRING_LABELS = ['6e corde', '5e corde', '4e corde', '3e corde', '2e corde', '1re corde']

export const GUITAR_ROLE_CARDS = CHORDS.filter((c) => ROLE_QUALITIES.includes(c.qual)).flatMap((chord) => {
  const rootPc = rootPitchClass(chord.root, chord.acc)
  const name = formatChordName(chord)
  return chord.frets.flatMap((fret, string) => {
    if (fret === null) return []
    const role = ROLE_OF_INTERVAL[(STANDARD_TUNING[string] + fret - rootPc + 12) % 12]
    return [{ id: `${chord.id}@${string}`, name, frets: chord.frets, barre: chord.barre, string, stringLabel: STRING_LABELS[string], role }]
  })
})
