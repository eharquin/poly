// Registre des exercices. Chacun : une banque de cartes (id + ce que son
// énoncé affiche), la section de data.json qui porte ses stats Leitner, un
// énoncé (diagramme ou texte), un type de réponse et sa règle de comparaison.

import CHORDS from './chords.json'
import ChordDiagram from './components/ChordDiagram.jsx'
import ChordSelector from './components/ChordSelector.jsx'
import { ChordToDegreePrompt, DegreeToChordPrompt } from './components/DegreePrompt.jsx'
import DegreeSelector from './components/DegreeSelector.jsx'
import PianoDiagram from './components/PianoDiagram.jsx'
import { DEGREE_CARDS } from './degrees.js'
import { EMPTY_SELECTION, formatChordName, isComplete, sameChord, sameChordEnharmonic } from './lib/chordName.js'
import { PIANO_CHORDS } from './pianoChords.js'

// Types de réponse : le sélecteur, la sélection vide, quand elle est complète,
// et comment l'afficher.
const CHORD_ANSWER = { Selector: ChordSelector, empty: EMPTY_SELECTION, isComplete, format: formatChordName }
const DEGREE_ANSWER = { Selector: DegreeSelector, empty: { roman: null }, isComplete: (s) => Boolean(s.roman), format: (s) => s.roman ?? '' }

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
    id: 'chord-to-degree',
    label: 'Accord → degré',
    instrument: 'Théorie',
    icon: '🎼',
    hint: 'Une tonalité majeure et un accord : quel degré ? Comme en lisant la grille d’un morceau.',
    unit: 'carte',
    cards: DEGREE_CARDS,
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
