// Banques du manche de guitare : les 78 positions (6 cordes × cases 0-12)
// pour « quelle note ? », et les 72 couples (corde, note) pour « où est cette
// note ? ». Accordage standard, corde grave -> aiguë.

import { pitchClassName } from '../../lib/chordName.js'
import { STANDARD_TUNING } from '../../lib/tones.js'

export const FRETS = 12
// Palier : les cinq premières cases, puis le reste du manche.
const fretTier = (fret) => (fret <= 5 ? 1 : 2)
export const STRING_LABELS = ['Mi grave (6e)', 'La (5e)', 'Ré (4e)', 'Sol (3e)', 'Si (2e)', 'Mi aigu (1re)']

export const FRETBOARD_NOTE_CARDS = STANDARD_TUNING.flatMap((open, string) =>
  Array.from({ length: FRETS + 1 }, (_, fret) => {
    const pc = (open + fret) % 12
    const others = Array.from({ length: FRETS + 1 }, (_, f) => f).filter((f) => f !== fret && (open + f) % 12 === pc)
    return { id: `s${string}f${fret}`, string, fret, pc, name: pitchClassName(pc), stringLabel: STRING_LABELS[string], others, tier: fretTier(fret) }
  }),
)

export const FRETBOARD_FIND_CARDS = STANDARD_TUNING.flatMap((open, string) =>
  Array.from({ length: 12 }, (_, pc) => {
    const frets = Array.from({ length: FRETS + 1 }, (_, f) => f).filter((f) => (open + f) % 12 === pc)
    return { id: `s${string}:${pc}`, string, pc, name: pitchClassName(pc), stringLabel: STRING_LABELS[string], frets, tier: fretTier(Math.min(...frets)) }
  }),
)
