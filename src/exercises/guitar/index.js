// Exercices guitare : grilles d'accords et manche.

import { NOTE_NAMES_BOTH, formatChordName, pitchClassName, sameChord } from '../../lib/chordName.js'
import { BUILDABLE, QUALITY_TIER, fretsPitchClasses, soundsLike } from '../../lib/tones.js'
import { CHORD_ANSWER, ROLE_ANSWER, sameRole } from '../common/answers.js'
import { roleLabel } from '../common/roles.js'
import ChordDiagram from './ChordDiagram.jsx'
import ChordGridSelector from './ChordGridSelector.jsx'
import CHORDS from './chords.json' with { type: 'json' }
import FretboardSelector from './FretboardSelector.jsx'
import { FRETBOARD_FIND_CARDS, FRETBOARD_NOTE_CARDS } from './fretboard.js'
import NoteSelector from './NoteSelector.jsx'
import { FretboardFindPrompt, FretboardNotePrompt, GuitarBuildPrompt, GuitarRolePrompt } from './prompts.jsx'
import { GUITAR_ROLE_CARDS } from './roles.js'

const FRETS_ANSWER = {
  Selector: ChordGridSelector,
  empty: { frets: [null, null, null, null, null, null] },
  isComplete: (s) => s.frets.filter((f) => f !== null).length >= 3,
  format: (s) => fretsPitchClasses(s.frets).map(pitchClassName).join(' · '),
}
const NOTE_ANSWER = { Selector: NoteSelector, empty: { pc: null }, isComplete: (s) => s.pc !== null, format: (s) => NOTE_NAMES_BOTH[s.pc] }
const FRET_ANSWER = { Selector: FretboardSelector, empty: { fret: null }, isComplete: (s) => s.fret !== null, format: (s) => (s.fret === 0 ? 'à vide' : `case ${s.fret}`) }
const fretLabel = (f) => (f === 0 ? 'à vide' : `case ${f}`)

// Paliers : nommer = ouverts puis barrés ; construire = par qualité.
const NAME_CHORDS = CHORDS.map((c) => ({ ...c, tier: c.barre ? 2 : 1 }))
// Accords de la banque à construire : un par nom, sans 11 ni 13.
const BUILD_CHORDS = CHORDS.filter((c) => BUILDABLE(c.qual)).map((c) => ({ ...c, name: formatChordName(c), tier: QUALITY_TIER[c.qual] }))

const instrument = 'Guitare'
const icon = '🎸'

export const GUITAR = {
  id: 'guitar',
  label: instrument,
  icon,
  exercises: [
    {
      id: 'guitar-chord',
      label: "Nommer l'accord",
      instrument,
      icon,
      hint: 'Une grille, le nom en notation anglaise. Graphie stricte : la grille implique Bb ou A#.',
      unit: 'accord',
      cards: NAME_CHORDS,
      section: 'chordStats',
      Prompt: ChordDiagram,
      question: 'Quel accord ?',
      answer: CHORD_ANSWER,
      matches: sameChord,
      formatCard: formatChordName,
    },
    {
      id: 'guitar-build',
      label: "Construire l'accord",
      instrument,
      icon,
      hint: 'Le nom d’un accord : place les doigts sur la grille. N’importe quelle position, seules les notes sonnées comptent.',
      unit: 'accord',
      cards: BUILD_CHORDS,
      section: 'guitarBuildStats',
      Prompt: GuitarBuildPrompt,
      question: 'Quelle grille ?',
      answer: FRETS_ANSWER,
      matches: (sel, card) => soundsLike(fretsPitchClasses(sel.frets), card),
      formatCard: (c) => c.name,
    },
    {
      id: 'guitar-role',
      label: 'Rôle de la note',
      instrument,
      icon,
      hint: 'La grille d’un accord nommé, une corde marquée : fondamentale, tierce, quinte ou septième ? On apprend quelle note sonne où.',
      unit: 'note',
      cards: GUITAR_ROLE_CARDS,
      section: 'guitarRoleStats',
      Prompt: GuitarRolePrompt,
      question: 'Quel rôle ?',
      answer: ROLE_ANSWER,
      matches: sameRole,
      formatCard: (c) => `${c.name} · ${c.stringLabel} · ${roleLabel(c.role).toLowerCase()}`,
    },
    {
      id: 'fretboard-note',
      label: 'Note sur le manche',
      instrument,
      icon,
      hint: 'Une case marquée sur le manche (12 cases) : quelle note ? A# et Bb sont acceptés indifféremment.',
      unit: 'position',
      cards: FRETBOARD_NOTE_CARDS,
      section: 'fretboardNoteStats',
      Prompt: FretboardNotePrompt,
      question: 'Quelle note ?',
      answer: NOTE_ANSWER,
      matches: (sel, card) => sel.pc === card.pc,
      formatCard: (c) => `${c.stringLabel} · ${fretLabel(c.fret)} : ${c.name}`,
    },
    {
      id: 'fretboard-find',
      label: 'Trouver la note',
      instrument,
      icon,
      hint: 'Une corde et une note : tape la case. Toute case juste compte (le E de la corde de Mi est à vide et en 12).',
      unit: 'position',
      cards: FRETBOARD_FIND_CARDS,
      section: 'fretboardFindStats',
      Prompt: FretboardFindPrompt,
      question: 'Quelle case ?',
      answer: FRET_ANSWER,
      matches: (sel, card) => card.frets.includes(sel.fret),
      formatCard: (c) => `${c.name} sur ${c.stringLabel} : ${c.frets.map(fretLabel).join(' / ')}`,
    },
  ],
}
