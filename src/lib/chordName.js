// Nom d'accord en notation anglaise : note + altération + qualité. Le
// sélecteur construit un triplet { root, acc, qual } ; la banque (chords.json)
// porte le même triplet. Comparaison stricte : pas d'enharmonie ni
// d'orthographe alternative en v1.

export const NOTES = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

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

export const EMPTY_SELECTION = { root: null, acc: null, qual: null }
