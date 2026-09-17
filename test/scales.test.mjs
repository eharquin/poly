import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { SCALE_CARDS, scaleNotes, noteName } = await import(`${P}/scales.js`)
const { rootPitchClass, spellOnLetter } = await import(`${P}/lib/chordName.js`)

const names = (root, acc, mode) => scaleNotes(root, acc, mode).map(noteName).join(' ')

eq('graphie sur une lettre', [spellOnLetter('E', 5), spellOnLetter('C', 11), spellOnLetter('B', 0), spellOnLetter('F', 4)], [{ root: 'E', acc: '#' }, { root: 'C', acc: 'b' }, { root: 'B', acc: '#' }, { root: 'F', acc: 'b' }])
eq('C majeur', names('C', '', 'maj'), 'C D E F G A B')
eq('C# majeur : E# et B#', names('C', '#', 'maj'), 'C# D# E# F# G# A# B#')
eq('Cb majeur : Fb', names('C', 'b', 'maj'), 'Cb Db Eb Fb Gb Ab Bb')
eq('F majeur : Bb', names('F', '', 'maj'), 'F G A Bb C D E')
eq('A mineur naturel', names('A', '', 'min'), 'A B C D E F G')
eq('A# mineur : sept dièses', names('A', '#', 'min'), 'A# B# C# D# E# F# G#')
eq('Ab mineur : sept bémols', names('A', 'b', 'min'), 'Ab Bb Cb Db Eb Fb Gb')
eq('30 gammes, ids uniques', [SCALE_CARDS.length, new Set(SCALE_CARDS.map((c) => c.id)).size], [30, 30])
eq('carte', SCALE_CARDS.find((c) => c.id === 'C#:maj').name, 'C# majeur')
eq('lettres consécutives depuis la tonique', SCALE_CARDS.find((c) => c.id === 'Eb:min').letters, ['E', 'F', 'G', 'A', 'B', 'C', 'D'])

// Chaque gamme a sept lettres distinctes, jamais de double altération, et sonne bien ses degrés.
let wrong = 0
for (const c of SCALE_CARDS) {
  if (new Set(c.letters).size !== 7) wrong++
  const tonicPc = rootPitchClass(c.notes[0].root, c.notes[0].acc)
  const steps = c.notes.map((n) => (rootPitchClass(n.root, n.acc) - tonicPc + 12) % 12)
  const want = c.mode === 'maj' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10]
  if (JSON.stringify(steps) !== JSON.stringify(want)) wrong++
}
eq('toutes les gammes justes', wrong, 0)

export const failures = done('gammes')
