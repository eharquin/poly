import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { MODE_PARENT_CARDS, MODE_NAME_CARDS, MODE_NAMES } = await import(`${P}/modes.js`)

eq('sept modes dans l’ordre des degrés', MODE_NAMES, ['ionien', 'dorien', 'phrygien', 'lydien', 'mixolydien', 'éolien', 'locrien'])
eq('90 cartes mode → mère, ids uniques', [MODE_PARENT_CARDS.length, new Set(MODE_PARENT_CARDS.map((c) => c.id)).size], [90, 90])
eq('105 cartes degré → mode, ids uniques', [MODE_NAME_CARDS.length, new Set(MODE_NAME_CARDS.map((c) => c.id)).size], [105, 105])
const e = MODE_PARENT_CARDS.find((c) => c.id === 'E:lydien')
eq('E lydien vient de B majeur (IV)', [e.parent, e.parentRoot, e.parentAcc, e.roman], ['B', 'B', '', 'IV'])
eq('D dorien vient de C', MODE_PARENT_CARDS.find((c) => c.id === 'D:dorien').parent, 'C')
eq('Bb mixolydien vient de Eb', MODE_PARENT_CARDS.find((c) => c.id === 'Bb:mixolydien').parent, 'Eb')
eq('pas d’ionien dans mode → mère', MODE_PARENT_CARDS.some((c) => c.mode === 'ionien'), false)
eq('B majeur, sur E : lydien', MODE_NAME_CARDS.find((c) => c.id === 'B:IV').tonic + ' ' + MODE_NAME_CARDS.find((c) => c.id === 'B:IV').mode, 'E lydien')
eq('F# majeur, sur E# : locrien', MODE_NAME_CARDS.find((c) => c.id === 'F#:VII').tonic, 'E#')
eq('C majeur, sur C : ionien', MODE_NAME_CARDS.find((c) => c.id === 'C:I').mode, 'ionien')

export const failures = done('modes')
