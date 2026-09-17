import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { FRETBOARD_NOTE_CARDS, FRETBOARD_FIND_CARDS, FRET_INTERVAL_CARDS, FRETS } = await import(`${P}/exercises/guitar/fretboard.js`)
const { CAGED_CARDS } = await import(`${P}/exercises/guitar/caged.js`)

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

// --- Intervalle sur le manche ---
const iv = (id) => FRET_INTERVAL_CARDS.find((c) => c.id === id)
eq('7 intervalles × 5 cordes × 8 cases', FRET_INTERVAL_CARDS.length, 280)
eq('tierce majeure au-dessus de A (Mi grave, case 5) = C#', [iv('iv:3M:s0f5').fromName, iv('iv:3M:s0f5').name], ['A', 'C#'])
eq('cibles : C# sur les cordes plus aiguës', iv('iv:3M:s0f5').targets, [{ string: 1, fret: 4 }, { string: 2, fret: 11 }, { string: 3, fret: 6 }, { string: 4, fret: 2 }, { string: 5, fret: 9 }])
eq('quinte au-dessus de D (La, case 5) = A, corde de Ré case 7', iv('iv:5J:s1f5').targets.some((t) => t.string === 2 && t.fret === 7), true)
eq('cordes actives = plus aiguës', [iv('iv:8:s3f2').activeStrings, iv('iv:8:s4f2').activeStrings], [[4, 5], [5]])
eq('point de départ marqué', iv('iv:5J:s1f5').marks, [{ string: 1, fret: 5, kind: 'origin' }])

// --- CAGED ---
const cg = (id) => CAGED_CARDS.find((c) => c.id === id)
eq('7 formes × 8 cases', CAGED_CARDS.length, 56)
eq('forme E en case 1 = F', [cg('caged:Emaj:1').name, cg('caged:Emaj:1').frets, cg('caged:Emaj:1').barre], ['F', [1, 3, 3, 2, 1, 1], { fret: 1, from: 0, to: 5 }])
eq('forme A mineure en case 2 = Bm', [cg('caged:Amin:2').name, cg('caged:Amin:2').frets], ['Bm', [null, 2, 4, 4, 3, 2]])
eq('forme C en case 3 = Eb', [cg('caged:Cmaj:3').name, cg('caged:Cmaj:3').frets, cg('caged:Cmaj:3').baseFret], ['Eb', [null, 6, 5, 3, 4, 3], 3])
eq('forme G en case 5 = C', cg('caged:Gmaj:5').name, 'C')
eq('forme D en case 4 = F#', cg('caged:Dmaj:4').name, 'F#')
eq('paliers : E/A puis C/G/D', [cg('caged:Emaj:3').tier, cg('caged:Gmaj:3').tier], [1, 2])

export const failures = done('manche')
