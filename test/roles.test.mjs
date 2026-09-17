import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { ROLES } = await import(`${P}/exercises/common/roles.js`)
const { GUITAR_ROLE_CARDS } = await import(`${P}/exercises/guitar/roles.js`)
const { PIANO_ROLE_CARDS, inversionKeys } = await import(`${P}/exercises/piano/roles.js`)

const byId = (id) => GUITAR_ROLE_CARDS.find((c) => c.id === id)

// --- Guitare ---
eq('toutes les cartes ont un rôle', GUITAR_ROLE_CARDS.every((c) => ROLES.some((r) => r.id === c.role)), true)
eq('ids uniques', new Set(GUITAR_ROLE_CARDS.map((c) => c.id)).size, GUITAR_ROLE_CARDS.length)
eq('pas de sus / 6 / 9', GUITAR_ROLE_CARDS.some((c) => /sus|add|6|9|11|13/.test(c.name)), false)
eq('E ouvert : rôles par corde', GUITAR_ROLE_CARDS.filter((c) => c.name === 'E').map((c) => c.role), ['root', 'fifth', 'root', 'third', 'fifth', 'root'])
eq('C ouvert : 5e corde = fondamentale, 1re = tierce', [byId('Cmaj@1').role, byId('Cmaj@5').role], ['root', 'third'])
eq('G7 : 1re corde = septième', byId('G7@5').role, 'seventh')
eq('Bm7b5 : quinte diminuée = quinte', byId('Bm7b5@2').role, 'fifth')
eq('corde étouffée : pas de carte', byId('Cmaj@0'), undefined)
eq('la carte porte la grille et la corde', [byId('Cmaj@1').frets, byId('Cmaj@1').string, byId('Cmaj@1').stringLabel], [[null, 3, 2, 0, 1, 0], 1, '5e corde'])

// --- Piano ---
eq('renversements de C7', [0, 1, 2, 3].map((k) => inversionKeys(0, [0, 4, 7, 10], k)), [[0, 4, 7, 10], [4, 7, 10, 12], [7, 10, 12, 16], [10, 12, 16, 19]])
eq('1er renversement de Bb : D F Bb, dans la première octave', inversionKeys(10, [0, 4, 7], 1), [2, 5, 10])
eq('12 × (2 × 3 + 3 × 4) cartes', PIANO_ROLE_CARDS.length, 216)
eq('ids uniques', new Set(PIANO_ROLE_CARDS.map((c) => c.id)).size, 216)
eq('tout tient sur deux octaves', PIANO_ROLE_CARDS.every((c) => Math.max(...c.keys) < 24), true)
eq('la note marquée est jouée', PIANO_ROLE_CARDS.every((c) => c.keys.includes(c.highlight)), true)
eq('C7 : un rôle différent par renversement', PIANO_ROLE_CARDS.filter((c) => c.name === 'C7').map((c) => c.role), ['third', 'fifth', 'seventh', 'root'])
eq('Dm : tierce, quinte, fondamentale', PIANO_ROLE_CARDS.filter((c) => c.name === 'Dm').map((c) => c.role), ['third', 'fifth', 'root'])
eq('libellé du renversement', PIANO_ROLE_CARDS.find((c) => c.id === 'Amaj7/2').inversionLabel, '2e renversement')

export const failures = done('rôles')
