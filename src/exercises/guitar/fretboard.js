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

// « La tierce majeure au-dessus de cette case ? » : le point de départ sur
// une corde, la réponse sur une corde plus aiguë (n'importe laquelle, à
// n'importe quelle case qui sonne la note). Formes d'intervalles.
const FRET_INTERVALS = [
  { id: '3M', label: 'tierce majeure', semitones: 4, tier: 1 },
  { id: '5J', label: 'quinte juste', semitones: 7, tier: 1 },
  { id: '8', label: 'octave', semitones: 12, tier: 1 },
  { id: '3m', label: 'tierce mineure', semitones: 3, tier: 2 },
  { id: '4J', label: 'quarte juste', semitones: 5, tier: 2 },
  { id: '7m', label: 'septième mineure', semitones: 10, tier: 3 },
  { id: '6M', label: 'sixte majeure', semitones: 9, tier: 3 },
]
export const FRET_INTERVAL_CARDS = FRET_INTERVALS.flatMap((iv) =>
  [0, 1, 2, 3, 4].flatMap((string) =>
    Array.from({ length: 8 }, (_, i) => i + 1).map((fret) => {
      const fromPc = (STANDARD_TUNING[string] + fret) % 12
      const pc = (fromPc + iv.semitones) % 12
      const higher = Array.from({ length: 5 - string }, (_, k) => string + 1 + k)
      const targets = higher.flatMap((s) => Array.from({ length: FRETS + 1 }, (_, f) => f).filter((f) => (STANDARD_TUNING[s] + f) % 12 === pc).map((f) => ({ string: s, fret: f })))
      return {
        id: `iv:${iv.id}:s${string}f${fret}`,
        string,
        fret,
        fromName: pitchClassName(fromPc),
        interval: iv.label,
        semitones: iv.semitones,
        pc,
        name: pitchClassName(pc),
        targets,
        marks: [{ string, fret, kind: 'origin' }],
        activeStrings: higher,
        tier: Math.max(iv.tier, fret > 5 ? 2 : 1),
      }
    }),
  ),
)

export const FRETBOARD_FIND_CARDS = STANDARD_TUNING.flatMap((open, string) =>
  Array.from({ length: 12 }, (_, pc) => {
    const frets = Array.from({ length: FRETS + 1 }, (_, f) => f).filter((f) => (open + f) % 12 === pc)
    return { id: `s${string}:${pc}`, string, pc, name: pitchClassName(pc), stringLabel: STRING_LABELS[string], frets, tier: fretTier(Math.min(...frets)) }
  }),
)
