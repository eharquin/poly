// « Rôle de la note » au piano : une carte par (accord, renversement), sans le
// nom — on apprend à reconnaître un renversement, la note la plus basse
// n'étant plus la fondamentale.

import { formatChordName, rootPitchClass } from '../../lib/chordName.js'
import { INTERVALS } from '../../lib/tones.js'
import { ROLE_OF_INTERVAL } from '../common/roles.js'

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
    const intervals = INTERVALS[qual]
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
        tier: intervals.length === 3 ? 1 : 2, // triades, puis tétrades
      }
    })
  }),
)
