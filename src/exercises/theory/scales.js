// Banque des gammes : majeures, mineures naturelles / harmoniques /
// mélodiques (ascendantes), les cinq autres modes de la gamme majeure
// (dorien, phrygien, lydien, mixolydien, locrien), pentatoniques et blues.
// Une carte = une gamme, la réponse = ses notes avec leur graphie (C# majeur
// a un E# et un B#, A mineur harmonique un G#). Majeur et mineur sur les 15 toniques usuelles
// (jusqu'à 7 dièses et 7 bémols) ; chaque mode sur le degré correspondant de
// ces 15 tonalités (D dorien = les notes de C majeur). Les gammes qui
// demandent une double altération (G# mineur harmonique : F##) sont
// écartées, le sélecteur n'offre que ♮ / # / b.

import { LETTERS, rootPitchClass, spellOnLetter } from '../../lib/chordName.js'

// `steps` : demi-tons depuis la tonique ; `letters` : pour chaque note, le
// degré (0-6) dont elle prend la lettre — consécutifs par défaut, une sélection
// pour les pentatoniques, avec une répétition pour la blue note (Eb et E).
export const MODES = {
  maj: { label: 'majeur', steps: [0, 2, 4, 5, 7, 9, 11] },
  min: { label: 'mineur naturel', steps: [0, 2, 3, 5, 7, 8, 10] },
  harm: { label: 'mineur harmonique', steps: [0, 2, 3, 5, 7, 8, 11] },
  mel: { label: 'mineur mélodique', steps: [0, 2, 3, 5, 7, 9, 11] },
  // Modes : `degree` = degré de la gamme majeure dont ils sont la rotation.
  dor: { label: 'dorien', steps: [0, 2, 3, 5, 7, 9, 10], degree: 2 },
  phr: { label: 'phrygien', steps: [0, 1, 3, 5, 7, 8, 10], degree: 3 },
  lyd: { label: 'lydien', steps: [0, 2, 4, 6, 7, 9, 11], degree: 4 },
  mix: { label: 'mixolydien', steps: [0, 2, 4, 5, 7, 9, 10], degree: 5 },
  loc: { label: 'locrien', steps: [0, 1, 3, 5, 6, 8, 10], degree: 7 },
  pentM: { label: 'pentatonique majeure', steps: [0, 2, 4, 7, 9], letters: [0, 1, 2, 4, 5] },
  pentm: { label: 'pentatonique mineure', steps: [0, 3, 5, 7, 10], letters: [0, 2, 3, 4, 6] },
  bluesM: { label: 'blues majeure', steps: [0, 2, 3, 4, 7, 9], letters: [0, 1, 2, 2, 4, 5] },
  bluesm: { label: 'blues mineure', steps: [0, 3, 5, 6, 7, 10], letters: [0, 2, 3, 4, 4, 6] },
}

// Cercle des quintes, dièses puis bémols.
const MAJOR_TONICS = [
  ['C', ''], ['G', ''], ['D', ''], ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'],
  ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'], ['D', 'b'], ['G', 'b'], ['C', 'b'],
]
const MINOR_TONICS = [
  ['A', ''], ['E', ''], ['B', ''], ['F', '#'], ['C', '#'], ['G', '#'], ['D', '#'], ['A', '#'],
  ['D', ''], ['G', ''], ['C', ''], ['F', ''], ['B', 'b'], ['E', 'b'], ['A', 'b'],
]

/** Les notes d'une gamme : [{ root, acc }], chacune sur la lettre de son degré. */
export function scaleNotes(root, acc, mode) {
  const pc = rootPitchClass(root, acc)
  const start = LETTERS.indexOf(root)
  const { steps, letters } = MODES[mode]
  return steps.map((step, i) => spellOnLetter(LETTERS[(start + (letters ? letters[i] : i)) % 7], (pc + step) % 12))
}

export const noteName = (n) => `${n.root}${n.acc}`

// Palier : majeures jusqu'à 3 altérations ; autres majeures et mineures
// naturelles ; harmoniques, mélodiques et pentatoniques ; modes et blues.
function scaleTier(mode, notes) {
  const accidentals = notes.filter((n) => n.acc !== '').length
  if (mode === 'maj') return accidentals <= 3 ? 1 : 2
  if (mode === 'min') return 2
  if (['harm', 'mel', 'pentM', 'pentm'].includes(mode)) return 3
  return 4
}

const cards = (tonics, mode) =>
  tonics.flatMap(([root, acc, parent]) => {
    const notes = scaleNotes(root, acc, mode)
    if (notes.some((n) => !n || n.acc.length > 1)) return []
    return [{ id: `${root}${acc}:${mode}`, tonic: `${root}${acc}`, mode, name: `${root}${acc} ${MODES[mode].label}`, parent: parent ?? null, notes, letters: notes.map((n) => n.root), tier: scaleTier(mode, notes) }]
  })

/** Toniques d'un mode : le degré `degree` de chaque tonalité majeure, avec la tonalité mère. */
const modeTonics = (mode) =>
  MAJOR_TONICS.map(([root, acc]) => {
    const n = scaleNotes(root, acc, 'maj')[MODES[mode].degree - 1]
    return [n.root, n.acc, `${root}${acc}`]
  })

export const SCALE_CARDS = [
  ...cards(MAJOR_TONICS, 'maj'),
  ...cards(MINOR_TONICS, 'min'),
  ...cards(MINOR_TONICS, 'harm'),
  ...cards(MINOR_TONICS, 'mel'),
  ...['dor', 'phr', 'lyd', 'mix', 'loc'].flatMap((mode) => cards(modeTonics(mode), mode)),
  ...cards(MAJOR_TONICS, 'pentM'),
  ...cards(MINOR_TONICS, 'pentm'),
  ...cards(MAJOR_TONICS, 'bluesM'),
  ...cards(MINOR_TONICS, 'bluesm'),
]
