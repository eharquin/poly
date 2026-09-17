import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { formatChordName, isComplete, sameChord } = await import(`${P}/lib/chordName.js`)
const { BOX_INTERVALS_DAYS, applyAnswer, applyAnswers, dueChords, isDue, pickChord, deckSummary, emptyStat } = await import(`${P}/lib/leitner.js`)
const { applyOp, recordChordAnswers } = await import(`${P}/lib/ops.js`)

// --- Noms ---
eq('A7', formatChordName({ root: 'A', acc: '', qual: '7' }), 'A7')
eq('majeur sans suffixe', formatChordName({ root: 'B', acc: 'b', qual: 'maj' }), 'Bb')
eq('mineur = m', formatChordName({ root: 'F', acc: '#', qual: 'min' }), 'F#m')
eq('aperçu partiel', formatChordName({ root: 'C', acc: null, qual: null }), 'C')
eq('complet avec altération naturelle', isComplete({ root: 'C', acc: '', qual: 'maj' }), true)
eq('incomplet sans altération', isComplete({ root: 'C', acc: null, qual: 'maj' }), false)
eq('comparaison stricte (A# ≠ Bb)', sameChord({ root: 'A', acc: '#', qual: 'maj' }, { root: 'B', acc: 'b', qual: 'maj' }), false)

// --- Dû ou pas ---
const T = Date.parse('2026-09-17T10:00:00Z')
const day = 86400000
const seen = (box, daysAgo) => ({ ...emptyStat(), box, lastSeen: new Date(T - daysAgo * day).toISOString() })
eq('intervalles', BOX_INTERVALS_DAYS, { 1: 0, 2: 1, 3: 3, 4: 7, 5: 15 })
eq('jamais vu : dû', isDue(undefined, T), true)
eq('boîte 1 : toujours dû', isDue(seen(1, 0), T), true)
eq('boîte 2 vue hier : dû', isDue(seen(2, 1), T), true)
eq('boîte 2 vue il y a 12 h : pas dû', isDue(seen(2, 0.5), T), false)
eq('boîte 5 vue il y a 14 j : pas dû', isDue(seen(5, 14), T), false)
eq('boîte 5 vue il y a 15 j : dû', isDue(seen(5, 15), T), true)

// --- Promotion / rétrogradation / stats ---
const first = applyAnswer(undefined, { attempts: 1, timeMs: 3000, at: '2026-09-17T10:00:00Z' })
eq('neuf + du premier coup → boîte 2', [first.box, first.attempts, first.successes, first.avgTimeMs, first.lastSeen], [2, 1, 1, 3000, '2026-09-17T10:00:00Z'])
const second = applyAnswer(first, { attempts: 3, timeMs: 5000, at: '2026-09-18T10:00:00Z' })
eq('trois essais → boîte 1, essais cumulés', [second.box, second.attempts, second.successes], [1, 4, 2])
eq('moyenne glissante 0.7/0.3', second.avgTimeMs, 3600)
eq('plafond boîte 5', applyAnswer(seen(5, 20), { attempts: 1, timeMs: 1000, at: 'x' }).box, 5)

// --- Tirage ---
const chords = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
const stats = { a: seen(3, 0), b: seen(1, 0) } // a pas dû, b dû, c neuf
eq('accords dus', dueChords(chords, stats, T).map((c) => c.id), ['b', 'c'])
eq('tirage parmi les dus', pickChord(chords, stats, { now: T, rng: () => 0.99 }).id, 'c')
eq('exclusion du précédent', pickChord(chords, stats, { now: T, exclude: 'c', rng: () => 0.99 }).id, 'b')
const none = { a: seen(3, 0), b: seen(3, 0), c: seen(3, 0) }
eq('rien de dû → toute la banque', pickChord(chords, none, { now: T, rng: () => 0 }).id, 'a')
// Pondération 1/boîte : a en boîte 1 (poids 1), b en boîte 4 (poids 0.25).
const w = { a: seen(1, 0), b: seen(4, 8) }
eq('poids : premier 80 % → a', pickChord([{ id: 'a' }, { id: 'b' }], w, { now: T, rng: () => 0.79 }).id, 'a')
eq('poids : au-delà → b', pickChord([{ id: 'a' }, { id: 'b' }], w, { now: T, rng: () => 0.81 }).id, 'b')
eq('résumé', deckSummary(chords, stats, T), { total: 3, seen: 2, due: 2, byBox: [0, 2, 0, 1, 0, 0] })

// --- Op ---
const answers = [
  { chordId: 'A7', attempts: 1, timeMs: 2000, at: '2026-09-17T10:00:00Z' },
  { chordId: 'A7', attempts: 2, timeMs: 4000, at: '2026-09-17T10:01:00Z' },
  { chordId: 'Emaj', attempts: 1, timeMs: 1000, at: '2026-09-17T10:02:00Z' },
]
const data = applyOp({ sessions: [], chordStats: {} }, recordChordAnswers(answers))
eq('op : deux réponses sur A7', [data.chordStats.A7.box, data.chordStats.A7.attempts, data.chordStats.A7.successes], [1, 3, 2])
eq('op : Emaj en boîte 2', data.chordStats.Emaj.box, 2)
eq('op ≡ applyAnswers', data.chordStats, applyAnswers({}, answers))
eq('op sans chordStats existant', applyOp({ sessions: [] }, recordChordAnswers(answers.slice(2))).chordStats.Emaj.successes, 1)

export const failures = done('leitner')
