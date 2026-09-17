// Banques des modes : le lien entre un mode et sa tonalité mère, dans les
// deux sens. Pour chacune des 15 tonalités majeures, le mode de chaque degré
// (ionien = I … locrien = VII), avec la tonique du mode épelée dans la tonalité.

import { keyTier } from './degrees.js'
import { scaleNotes } from './scales.js'

export const MODE_NAMES = ['ionien', 'dorien', 'phrygien', 'lydien', 'mixolydien', 'éolien', 'locrien']
const ROMANS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']

const MAJOR_TONICS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'], ['G', 'b'], ['C', 'b'],
]

const all = MAJOR_TONICS.flatMap(([root, acc]) => {
  const parent = `${root}${acc}`
  const tier = keyTier(root, acc)
  return scaleNotes(root, acc, 'maj').map((n, i) => ({
    parent,
    tier,
    parentRoot: root,
    parentAcc: acc,
    degree: i + 1,
    roman: ROMANS[i],
    mode: MODE_NAMES[i],
    root: n.root,
    acc: n.acc,
    tonic: `${n.root}${n.acc}`,
    name: `${n.root}${n.acc} ${MODE_NAMES[i]}`,
  }))
})

/** « E lydien : de quelle gamme majeure ? » — sans l'ionien, où la réponse est la tonique elle-même. */
export const MODE_PARENT_CARDS = all.filter((c) => c.degree > 1).map((c) => ({ ...c, id: `${c.tonic}:${c.mode}` }))

/** « Dans B majeur, le mode qui commence sur E » — les 7 degrés. */
export const MODE_NAME_CARDS = all.map((c) => ({ ...c, id: `${c.parent}:${c.roman}` }))
