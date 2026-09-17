// Exercices piano : clavier.

import { formatChordName, pitchClassName, sameChordEnharmonic } from '../../lib/chordName.js'
import { sameNotes } from '../../lib/tones.js'
import { CHORD_ANSWER, ROLE_ANSWER, sameRole } from '../common/answers.js'
import { roleLabel } from '../common/roles.js'
import { PIANO_BUILD_CHORDS, PIANO_CHORDS } from './chords.js'
import PianoDiagram from './PianoDiagram.jsx'
import PianoKeySelector from './PianoKeySelector.jsx'
import { PianoBuildPrompt, PianoRolePrompt } from './prompts.jsx'
import { PIANO_ROLE_CARDS } from './roles.js'

const KEYS_ANSWER = {
  Selector: PianoKeySelector,
  empty: { keys: [] },
  isComplete: (s) => s.keys.length >= 3,
  format: (s) => s.keys.map((k) => pitchClassName(k % 12)).join(' · '),
}

const instrument = 'Piano'
const icon = '🎹'

export const PIANO = {
  id: 'piano',
  label: instrument,
  icon,
  exercises: [
    {
      id: 'piano-chord',
      label: "Nommer l'accord",
      instrument,
      icon,
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
      instrument,
      icon,
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
      id: 'piano-role',
      label: 'Rôle de la note',
      instrument,
      icon,
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
  ],
}
