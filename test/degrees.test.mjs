import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { DEGREE_CARDS, DEGREE_SEVENTH_CARDS, MAJOR_KEYS, ROMANS, majorScaleChords } = await import(`${P}/exercises/theory/degrees.js`)
const { formatChordName, rootPitchClass } = await import(`${P}/lib/chordName.js`)

const names = (key, acc, opts) => majorScaleChords(key, acc, opts).map(formatChordName).join(' ')

eq('12 tonalités × 7 degrés', DEGREE_CARDS.length, 84)
eq('ids uniques', new Set(DEGREE_CARDS.map((c) => c.id)).size, 84)
eq('C majeur', names('C', ''), 'C Dm Em F G Am Bdim')
eq('F majeur : le IV est Bb', names('F', ''), 'F Gm Am Bb C Dm Edim')
eq('F# majeur : vii° = E#dim', names('F', '#'), 'F# G#m A#m B C# D#m E#dim')
eq('Db majeur', names('D', 'b'), 'Db Ebm Fm Gb Ab Bbm Cdim')
eq('roman et degré', DEGREE_CARDS.find((c) => c.id === 'G:V'), { id: 'G:V', key: 'G', root: 'D', acc: '', qual: 'maj', degree: 5, roman: 'V', seventh: false })
eq('tétrades de C', names('C', '', { seventh: true }), 'Cmaj7 Dm7 Em7 Fmaj7 G7 Am7 Bm7b5')
eq('tétrades de F#', names('F', '#', { seventh: true }), 'F#maj7 G#m7 A#m7 Bmaj7 C#7 D#m7 E#m7b5')
eq('84 tétrades, ids distincts des triades', [DEGREE_SEVENTH_CARDS.length, new Set([...DEGREE_CARDS, ...DEGREE_SEVENTH_CARDS].map((c) => c.id)).size], [84, 168])
eq('id de tétrade', DEGREE_SEVENTH_CARDS.find((c) => c.key === 'G' && c.roman === 'V').id, 'G:V7')

// Chaque gamme sonne bien la gamme majeure, et une lettre par degré.
const MAJOR = [0, 2, 4, 5, 7, 9, 11]
let wrong = 0
for (const [root, acc] of MAJOR_KEYS) {
  const pcs = majorScaleChords(root, acc).map((c) => (rootPitchClass(c.root, c.acc) - rootPitchClass(root, acc) + 12) % 12)
  if (JSON.stringify(pcs) !== JSON.stringify(MAJOR)) wrong++
  if (new Set(majorScaleChords(root, acc).map((c) => c.root)).size !== 7) wrong++
}
eq('toutes les gammes justes, sept lettres', wrong, 0)
eq('qualités diatoniques', majorScaleChords('A', '').map((c) => c.qual), ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'])
eq('sept chiffres romains', ROMANS.length, 7)

export const failures = done('degrés')
