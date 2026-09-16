// Pool de cartes du drill « nommer l'accord » : un voicing par carte, en
// paliers. Les formes barrées sont générées depuis un gabarit + une case,
// pour que la même forme change de nom avec la case — c'est précisément la
// théorie du manche qu'on veut construire.
//
// Chaque voicing est vérifié par un test : les cordes jouées doivent sonner
// exactement les notes de l'accord annoncé (voir lib/theory.js).

import { STANDARD_TUNING, pitchClass } from '../lib/theory.js'

// `frets` de la corde grave (E) à l'aiguë (e), 'x' = étouffée, 0 = à vide.
const open = (id, root, quality, frets) => ({
  id,
  root: pitchClass(root),
  quality,
  frets,
  baseFret: 1,
  tier: 1,
  form: 'ouvert',
})

// Gabarits mobiles : cases relatives à la barre, corde de la fondamentale.
const SHAPES = {
  E_maj: { frets: [0, 2, 2, 1, 0, 0], quality: 'maj', rootString: 0 },
  E_min: { frets: [0, 2, 2, 0, 0, 0], quality: 'm', rootString: 0 },
  E_7: { frets: [0, 2, 0, 1, 0, 0], quality: '7', rootString: 0 },
  E_m7: { frets: [0, 2, 0, 0, 0, 0], quality: 'm7', rootString: 0 },
  A_maj: { frets: ['x', 0, 2, 2, 2, 0], quality: 'maj', rootString: 1 },
  A_min: { frets: ['x', 0, 2, 2, 1, 0], quality: 'm', rootString: 1 },
  A_7: { frets: ['x', 0, 2, 0, 2, 0], quality: '7', rootString: 1 },
  A_m7: { frets: ['x', 0, 2, 0, 1, 0], quality: 'm7', rootString: 1 },
  A_maj7: { frets: ['x', 0, 2, 1, 2, 0], quality: 'maj7', rootString: 1 },
}

const barre = (shapeId, fret, tier) => {
  const shape = SHAPES[shapeId]
  return {
    id: `${shapeId}_${fret}`,
    root: (STANDARD_TUNING[shape.rootString] + fret) % 12,
    quality: shape.quality,
    frets: shape.frets.map((f) => (f === 'x' ? 'x' : f + fret)),
    baseFret: fret,
    tier,
    form: `barré forme ${shapeId[0]}`,
  }
}

export const CHORD_CARDS = [
  // --- Palier 1 : accords ouverts ---
  open('C', 'C', 'maj', ['x', 3, 2, 0, 1, 0]),
  open('A', 'A', 'maj', ['x', 0, 2, 2, 2, 0]),
  open('G', 'G', 'maj', [3, 2, 0, 0, 0, 3]),
  open('E', 'E', 'maj', [0, 2, 2, 1, 0, 0]),
  open('D', 'D', 'maj', ['x', 'x', 0, 2, 3, 2]),
  open('Am', 'A', 'm', ['x', 0, 2, 2, 1, 0]),
  open('Em', 'E', 'm', [0, 2, 2, 0, 0, 0]),
  open('Dm', 'D', 'm', ['x', 'x', 0, 2, 3, 1]),
  open('E7', 'E', '7', [0, 2, 0, 1, 0, 0]),
  open('A7', 'A', '7', ['x', 0, 2, 0, 2, 0]),
  open('D7', 'D', '7', ['x', 'x', 0, 2, 1, 2]),
  open('G7', 'G', '7', [3, 2, 0, 0, 0, 1]),
  open('B7', 'B', '7', ['x', 2, 1, 2, 0, 2]),
  open('C7', 'C', '7', ['x', 3, 2, 3, 1, 0]),
  open('Cmaj7', 'C', 'maj7', ['x', 3, 2, 0, 0, 0]),
  open('Amaj7', 'A', 'maj7', ['x', 0, 2, 1, 2, 0]),
  open('Dmaj7', 'D', 'maj7', ['x', 'x', 0, 2, 2, 2]),
  open('Fmaj7', 'F', 'maj7', ['x', 'x', 3, 2, 1, 0]),
  open('Em7', 'E', 'm7', [0, 2, 0, 0, 0, 0]),
  open('Am7', 'A', 'm7', ['x', 0, 2, 0, 1, 0]),
  open('Dm7', 'D', 'm7', ['x', 'x', 0, 2, 1, 1]),
  open('Asus2', 'A', 'sus2', ['x', 0, 2, 2, 0, 0]),
  open('Dsus2', 'D', 'sus2', ['x', 'x', 0, 2, 3, 0]),
  open('Asus4', 'A', 'sus4', ['x', 0, 2, 2, 3, 0]),
  open('Dsus4', 'D', 'sus4', ['x', 'x', 0, 2, 3, 3]),
  open('Esus4', 'E', 'sus4', [0, 2, 2, 2, 0, 0]),

  // --- Palier 2 : barrés majeurs, mineurs, 7 — formes E et A ---
  barre('E_maj', 1, 2), // F
  barre('E_maj', 3, 2), // G
  barre('E_maj', 5, 2), // A
  barre('E_maj', 7, 2), // B
  barre('E_min', 1, 2), // Fm
  barre('E_min', 3, 2), // Gm
  barre('E_min', 5, 2), // Am
  barre('E_min', 7, 2), // Bm
  barre('A_maj', 1, 2), // Bb
  barre('A_maj', 3, 2), // C
  barre('A_maj', 5, 2), // D
  barre('A_min', 2, 2), // Bm
  barre('A_min', 3, 2), // Cm
  barre('A_min', 5, 2), // Dm
  barre('E_7', 1, 2), // F7
  barre('E_7', 3, 2), // G7
  barre('A_7', 3, 2), // C7

  // --- Palier 3 : tétrades mobiles, diminués, demi-diminués, formes hautes ---
  barre('E_m7', 1, 3), // Fm7
  barre('E_m7', 3, 3), // Gm7
  barre('A_m7', 3, 3), // Cm7
  barre('A_m7', 5, 3), // Dm7
  barre('A_maj7', 1, 3), // Bbmaj7
  barre('A_maj7', 3, 3), // Cmaj7
  barre('E_maj', 8, 3), // C, forme E haute
  barre('E_min', 8, 3), // Cm
  barre('A_maj', 8, 3), // F, forme A haute
  { id: 'Cdim', root: 0, quality: 'dim', frets: ['x', 3, 4, 5, 4, 'x'], baseFret: 3, tier: 3, form: 'mobile' },
  { id: 'Bdim', root: 11, quality: 'dim', frets: ['x', 2, 3, 4, 3, 'x'], baseFret: 2, tier: 3, form: 'mobile' },
  { id: 'Ddim7', root: 2, quality: 'dim7', frets: ['x', 'x', 0, 1, 0, 1], baseFret: 1, tier: 3, form: 'ouvert' },
  { id: 'Bm7b5', root: 11, quality: 'm7b5', frets: ['x', 2, 3, 2, 3, 'x'], baseFret: 2, tier: 3, form: 'mobile' },
  { id: 'Em7b5', root: 4, quality: 'm7b5', frets: ['x', 'x', 2, 3, 3, 3], baseFret: 2, tier: 3, form: 'mobile' },
]

export const CHORD_TIERS = [
  { id: 1, label: 'Accords ouverts' },
  { id: 2, label: 'Barrés formes E et A' },
  { id: 3, label: 'Tétrades, diminués, formes hautes' },
]

export function getChordCard(id) {
  return CHORD_CARDS.find((c) => c.id === id) ?? null
}
