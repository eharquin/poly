import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { KEYS, SIGNATURE_TO_KEY_CARDS, KEY_TO_SIGNATURE_CARDS, RELATIVE_CARDS, signatureLabel } = await import(`${P}/exercises/theory/keys.js`)

const k = (major) => KEYS.find((x) => x.major === major)
eq('15 tonalités', KEYS.length, 15)
eq('C : aucune altération, relatif A', [k('C').count, k('C').kind, k('C').minor, k('C').signature], [0, '', 'A', 'aucune altération'])
eq('Ab : 4 bémols, relatif F', [k('Ab').count, k('Ab').kind, k('Ab').minor, k('Ab').accidentals], [4, 'b', 'F', ['Bb', 'Eb', 'Ab', 'Db']])
eq('E : 4 dièses, relatif C#', [k('E').count, k('E').kind, k('E').minor, k('E').accidentals], [4, '#', 'C#', ['F#', 'C#', 'G#', 'D#']])
eq('C# : 7 dièses, relatif A#', [k('C#').count, k('C#').minor], [7, 'A#'])
eq('Cb : 7 bémols, relatif Ab', [k('Cb').count, k('Cb').minor], [7, 'Ab'])
eq('paliers', [k('G').tier, k('Ab').tier, k('Gb').tier], [1, 2, 3])
eq('libellés', [signatureLabel(1, '#'), signatureLabel(3, 'b'), signatureLabel(0, '')], ['1 dièse', '3 bémols', 'aucune altération'])
eq('banques : 15 / 30 / 30, ids uniques', [SIGNATURE_TO_KEY_CARDS.length, KEY_TO_SIGNATURE_CARDS.length, RELATIVE_CARDS.length, new Set([...SIGNATURE_TO_KEY_CARDS, ...KEY_TO_SIGNATURE_CARDS, ...RELATIVE_CARDS].map((c) => c.id)).size], [15, 30, 30, 75])
eq('F mineur : 4 bémols', KEY_TO_SIGNATURE_CARDS.find((c) => c.id === 'key:Fmin').signature, '4 bémols')
eq('relatif mineur de Eb = C', RELATIVE_CARDS.find((c) => c.id === 'rel:Ebmaj').answer, 'C mineur')
eq('relatif majeur de F# mineur = A', RELATIVE_CARDS.find((c) => c.id === 'rel:F#min').answer, 'A majeur')

export const failures = done('tonalités')
