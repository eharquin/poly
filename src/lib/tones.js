// Notes d'un accord : formules par qualité et comparaison d'un voicing à un
// nom, à l'octave, au renversement et aux doublures près. Partagé par les
// banques piano et les exercices « construire l'accord ».

import { rootPitchClass } from './chordName.js'

// Intervalles (demi-tons) depuis la fondamentale, en position fondamentale
// resserrée : c'est aussi le voicing affiché au piano. Enrichissements (9,
// 11, 13) à l'octave, tierce omise dans le 11 et quinte dans le 13, comme on
// les joue.
export const INTERVALS = {
  maj: [0, 4, 7],
  min: [0, 3, 7],
  dim: [0, 3, 6],
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  6: [0, 4, 7, 9],
  7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  m7b5: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  9: [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  11: [0, 7, 10, 14, 17],
  13: [0, 4, 10, 14, 21],
  add9: [0, 4, 7, 14],
}

// Palier d'apprentissage d'une qualité : triades usuelles, puis tétrades et
// sus, puis le reste.
export const QUALITY_TIER = {
  maj: 1, min: 1,
  7: 2, maj7: 2, m7: 2, dim: 2, sus2: 2, sus4: 2,
  aug: 3, m7b5: 3, dim7: 3, 6: 3, add9: 3, 9: 3, maj9: 3, m9: 3, 11: 3, 13: 3,
}

// Qualités dont le voicing omet des notes : on ne les demande pas à construire.
export const BUILDABLE = (qual) => qual !== '11' && qual !== '13'

/** Classes de hauteur d'un accord nommé, dans l'ordre des intervalles. */
export function chordTones({ root, acc, qual }) {
  const pc = rootPitchClass(root, acc)
  return INTERVALS[qual].map((i) => (pc + i) % 12)
}

export const STANDARD_TUNING = [4, 9, 2, 7, 11, 4] // E A D G B E, corde grave -> aiguë

/** Classes de hauteur sonnées par une grille (`null` = corde étouffée). */
export function fretsPitchClasses(frets, tuning = STANDARD_TUNING) {
  return frets.flatMap((f, s) => (f === null ? [] : [(tuning[s] + f) % 12]))
}

const pcSet = (list) => new Set(list.map((k) => ((k % 12) + 12) % 12))

/** Mêmes classes de hauteur, à l'octave, au renversement et aux doublures près. */
export function sameNotes(a, b) {
  const A = pcSet(a)
  const B = pcSet(b)
  return A.size === B.size && [...A].every((pc) => B.has(pc))
}

/**
 * Un voicing sonne-t-il l'accord nommé ? Aucune note étrangère, toutes les
 * notes présentes — sauf la quinte, omissible dès qu'il y a une septième
 * (usuel à la guitare : C7 ouvert n'a pas de G).
 */
export function soundsLike(pitchClasses, chord) {
  const sounding = pcSet(pitchClasses)
  const tones = chordTones(chord)
  const expected = pcSet(tones)
  for (const pc of sounding) if (!expected.has(pc)) return false
  const fifth = (tones[0] + 7) % 12
  for (const pc of expected) {
    if (sounding.has(pc)) continue
    if (pc === fifth && tones.length >= 4) continue
    return false
  }
  return true
}
