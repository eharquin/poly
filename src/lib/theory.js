// Théorie minimale : classes de hauteur, formules d'accords, accordage.
// Fonctions pures, partagées par les drills et leurs retours.

export const NOTE_NAMES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
export const NOTE_NAMES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

// Tonalités qui s'écrivent avec des bémols (cercle des quintes côté gauche).
const FLAT_KEYS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])

const NAME_TO_PC = {}
NOTE_NAMES_SHARP.forEach((n, i) => (NAME_TO_PC[n] = i))
NOTE_NAMES_FLAT.forEach((n, i) => (NAME_TO_PC[n] = i))
Object.assign(NAME_TO_PC, { 'E#': 5, 'B#': 0, Fb: 4, Cb: 11 })

/** Classe de hauteur (0-11) d'un nom de note, ou null. */
export function pitchClass(name) {
  return NAME_TO_PC[name] ?? null
}

/** Nom d'une classe de hauteur, en dièses par défaut, en bémols dans une tonalité bémolisée. */
export function noteName(pc, key = 'C') {
  const names = FLAT_KEYS.has(key) ? NOTE_NAMES_FLAT : NOTE_NAMES_SHARP
  return names[((pc % 12) + 12) % 12]
}

// Graphie usuelle des fondamentales d'accords dans les recueils : C# et F#
// en dièses, Eb/Ab/Bb en bémols. C'est celle qu'on affiche par défaut.
export const CHORD_ROOT_NAMES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

export function chordRootName(pc) {
  return CHORD_ROOT_NAMES[((pc % 12) + 12) % 12]
}

/** Les deux graphies d'une classe de hauteur ("C#/Db"), ou une seule pour les naturelles. */
export function noteNameBoth(pc) {
  const s = NOTE_NAMES_SHARP[pc]
  const f = NOTE_NAMES_FLAT[pc]
  return s === f ? s : `${s}/${f}`
}

// Qualités d'accord : intervalles en demi-tons depuis la fondamentale.
export const QUALITIES = {
  maj: { label: '', name: 'majeur', intervals: [0, 4, 7] },
  m: { label: 'm', name: 'mineur', intervals: [0, 3, 7] },
  7: { label: '7', name: 'septième de dominante', intervals: [0, 4, 7, 10] },
  m7: { label: 'm7', name: 'mineur septième', intervals: [0, 3, 7, 10] },
  maj7: { label: 'maj7', name: 'majeur septième', intervals: [0, 4, 7, 11] },
  dim: { label: 'dim', name: 'diminué', intervals: [0, 3, 6] },
  dim7: { label: 'dim7', name: 'septième diminuée', intervals: [0, 3, 6, 9] },
  m7b5: { label: 'm7♭5', name: 'demi-diminué', intervals: [0, 3, 6, 10] },
  sus2: { label: 'sus2', name: 'suspendu 2', intervals: [0, 2, 7] },
  sus4: { label: 'sus4', name: 'suspendu 4', intervals: [0, 5, 7] },
}

export const QUALITY_IDS = Object.keys(QUALITIES)

/** Nom d'accord affichable : "C", "Am7", "F#m7♭5". */
export function chordName(rootPc, quality) {
  return `${chordRootName(rootPc)}${QUALITIES[quality].label}`
}

/** Classes de hauteur d'un accord (fondamentale + qualité), dans l'ordre des intervalles. */
export function chordTones(rootPc, quality) {
  return QUALITIES[quality].intervals.map((i) => (rootPc + i) % 12)
}

// Accordage standard, corde grave -> aiguë : E A D G B E.
export const STANDARD_TUNING = [4, 9, 2, 7, 11, 4]

/**
 * Classes de hauteur produites par un voicing : `frets` de la corde grave à
 * l'aiguë, 'x' pour une corde étouffée. Renvoie une entrée par corde jouée.
 */
export function voicingPitches(frets, tuning = STANDARD_TUNING) {
  const out = []
  frets.forEach((f, string) => {
    if (f === 'x' || f === null || f === undefined) return
    out.push({ string, fret: f, pc: (tuning[string] + f) % 12 })
  })
  return out
}

/**
 * Vérifie qu'un voicing sonne bien l'accord annoncé : aucune note étrangère,
 * et toutes les notes de l'accord — à une tolérance près, usuelle à la
 * guitare : dans une tétrade, la quinte peut être omise (C7 ouvert, x32310,
 * n'a pas de G). Sert de test du pool.
 */
export function voicingMatches(frets, rootPc, quality) {
  const sounding = new Set(voicingPitches(frets).map((p) => p.pc))
  const tones = chordTones(rootPc, quality)
  const expected = new Set(tones)
  for (const pc of sounding) if (!expected.has(pc)) return false
  const fifth = (rootPc + 7) % 12
  for (const pc of expected) {
    if (sounding.has(pc)) continue
    if (pc === fifth && tones.length >= 4) continue
    return false
  }
  return true
}

/** Index (0 = corde grave) de la corde la plus grave qui joue la fondamentale, ou null. */
export function rootString(frets, rootPc) {
  const hit = voicingPitches(frets).find((p) => p.pc === rootPc)
  return hit ? hit.string : null
}

// Gamme majeure et qualités diatoniques des degrés (triades / tétrades).
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
const ROMAN = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
const DIATONIC_TRIAD = ['maj', 'm', 'm', 'maj', 'maj', 'm', 'dim']
const DIATONIC_SEVENTH = ['maj7', 'm7', 'm7', 'maj7', '7', 'm7', 'm7b5']

/**
 * Degré d'un accord dans une tonalité majeure ("V de G"), ou null s'il n'y est
 * pas diatonique. Les sus n'ont pas de degré.
 */
export function degreeInKey(rootPc, quality, key) {
  const keyPc = pitchClass(key)
  if (keyPc === null) return null
  const step = MAJOR_SCALE.indexOf(((rootPc - keyPc) % 12 + 12) % 12)
  if (step < 0) return null
  if (quality === DIATONIC_TRIAD[step] || quality === DIATONIC_SEVENTH[step]) {
    return { roman: ROMAN[step], key }
  }
  return null
}
