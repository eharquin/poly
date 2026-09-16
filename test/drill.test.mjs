import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { pitchClass, chordName, chordTones, chordRootName, degreeInKey, rootString, noteNameBoth } = await import(`${P}/lib/theory.js`)
const { deckState, buildQueue, deckSummary, LEITNER_INTERVALS_DAYS } = await import(`${P}/lib/leitner.js`)
const { CHORD_NAME_DRILL, getDrill } = await import(`${P}/lib/drills.js`)
const { CHORD_CARDS, getChordCard } = await import(`${P}/config/chords.js`)
const { computeLastPracticed, computeAdherence } = await import(`${P}/lib/adherence.js`)
const { sessionLabel } = await import(`${P}/config/program.js`)

let n = 0
const D = (date, answers) => ({
  id: `d${++n}`, date, instrument: 'guitare', sessionType: 'drill', key_of_week: 'C',
  blocks: answers.map(([cardId, correct]) => ({ drillId: 'chord_name', cardId, correct, boxLeitner: 0 })),
})

// --- Théorie ---
eq('pitch class Db = C#', [pitchClass('Db'), pitchClass('C#')], [1, 1])
eq('nom d accord', [chordName(0, 'maj'), chordName(9, 'm7'), chordName(10, 'maj7'), chordName(6, 'm7b5')], ['C', 'Am7', 'Bbmaj7', 'F#m7♭5'])
eq('notes de Am7', chordTones(9, 'm7').map(chordRootName), ['A', 'C', 'E', 'G'])
eq('les deux graphies', [noteNameBoth(1), noteNameBoth(4)], ['C#/Db', 'E'])
eq('G est V de C', degreeInKey(7, 'maj', 'C'), { roman: 'V', key: 'C' })
eq('Am est vi de C', degreeInKey(9, 'm', 'C').roman, 'vi')
eq('G7 est V de C (tétrade)', degreeInKey(7, '7', 'C').roman, 'V')
eq('Bm7b5 est vii° de C', degreeInKey(11, 'm7b5', 'C').roman, 'vii°')
eq('Gm n est pas diatonique en C', degreeInKey(7, 'm', 'C'), null)
eq('F# hors de C', degreeInKey(6, 'maj', 'C'), null)
eq('D est V de G', degreeInKey(2, 'maj', 'G').roman, 'V')
eq('sus4 : pas de degré', degreeInKey(0, 'sus4', 'C'), null)
eq('fondamentale du C ouvert sur la 5e corde', rootString(getChordCard('C').frets, 0), 1)
eq('fondamentale du G ouvert sur la 6e corde', rootString(getChordCard('G').frets, 7), 0)

// --- Pool généré ---
eq('barré E forme 3 = G', chordName(getChordCard('E_maj_3').root, 'maj'), 'G')
eq('barré A forme 1 = Bb', chordName(getChordCard('A_maj_1').root, 'maj'), 'Bb')
eq('cases absolues du F barré', getChordCard('E_maj_1').frets, [1, 3, 3, 2, 1, 1])
eq('baseFret du barré', getChordCard('A_min_5').baseFret, 5)

// --- Drill : évaluation ---
const C = getChordCard('C')
const r1 = CHORD_NAME_DRILL.evaluate(C, { root: 0, quality: 'maj' }, 'C')
eq('C reconnu', [r1.correct, r1.expected.name], [true, 'C'])
eq('retour : notes', r1.feedback.tones, ['C', 'E', 'G'])
eq('retour : corde de la fondamentale', r1.feedback.rootString.label, '5e corde (La)')
eq('retour : degré', r1.feedback.degree.roman, 'I')
const r2 = CHORD_NAME_DRILL.evaluate(C, { root: 0, quality: 'm' }, 'G')
eq('fondamentale juste, qualité fausse', [r2.correct, r2.rootCorrect, r2.qualityCorrect, r2.given.name], [false, true, false, 'Cm'])
eq('C est IV de G', r2.feedback.degree.roman, 'IV')
const Bb = getChordCard('A_maj_1')
eq('Bb accepté via la classe de hauteur A#', CHORD_NAME_DRILL.evaluate(Bb, { root: pitchClass('A#'), quality: 'maj' }, 'C').correct, true)
eq('prompt sans la réponse', Object.keys(CHORD_NAME_DRILL.prompt(C)), ['kind', 'frets', 'baseFret', 'question'])
eq('registre', getDrill('chord_name')?.id, 'chord_name')

// --- Leitner ---
const T = '2026-09-16'
eq('paquet vierge : rien de vu', deckSummary(deckState([], 'chord_name'), CHORD_CARDS, T).seen, 0)
const q0 = buildQueue(deckState([], 'chord_name'), CHORD_CARDS, T)
eq('première série : 5 nouvelles du palier 1', [q0.length, q0.every(id => getChordCard(id).tier === 1)], [5, true])
let hist = [D('2026-09-10', [['C', true], ['A', false], ['G', true]])]
let st = deckState(hist, 'chord_name')
eq('juste -> boîte 1, due le lendemain', [st.get('C').box, st.get('C').due], [1, '2026-09-11'])
eq('faux -> boîte 1 aussi (depuis 0)', st.get('A').box, 1)
hist.push(D('2026-09-11', [['C', true], ['A', true], ['G', false]]))
st = deckState(hist, 'chord_name')
eq('2 justes -> boîte 2, due dans 2 j', [st.get('C').box, st.get('C').due], [2, '2026-09-13'])
eq('faux depuis boîte 1 -> boîte 1', st.get('G').box, 1)
eq('compteurs', [st.get('C').seen, st.get('C').correct, st.get('G').seen, st.get('G').correct], [2, 2, 2, 1])
const five = ['2026-09-01','2026-09-02','2026-09-04','2026-09-08','2026-09-16','2026-10-02'].map(d => D(d, [['E', true]]))
st = deckState(five, 'chord_name')
eq('boîte plafonnée à 5', st.get('E').box, 5)
eq('boîte 5 : revue 16 j plus tard', st.get('E').due, '2026-10-18')
// file : dues d'abord (boîtes faibles), puis nouvelles
st = deckState(hist, 'chord_name')
const q = buildQueue(st, CHORD_CARDS, '2026-09-16')
eq('dues avant les nouvelles, boîtes faibles d abord', q.slice(0, 3), ['G', 'C', 'A'])
eq('puis 5 nouvelles', q.length, 8)
eq('pas de doublon', new Set(q).size, q.length)
const q2 = buildQueue(st, CHORD_CARDS, '2026-09-11')
eq('carte pas encore due exclue', q2.includes('C'), false)
const sum = deckSummary(st, CHORD_CARDS, '2026-09-16')
eq('résumé', [sum.total, sum.seen, sum.dueToday, sum.byBox[0]], [57, 3, 3, 54])
eq('intervalles', LEITNER_INTERVALS_DAYS, [0, 1, 2, 4, 8, 16])

// --- Intégration avec le reste ---
eq('libellé du type drill', sessionLabel('guitare', 'drill'), 'Exercices')
eq('drill hors dernière pratique', computeLastPracticed([D('2026-09-16', [['C', true]])], T).find(f => f.id === 'guitare').status, 'never')
eq('drill hors adhérence', computeAdherence([D('2026-09-16', [['C', true]])], T).every(a => a.count === 0), true)

export const failures = done('drill')
