// Banques de l'exercice « rôle de la note » : un diagramme, une note marquée,
// et la question « fondamentale, tierce, quinte ou septième ? ». Limité aux
// qualités dont chaque note a l'un de ces quatre rôles (pas de sus, 6, 9…).
//
// Guitare : une carte par (grille, corde jouée), le nom de l'accord est
// affiché — on apprend quelle note sonne sur quelle corde. Piano : une carte
// par (accord, renversement), sans le nom — on apprend à reconnaître un
// renversement, la note la plus basse n'étant plus la fondamentale.

import CHORDS from './chords.json' with { type: 'json' }
import { formatChordName, rootPitchClass } from './lib/chordName.js'
import { VOICINGS } from './pianoChords.js'

export const ROLES = [
  { id: 'root', label: 'Fondamentale' },
  { id: 'third', label: 'Tierce' },
  { id: 'fifth', label: 'Quinte' },
  { id: 'seventh', label: 'Septième' },
]
export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label ?? id

// Qualités où chaque intervalle a un rôle de tétrade sans ambiguïté.
export const ROLE_QUALITIES = ['maj', 'min', 'dim', 'aug', '7', 'maj7', 'm7', 'm7b5', 'dim7']

// Demi-tons depuis la fondamentale -> rôle (valable pour ROLE_QUALITIES).
const ROLE_OF_INTERVAL = { 0: 'root', 3: 'third', 4: 'third', 6: 'fifth', 7: 'fifth', 8: 'fifth', 9: 'seventh', 10: 'seventh', 11: 'seventh' }

export const STANDARD_TUNING = [4, 9, 2, 7, 11, 4] // E A D G B E
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

// Fondamentales : graphie usuelle, comme la banque piano.
const ROOTS = [
  ['C', ''], ['C', '#'], ['D', ''], ['E', 'b'], ['E', ''], ['F', ''],
  ['F', '#'], ['G', ''], ['A', 'b'], ['A', ''], ['B', 'b'], ['B', ''],
]
const PIANO_ROLE_QUALITIES = ['maj', 'min', '7', 'maj7', 'm7']
const INVERSION_LABELS = ['position fondamentale', '1er renversement', '2e renversement', '3e renversement']

/**
 * Touches (demi-tons depuis le Do de la première octave) du renversement k :
 * la note tones[k] à la basse, les autres empilées au plus serré.
 */
export function inversionKeys(rootPc, intervals, k) {
  const n = intervals.length
  const keys = [(rootPc + intervals[k]) % 12]
  for (let i = 1; i < n; i++) {
    const pc = (rootPc + intervals[(k + i) % n]) % 12
    const prev = keys[i - 1]
    keys.push(prev + ((pc - prev) % 12 + 12) % 12)
  }
  return keys
}

export const PIANO_ROLE_CARDS = ROOTS.flatMap(([root, acc]) =>
  PIANO_ROLE_QUALITIES.flatMap((qual) => {
    const intervals = VOICINGS[qual]
    const rootPc = rootPitchClass(root, acc)
    const name = formatChordName({ root, acc, qual })
    return intervals.map((_, k) => {
      const keys = inversionKeys(rootPc, intervals, k)
      // La note marquée est la deuxième depuis la basse : jamais la basse en
      // position fondamentale (trop facile), et au fil des renversements on
      // demande chaque rôle une fois (tierce, quinte, [septième,] fondamentale).
      return {
        id: `${root}${acc}${qual}/${k}`,
        name,
        keys,
        highlight: keys[1],
        inversion: k,
        inversionLabel: INVERSION_LABELS[k],
        role: ROLE_OF_INTERVAL[intervals[(k + 1) % intervals.length]],
      }
    })
  }),
)
