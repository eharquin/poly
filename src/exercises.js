// Registre des exercices. Chacun : une banque d'accords (id, root, acc, qual
// + ce que son diagramme affiche), la section de data.json qui porte ses
// stats Leitner, son diagramme et sa règle de comparaison.

import CHORDS from './chords.json'
import ChordDiagram from './components/ChordDiagram.jsx'
import PianoDiagram from './components/PianoDiagram.jsx'
import { sameChord, sameChordEnharmonic } from './lib/chordName.js'
import { PIANO_CHORDS } from './pianoChords.js'

export const EXERCISES = [
  {
    id: 'guitar-chord',
    label: "Nommer l'accord",
    instrument: 'Guitare',
    icon: '🎸',
    hint: 'Une grille, le nom en notation anglaise. Graphie stricte : la grille implique Bb ou A#.',
    chords: CHORDS,
    section: 'chordStats',
    Diagram: ChordDiagram,
    matches: sameChord,
  },
  {
    id: 'piano-chord',
    label: "Nommer l'accord",
    instrument: 'Piano',
    icon: '🎹',
    hint: 'Un clavier, le nom en notation anglaise. A# et Bb sont acceptés indifféremment.',
    chords: PIANO_CHORDS,
    section: 'pianoChordStats',
    Diagram: PianoDiagram,
    matches: sameChordEnharmonic,
  },
]

export function getExercise(id) {
  return EXERCISES.find((e) => e.id === id) ?? null
}
