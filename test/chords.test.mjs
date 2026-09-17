// Vérifie la banque chords.json : ids uniques et cohérents, grilles bien
// formées, et surtout que chaque grille sonne l'accord annoncé. La petite
// table de théorie ci-dessous ne sert qu'ici — l'app ne raisonne pas sur les
// notes, seulement sur les noms.
import { readFileSync } from 'node:fs'
const CHORDS = JSON.parse(readFileSync(new URL('../src/exercises/guitar/chords.json', import.meta.url), 'utf8'))
const { QUALITIES, formatChordName } = await import(new URL('../src/lib/chordName.js', import.meta.url))

const NAMES = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const ACC = { '': 0, '#': 1, b: -1 }
const TUNING = [4, 9, 2, 7, 11, 4] // E A D G B E

// Intervalles (demi-tons) de chaque qualité, et ceux qu'une grille de guitare
// peut omettre : la quinte dès qu'il y a une septième, la tierce et la neuvième
// dans un 11, la neuvième et la onzième dans un 13.
const FORMULA = {
  maj: { tones: [0, 4, 7] },
  min: { tones: [0, 3, 7] },
  dim: { tones: [0, 3, 6] },
  aug: { tones: [0, 4, 8] },
  sus2: { tones: [0, 2, 7] },
  sus4: { tones: [0, 5, 7] },
  6: { tones: [0, 4, 7, 9], optional: [7] },
  7: { tones: [0, 4, 7, 10], optional: [7] },
  maj7: { tones: [0, 4, 7, 11], optional: [7] },
  m7: { tones: [0, 3, 7, 10], optional: [7] },
  m7b5: { tones: [0, 3, 6, 10] },
  dim7: { tones: [0, 3, 6, 9] },
  9: { tones: [0, 4, 7, 10, 2], optional: [7] },
  maj9: { tones: [0, 4, 7, 11, 2], optional: [7] },
  m9: { tones: [0, 3, 7, 10, 2], optional: [7] },
  11: { tones: [0, 4, 7, 10, 2, 5], optional: [7, 4, 2] },
  13: { tones: [0, 4, 7, 10, 2, 5, 9], optional: [7, 2, 5] },
  add9: { tones: [0, 4, 7, 2] },
}

let bad = 0
const fail = (msg) => {
  bad++
  console.log(`FAIL ${msg}`)
}
const ids = new Set()
for (const c of CHORDS) {
  const name = formatChordName(c)
  if (ids.has(c.id)) fail(`id en double : ${c.id}`)
  ids.add(c.id)
  if (c.id !== `${c.root}${c.acc}${c.qual}`) fail(`${c.id} : id ≠ root+acc+qual`)
  if (!(c.root in NAMES) || !(c.acc in ACC) || !QUALITIES.includes(c.qual)) fail(`${c.id} : triplet invalide`)
  if (!Array.isArray(c.frets) || c.frets.length !== 6) fail(`${c.id} : 6 cordes attendues`)
  if (c.frets.some((f) => f !== null && !(Number.isInteger(f) && f >= 0 && f <= 5))) fail(`${c.id} : case hors de la grille (0-5 ou null)`)
  if (c.barre) {
    const { fret, from, to } = c.barre
    if (!(from < to) || c.frets.slice(from, to + 1).some((f) => f === null || f < fret)) fail(`${c.id} : barré incohérent`)
  }

  const rootPc = (NAMES[c.root] + ACC[c.acc] + 12) % 12
  const { tones, optional = [] } = FORMULA[c.qual]
  const expected = new Set(tones.map((i) => (rootPc + i) % 12))
  const sounding = new Set(c.frets.map((f, s) => (f === null ? null : (TUNING[s] + f) % 12)).filter((p) => p !== null))
  const NOTE = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
  const heard = [...sounding].map((p) => NOTE[p]).join(' ')
  for (const pc of sounding) if (!expected.has(pc)) fail(`${name.padEnd(8)} sonne une note étrangère : ${heard}`)
  for (const i of tones) {
    const pc = (rootPc + i) % 12
    if (!sounding.has(pc) && !optional.includes(i)) fail(`${name.padEnd(8)} manque ${NOTE[pc]} : ${heard}`)
  }
}
console.log(`${CHORDS.length} accords, ${bad} invalide(s)`)
export const failures = bad
