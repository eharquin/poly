import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { INTERVAL_NAME_CARDS, INTERVAL_NOTE_CARDS, semitonesOf, qualityOf, noteAbove, inversion, intervalLabel, noteName } = await import(`${P}/exercises/theory/intervals.js`)

const above = (root, acc, n, q) => { const x = noteAbove({ root, acc }, n, q); return x ? noteName(x) : null }

eq('demi-tons', [semitonesOf(3, 'maj'), semitonesOf(3, 'min'), semitonesOf(5, 'perf'), semitonesOf(4, 'aug'), semitonesOf(5, 'dim'), semitonesOf(7, 'dim'), semitonesOf(8, 'perf')], [4, 3, 7, 6, 6, 9, 12])
eq('qualité impossible', [semitonesOf(3, 'perf'), semitonesOf(5, 'maj')], [null, null])
eq('qualité depuis les demi-tons', [qualityOf(3, 4), qualityOf(3, 3), qualityOf(2, 3), qualityOf(5, 6), qualityOf(4, 6), qualityOf(6, 10), qualityOf(3, 7)], ['maj', 'min', 'aug', 'dim', 'aug', 'aug', null])
eq('sixte majeure de C = A', above('C', '', 6, 'maj'), 'A')
eq('sixte majeure de E = C#', above('E', '', 6, 'maj'), 'C#')
eq('tierce majeure de B = D#', above('B', '', 3, 'maj'), 'D#')
eq('tierce mineure de Eb = Gb', above('E', 'b', 3, 'min'), 'Gb')
eq('quinte juste de Bb = F', above('B', 'b', 5, 'perf'), 'F')
eq('quarte augmentée de F = B, quinte diminuée de B = F', [above('F', '', 4, 'aug'), above('B', '', 5, 'dim')], ['B', 'F'])
eq('seconde augmentée de C = D# (pas Eb)', above('C', '', 2, 'aug'), 'D#')
eq('septième diminuée de E = Db (même touche que C#)', above('E', '', 7, 'dim'), 'Db')
eq('octave', above('F', '#', 8, 'perf'), 'F#')
eq('double altération : écartée', [above('A', '#', 3, 'maj'), above('G', 'b', 7, 'dim')], [null, null])
eq('renversements', [inversion(3, 'maj'), inversion(6, 'min'), inversion(4, 'aug'), inversion(5, 'perf'), inversion(8, 'perf')], [{ n: 6, quality: 'min' }, { n: 3, quality: 'maj' }, { n: 5, quality: 'dim' }, { n: 4, quality: 'perf' }, null])
eq('libellé', [intervalLabel(6, 'maj'), intervalLabel(5, 'perf'), intervalLabel(7, 'dim')], ['sixte majeure', 'quinte juste', 'septième diminuée'])

eq('banques : 214 à nommer, 180 à trouver, ids uniques', [INTERVAL_NAME_CARDS.length, INTERVAL_NOTE_CARDS.length, new Set(INTERVAL_NAME_CARDS.map((c) => c.id)).size], [214, 180, 214])
eq('palier 1 : notes naturelles, 3m 3M 5J 8ve', INTERVAL_NAME_CARDS.filter((c) => c.tier === 1).every((c) => c.from.acc === '' && [3, 5, 8].includes(c.number)), true)
eq('les enharmoniques rares ne sont pas à trouver', INTERVAL_NOTE_CARDS.some((c) => c.tier === 4), false)
eq('toutes les cartes sonnent juste', INTERVAL_NAME_CARDS.every((c) => qualityOf(c.number, c.semitones) === c.quality), true)

export const failures = done('intervalles')
