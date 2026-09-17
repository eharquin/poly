// Progressions usuelles, en degrés, dans les 15 tonalités majeures. Une
// carte = (tonalité, progression) → la suite d'accords, épelée dans la
// tonalité. Le blues est à part : ses trois accords sont des septièmes de
// dominante, hors diatonisme.

import { formatChordName } from '../../lib/chordName.js'
import { keyTier, majorScaleChords } from './degrees.js'

const MAJOR_TONICS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'], ['G', 'b'], ['C', 'b'],
]

// degrees : indices 1-7 ; seventh : tétrades diatoniques ; quals : qualités imposées.
export const PROGRESSIONS = [
  { id: 'I-IV-V', label: 'I – IV – V', degrees: [1, 4, 5], hint: 'la cadence de base, rock et folk' },
  { id: 'I-V-vi-IV', label: 'I – V – vi – IV', degrees: [1, 5, 6, 4], hint: 'la pop des quarante dernières années' },
  { id: 'vi-IV-I-V', label: 'vi – IV – I – V', degrees: [6, 4, 1, 5], hint: 'la même, commencée sur le mineur' },
  { id: 'I-vi-IV-V', label: 'I – vi – IV – V', degrees: [1, 6, 4, 5], hint: 'doo-wop, années 50' },
  { id: 'ii-V-I', label: 'ii – V – I', degrees: [2, 5, 1], seventh: true, hint: 'la cadence jazz : m7 → 7 → maj7' },
  { id: 'I-vi-ii-V', label: 'I – vi – ii – V', degrees: [1, 6, 2, 5], seventh: true, hint: 'le turnaround' },
  { id: 'iii-vi-ii-V', label: 'iii – vi – ii – V', degrees: [3, 6, 2, 5], seventh: true, hint: 'le cycle des quintes diatonique' },
  { id: 'blues', label: 'I7 – IV7 – V7 (blues)', degrees: [1, 4, 5], quals: ['7', '7', '7'], hint: 'trois dominantes : le blues n’est pas diatonique' },
]

export const PROGRESSION_CARDS = MAJOR_TONICS.flatMap(([root, acc]) => {
  const key = `${root}${acc}`
  const triads = majorScaleChords(root, acc)
  const sevenths = majorScaleChords(root, acc, { seventh: true })
  return PROGRESSIONS.map((p) => {
    const chords = p.degrees.map((d, i) => {
      const base = (p.seventh ? sevenths : triads)[d - 1]
      const qual = p.quals ? p.quals[i] : base.qual
      return { root: base.root, acc: base.acc, qual, roman: base.roman, name: formatChordName({ root: base.root, acc: base.acc, qual }) }
    })
    return {
      id: `${key}:${p.id}`,
      key,
      progression: p.label,
      hint: p.hint,
      chords,
      name: chords.map((c) => c.name).join(' – '),
      tier: keyTier(root, acc) + (p.seventh || p.quals ? 1 : 0),
    }
  })
})
