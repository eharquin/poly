import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { SCALE_CARDS, MODES, scaleNotes, noteName } = await import(`${P}/exercises/theory/scales.js`)
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
eq('A mineur harmonique : G#', names('A', '', 'harm'), 'A B C D E F G#')
eq('A mineur mélodique : F# et G#', names('A', '', 'mel'), 'A B C D E F# G#')
eq('Ab mineur harmonique : G naturel (Gb haussé)', names('A', 'b', 'harm'), 'Ab Bb Cb Db Eb Fb G')
eq('A# mineur mélodique : doubles dièses, bien écrits', names('A', '#', 'mel'), 'A# B# C# D# E# F## G##')
eq('double altération dans spellOnLetter', [spellOnLetter('F', 7), spellOnLetter('B', 9), spellOnLetter('C', 3)], [{ root: 'F', acc: '##' }, { root: 'B', acc: 'bb' }, null])
eq('gammes à double altération écartées', SCALE_CARDS.filter((c) => c.mode === 'harm' || c.mode === 'mel').map((c) => c.tonic).filter((t) => /^[GDA]#$/.test(t)), [])
eq('D dorien', names('D', '', 'dor'), 'D E F G A B C')
eq('E phrygien', names('E', '', 'phr'), 'E F G A B C D')
eq('F lydien', names('F', '', 'lyd'), 'F G A B C D E')
eq('G mixolydien', names('G', '', 'mix'), 'G A B C D E F')
eq('B locrien', names('B', '', 'loc'), 'B C D E F G A')
eq('Bb mixolydien : notes de Eb majeur', names('B', 'b', 'mix'), 'Bb C D Eb F G Ab')
eq('un mode porte sa tonalité mère', SCALE_CARDS.find((c) => c.id === 'A:dor').parent, 'G')
eq('15 toniques par mode, dont C# dorien (B majeur) et Ab dorien (Gb majeur)', [SCALE_CARDS.filter((c) => c.mode === 'dor').length, Boolean(SCALE_CARDS.find((c) => c.id === 'C#:dor')), Boolean(SCALE_CARDS.find((c) => c.id === 'Ab:dor'))], [15, true, true])
eq('pentatoniques', [names('C', '', 'pentM'), names('A', '', 'pentm'), names('F', '#', 'pentM')], ['C D E G A', 'A C D E G', 'F# G# A# C# D#'])
eq('blues : la blue note double la lettre', [names('A', '', 'bluesm'), names('C', '', 'bluesM')], ['A C D Eb E G', 'C D Eb E G A'])
eq('lettres de A blues mineure', SCALE_CARDS.find((c) => c.id === 'A:bluesm').letters, ['A', 'C', 'D', 'E', 'E', 'G'])
eq('blues à double altération écartées (Cb, Gb majeures ; Ab, Eb mineures)', ['Cb:bluesM', 'Gb:bluesM', 'Ab:bluesm', 'Eb:bluesm'].map((id) => SCALE_CARDS.some((c) => c.id === id)), [false, false, false, false])
eq('129 + 15 + 15 + 13 + 13 gammes, ids uniques', [SCALE_CARDS.length, new Set(SCALE_CARDS.map((c) => c.id)).size], [185, 185])
// Un mode = rotation de sa tonalité mère.
let modeWrong = 0
for (const c of SCALE_CARDS.filter((c) => c.parent)) {
  const parentNotes = scaleNotes(c.parent[0], c.parent.slice(1), 'maj').map(noteName)
  const d = MODES[c.mode].degree - 1
  if (JSON.stringify([...parentNotes.slice(d), ...parentNotes.slice(0, d)]) !== JSON.stringify(c.notes.map(noteName))) modeWrong++
}
eq('modes = rotations de la gamme mère', modeWrong, 0)
eq('carte', SCALE_CARDS.find((c) => c.id === 'C#:maj').name, 'C# majeur')
eq('lettres consécutives depuis la tonique', SCALE_CARDS.find((c) => c.id === 'Eb:min').letters, ['E', 'F', 'G', 'A', 'B', 'C', 'D'])

// Chaque gamme heptatonique a sept lettres distinctes ; toutes sonnent bien leurs degrés.
let wrong = 0
for (const c of SCALE_CARDS) {
  if (c.notes.length === 7 && new Set(c.letters).size !== 7) wrong++
  if (c.notes.some((n) => n.acc.length > 1)) wrong++
  const tonicPc = rootPitchClass(c.notes[0].root, c.notes[0].acc)
  const steps = c.notes.map((n) => (rootPitchClass(n.root, n.acc) - tonicPc + 12) % 12)
  const want = MODES[c.mode].steps
  if (JSON.stringify(steps) !== JSON.stringify(want)) wrong++
}
eq('toutes les gammes justes', wrong, 0)

export const failures = done('gammes')
