import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { PROGRESSION_CARDS, PROGRESSIONS } = await import(`${P}/exercises/theory/progressions.js`)

const c = (id) => PROGRESSION_CARDS.find((x) => x.id === id)
eq('15 tonalités × 8 progressions, ids uniques', [PROGRESSION_CARDS.length, new Set(PROGRESSION_CARDS.map((x) => x.id)).size], [15 * PROGRESSIONS.length, 120])
eq('I – IV – V en C', c('C:I-IV-V').name, 'C – F – G')
eq('I – V – vi – IV en G', c('G:I-V-vi-IV').name, 'G – D – Em – C')
eq('ii – V – I en F : tétrades', c('F:ii-V-I').name, 'Gm7 – C7 – Fmaj7')
eq('turnaround en Bb', c('Bb:I-vi-ii-V').name, 'Bbmaj7 – Gm7 – Cm7 – F7')
eq('blues en A : trois dominantes', c('A:blues').name, 'A7 – D7 – E7')
eq('blues en Eb, épelé', c('Eb:blues').name, 'Eb7 – Ab7 – Bb7')
eq('degrés portés', c('C:ii-V-I').chords.map((x) => x.roman), ['ii', 'V', 'I'])
eq('paliers : triades C = 1, tétrades C = 2, blues Gb = 4', [c('C:I-IV-V').tier, c('C:ii-V-I').tier, c('Gb:blues').tier], [1, 2, 4])

export const failures = done('progressions')
