// Registre des exercices. Chacun : une banque de cartes (id + ce que son
// énoncé affiche), la section de data.json qui porte ses stats Leitner, un
// énoncé (diagramme ou texte), un type de réponse et sa règle de comparaison.

import CHORDS from './chords.json' with { type: 'json' }
import ChordDiagram from './components/ChordDiagram.jsx'
import ChordSelector from './components/ChordSelector.jsx'
import { ChordToDegreePrompt, DegreeToChordPrompt } from './components/DegreePrompt.jsx'
import DegreeSelector from './components/DegreeSelector.jsx'
import { PianoBuildPrompt } from './components/BuildPrompt.jsx'
import PianoDiagram from './components/PianoDiagram.jsx'
import PianoKeySelector from './components/PianoKeySelector.jsx'
import { GuitarRolePrompt, PianoRolePrompt } from './components/RolePrompt.jsx'
import RoleSelector from './components/RoleSelector.jsx'
import { DEGREE_CARDS, DEGREE_SEVENTH_CARDS } from './degrees.js'
import { EMPTY_SELECTION, formatChordName, isComplete, pitchClassName, sameChord, sameChordEnharmonic } from './lib/chordName.js'
import { PIANO_BUILD_CHORDS, PIANO_CHORDS, sameNotes } from './pianoChords.js'
import { GUITAR_ROLE_CARDS, PIANO_ROLE_CARDS, roleLabel } from './roles.js'

// Types de réponse : le sélecteur, la sélection vide, quand elle est complète,
// et comment l'afficher.
const CHORD_ANSWER = { Selector: ChordSelector, empty: EMPTY_SELECTION, isComplete, format: formatChordName }
const DEGREE_ANSWER = { Selector: DegreeSelector, empty: { roman: null }, isComplete: (s) => Boolean(s.roman), format: (s) => s.roman ?? '' }
const ROLE_ANSWER = { Selector: RoleSelector, empty: { role: null }, isComplete: (s) => Boolean(s.role), format: (s) => roleLabel(s.role) }
const sameRole = (sel, card) => sel.role === card.role
const KEYS_ANSWER = {
  Selector: PianoKeySelector,
  empty: { keys: [] },
  isComplete: (s) => s.keys.length >= 3,
  format: (s) => s.keys.map((k) => pitchClassName(k % 12)).join(' · '),
}

const degreeLabel = (c) => `${c.key} · ${c.roman} · ${formatChordName(c)}`

export const EXERCISES = [
  {
    id: 'guitar-chord',
    label: "Nommer l'accord",
    instrument: 'Guitare',
    icon: '🎸',
    hint: 'Une grille, le nom en notation anglaise. Graphie stricte : la grille implique Bb ou A#.',
    unit: 'accord',
    cards: CHORDS,
    section: 'chordStats',
    Prompt: ChordDiagram,
    question: 'Quel accord ?',
    answer: CHORD_ANSWER,
    matches: sameChord,
    formatCard: formatChordName,
  },
  {
    id: 'piano-chord',
    label: "Nommer l'accord",
    instrument: 'Piano',
    icon: '🎹',
    hint: 'Un clavier, le nom en notation anglaise. A# et Bb sont acceptés indifféremment.',
    unit: 'accord',
    cards: PIANO_CHORDS,
    section: 'pianoChordStats',
    Prompt: PianoDiagram,
    question: 'Quel accord ?',
    answer: CHORD_ANSWER,
    matches: sameChordEnharmonic,
    formatCard: formatChordName,
  },
  {
    id: 'piano-build',
    label: "Construire l'accord",
    instrument: 'Piano',
    icon: '🎹',
    hint: 'Le nom d’un accord : tape ses touches sur le clavier. Fondamentale → tierce → quinte → septième, dans l’ordre qu’on veut.',
    unit: 'accord',
    cards: PIANO_BUILD_CHORDS,
    section: 'pianoBuildStats',
    Prompt: PianoBuildPrompt,
    question: 'Quelles touches ?',
    answer: KEYS_ANSWER,
    matches: (sel, card) => sameNotes(sel.keys, card.keys),
    formatCard: (c) => c.name,
  },
  {
    id: 'guitar-role',
    label: 'Rôle de la note',
    instrument: 'Guitare',
    icon: '🎸',
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
    id: 'piano-role',
    label: 'Rôle de la note',
    instrument: 'Piano',
    icon: '🎹',
    hint: 'Un accord renversé, sans son nom, une touche marquée : fondamentale, tierce, quinte ou septième ? On apprend à lire les renversements.',
    unit: 'note',
    cards: PIANO_ROLE_CARDS,
    section: 'pianoRoleStats',
    Prompt: PianoRolePrompt,
    question: 'Quel rôle ?',
    answer: ROLE_ANSWER,
    matches: sameRole,
    formatCard: (c) => `${c.name} · ${c.inversionLabel} · ${roleLabel(c.role).toLowerCase()}`,
  },
  {
    id: 'degree-to-chord',
    label: 'Degré → accord',
    instrument: 'Théorie',
    icon: '🎼',
    hint: 'Une tonalité majeure et un degré : nomme l’accord diatonique, avec sa graphie dans la tonalité (le IV de F est Bb).',
    unit: 'carte',
    cards: DEGREE_CARDS,
    section: 'degreeToChordStats',
    Prompt: DegreeToChordPrompt,
    question: 'Quel accord ?',
    answer: CHORD_ANSWER,
    matches: sameChord,
    formatCard: degreeLabel,
  },
  {
    id: 'degree-to-seventh',
    label: 'Degré → tétrade',
    instrument: 'Théorie',
    icon: '🎼',
    hint: 'Même chose en accords de septième : Imaj7, ii m7, V7, vii m7b5… La suite logique une fois les triades acquises.',
    unit: 'carte',
    cards: DEGREE_SEVENTH_CARDS,
    section: 'degreeToSeventhStats',
    Prompt: DegreeToChordPrompt,
    question: 'Quel accord ?',
    answer: CHORD_ANSWER,
    matches: sameChord,
    formatCard: degreeLabel,
  },
  {
    id: 'chord-to-degree',
    label: 'Accord → degré',
    instrument: 'Théorie',
    icon: '🎼',
    hint: 'Une tonalité majeure et un accord, triade ou tétrade : quel degré ? Comme en lisant la grille d’un morceau.',
    unit: 'carte',
    cards: [...DEGREE_CARDS, ...DEGREE_SEVENTH_CARDS],
    section: 'chordToDegreeStats',
    Prompt: ChordToDegreePrompt,
    question: 'Quel degré ?',
    answer: DEGREE_ANSWER,
    matches: (sel, card) => sel.roman === card.roman,
    formatCard: degreeLabel,
  },
]

export function getExercise(id) {
  return EXERCISES.find((e) => e.id === id) ?? null
}
