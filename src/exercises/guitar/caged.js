// Formes CAGED : les cinq formes d'accord ouvert (C, A, G, E, D) déplacées
// sur le manche avec un barré. Une carte = (forme, case) sans le nom ; la
// réponse est la lettre de la forme. Les formes E et A ont leur mineur.

import { pitchClassName } from '../../lib/chordName.js'
import { STANDARD_TUNING } from '../../lib/tones.js'

// frets relatifs à la case du barré (0 = le doigt du barré), corde de la
// fondamentale, cordes couvertes par le barré.
const SHAPES = [
  { form: 'E', qual: 'maj', frets: [0, 2, 2, 1, 0, 0], root: 0, barre: [0, 5], tier: 1 },
  { form: 'E', qual: 'min', frets: [0, 2, 2, 0, 0, 0], root: 0, barre: [0, 5], tier: 1 },
  { form: 'A', qual: 'maj', frets: [null, 0, 2, 2, 2, 0], root: 1, barre: [1, 5], tier: 1 },
  { form: 'A', qual: 'min', frets: [null, 0, 2, 2, 1, 0], root: 1, barre: [1, 5], tier: 1 },
  { form: 'C', qual: 'maj', frets: [null, 3, 2, 0, 1, 0], root: 1, barre: [2, 5], tier: 2 },
  { form: 'G', qual: 'maj', frets: [3, 2, 0, 0, 0, 3], root: 0, barre: [2, 4], tier: 2 },
  { form: 'D', qual: 'maj', frets: [null, null, 0, 2, 3, 2], root: 2, barre: [2, 2], tier: 2 },
]
const FORM_LABELS = { E: 'forme E', A: 'forme A', C: 'forme C', G: 'forme G', D: 'forme D' }
export const FORMS = ['C', 'A', 'G', 'E', 'D']

export const CAGED_CARDS = SHAPES.flatMap((shape) =>
  Array.from({ length: 8 }, (_, i) => i + 1).map((k) => {
    const frets = shape.frets.map((f) => (f === null ? null : f + k))
    const rootPc = (STANDARD_TUNING[shape.root] + frets[shape.root]) % 12
    const name = `${pitchClassName(rootPc)}${shape.qual === 'min' ? 'm' : ''}`
    return {
      id: `caged:${shape.form}${shape.qual}:${k}`,
      form: shape.form,
      formLabel: FORM_LABELS[shape.form],
      qual: shape.qual,
      name,
      frets,
      barre: { fret: k, from: shape.barre[0], to: shape.barre[1] },
      baseFret: k,
      rootString: shape.root,
      tier: shape.tier,
    }
  }),
)
