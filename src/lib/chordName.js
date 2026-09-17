// Nom d'accord en notation anglaise : note + altération + qualité. Le
// sélecteur construit un triplet { root, acc, qual } ; les banques portent le
// même triplet. Comparaison stricte pour la guitare (la grille implique une
// graphie), enharmonique pour le piano (une touche noire n'en a pas).

export const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

// Les mêmes, dans l'ordre des gammes (pour parcourir une gamme lettre par lettre).
export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

// Valeur stockée -> libellé du bouton.
export const ACCIDENTALS = [
  { value: '', label: '♮' },
  { value: '#', label: '#' },
  { value: 'b', label: 'b' },
]

export const QUALITIES = ['maj', 'min', 'dim', 'aug', 'sus2', 'sus4', '6', '7', 'maj7', 'm7', 'm7b5', 'dim7', '9', 'maj9', 'm9', '11', '13', 'add9']

// Suffixe affiché : "maj" s'écrit sans rien, "min" s'écrit "m".
const SUFFIX = { maj: '', min: 'm' }

/** "A7", "Bb", "F#m", "Cm7b5". Les parties absentes sont omises (aperçu en cours de saisie). */
export function formatChordName({ root, acc, qual }) {
  const suffix = qual == null ? '' : (SUFFIX[qual] ?? qual)
  return `${root ?? ''}${acc ?? ''}${suffix}`
}

/** Sélection complète ? (l'altération naturelle est la chaîne vide, donc valide) */
export function isComplete(sel) {
  return Boolean(sel.root) && typeof sel.acc === 'string' && Boolean(sel.qual)
}

export function sameChord(a, b) {
  return a.root === b.root && a.acc === b.acc && a.qual === b.qual
}

const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
const ACC_PC = { '': 0, '#': 1, b: -1 }

/** Classe de hauteur d'une note naturelle : E → 4. */
export function letterPitchClass(letter) {
  return NOTE_PC[letter]
}

/** Graphie d'une classe de hauteur sur une lettre imposée : (E, 5) → E#, (C, 11) → Cb. */
export function spellOnLetter(letter, pc) {
  const diff = ((pc - NOTE_PC[letter] + 18) % 12) - 6
  return { root: letter, acc: diff === 1 ? '#' : diff === -1 ? 'b' : '' }
}

/** Classe de hauteur (0-11) d'une fondamentale : Bb = A# = 10. */
export function rootPitchClass(root, acc) {
  return (NOTE_PC[root] + ACC_PC[acc] + 12) % 12
}

// Graphie usuelle d'une classe de hauteur isolée (C# et F# en dièses, le reste en bémols).
const PC_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
export const pitchClassName = (pc) => PC_NAMES[((pc % 12) + 12) % 12]

/** Même accord à la graphie près : A#m = Bbm. */
export function sameChordEnharmonic(a, b) {
  return rootPitchClass(a.root, a.acc) === rootPitchClass(b.root, b.acc) && a.qual === b.qual
}

export const EMPTY_SELECTION = { root: null, acc: null, qual: null }
