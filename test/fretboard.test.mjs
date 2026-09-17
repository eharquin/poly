import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { FRETBOARD_NOTE_CARDS, FRETBOARD_FIND_CARDS, FRETS } = await import(`${P}/exercises/guitar/fretboard.js`)

const note = (s, f) => FRETBOARD_NOTE_CARDS.find((c) => c.string === s && c.fret === f)
const find = (s, name) => FRETBOARD_FIND_CARDS.find((c) => c.string === s && c.name === name)

eq('78 positions, ids uniques', [FRETBOARD_NOTE_CARDS.length, new Set(FRETBOARD_NOTE_CARDS.map((c) => c.id)).size], [78, 78])
eq('cordes à vide : E A D G B E', [0, 1, 2, 3, 4, 5].map((s) => note(s, 0).name), ['E', 'A', 'D', 'G', 'B', 'E'])
eq('case 12 = octave', [0, 1, 2, 3, 4, 5].map((s) => note(s, 12).name), ['E', 'A', 'D', 'G', 'B', 'E'])
eq('La corde, case 3 = C', note(1, 3).name, 'C')
eq('Mi grave, case 5 = A (accordage à l’unisson de la corde suivante)', note(0, 5).pc, note(1, 0).pc)
eq('Sol corde, case 4 = B', note(3, 4).pc, note(4, 0).pc)
eq('graphie usuelle', [note(4, 1).name, note(2, 1).name], ['C', 'Eb'])

eq('72 couples corde × note', [FRETBOARD_FIND_CARDS.length, new Set(FRETBOARD_FIND_CARDS.map((c) => c.id)).size], [72, 72])
eq('E sur Mi grave : à vide et case 12', find(0, 'E').frets, [0, 12])
eq('C sur La : case 3', find(1, 'C').frets, [3])
eq('chaque note existe une ou deux fois par corde', FRETBOARD_FIND_CARDS.every((c) => c.frets.length >= 1 && c.frets.length <= 2 && c.frets.every((f) => f >= 0 && f <= FRETS)), true)

export const failures = done('manche')
