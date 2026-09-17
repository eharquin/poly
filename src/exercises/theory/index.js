// Exercices de théorie : degrés, gammes, modes.

import { formatChordName, sameChord } from '../../lib/chordName.js'
import { CHORD_ANSWER } from '../common/answers.js'
import { DEGREE_CARDS, DEGREE_SEVENTH_CARDS } from './degrees.js'
import DegreeSelector from './DegreeSelector.jsx'
import { INTERVAL_NAME_CARDS, INTERVAL_NOTE_CARDS, intervalLabel, inversion } from './intervals.js'
import IntervalSelector from './IntervalSelector.jsx'
import KeySelector from './KeySelector.jsx'
import { MODE_NAME_CARDS, MODE_PARENT_CARDS } from './modes.js'
import ModeSelector from './ModeSelector.jsx'
import { ChordToDegreePrompt, DegreeToChordPrompt, IntervalNamePrompt, IntervalNotePrompt, ModeNamePrompt, ModeParentPrompt, ScalePrompt } from './prompts.jsx'
import { SCALE_CARDS, noteName } from './scales.js'
import ScaleSelector from './ScaleSelector.jsx'

const DEGREE_ANSWER = { Selector: DegreeSelector, empty: { roman: null }, isComplete: (s) => Boolean(s.roman), format: (s) => s.roman ?? '' }
// Une altération par lettre de la gamme (les lettres viennent de la carte).
const SCALE_ANSWER = {
  Selector: ScaleSelector,
  empty: { accs: [] },
  isComplete: (s, card) => card.letters.every((_, i) => s.accs[i] != null),
  format: (s, card) => card.letters.map((l, i) => `${l}${s.accs[i] ?? '?'}`).join(' '),
}
const KEY_ANSWER = {
  Selector: KeySelector,
  empty: { root: null, acc: null },
  isComplete: (s) => Boolean(s.root) && typeof s.acc === 'string',
  format: (s) => `${s.root}${s.acc} majeur`,
}
const NOTE_ANSWER = { ...KEY_ANSWER, format: (s) => `${s.root}${s.acc}` }
const INTERVAL_ANSWER = {
  Selector: IntervalSelector,
  empty: { number: null, quality: null },
  isComplete: (s) => Boolean(s.number && s.quality),
  format: (s) => intervalLabel(s.number, s.quality),
}

// Retour d'un intervalle : demi-tons, lettres comptées, renversement.
const intervalFacts = (c) => {
  const inv = inversion(c.number, c.quality)
  return `${c.semitones} ½ tons${inv ? ` · renversement : ${intervalLabel(inv.n, inv.quality)}` : ''}`
}
const MODE_ANSWER = { Selector: ModeSelector, empty: { mode: null }, isComplete: (s) => Boolean(s.mode), format: (s) => s.mode }

const degreeLabel = (c) => `${c.key} · ${c.roman} · ${formatChordName(c)}`
const scaleLabel = (c) => `${c.name} : ${c.notes.map(noteName).join(' ')}${c.parent ? ` (${c.parent} majeur)` : ''}`

const instrument = 'Théorie'
const icon = '🎼'

export const THEORY = {
  id: 'theory',
  label: instrument,
  icon,
  exercises: [
    {
      id: 'interval-name',
      label: 'Nommer l’intervalle',
      instrument,
      icon,
      hint: 'Deux notes, en montant : quel intervalle ? Les lettres donnent le nombre (C → A : six lettres, une sixte), les demi-tons la qualité.',
      unit: 'carte',
      cards: INTERVAL_NAME_CARDS,
      section: 'intervalNameStats',
      Prompt: IntervalNamePrompt,
      question: 'Quel intervalle ?',
      answer: INTERVAL_ANSWER,
      matches: (sel, card) => sel.number === card.number && sel.quality === card.quality,
      formatCard: (c) => `${c.fromName} → ${c.toName} : ${c.label} (${intervalFacts(c)})`,
    },
    {
      id: 'interval-note',
      label: 'Note à l’intervalle',
      instrument,
      icon,
      hint: 'Une note et un intervalle : quelle note au-dessus ? Graphie stricte — une sixte majeure au-dessus de E est C#, pas Db.',
      unit: 'carte',
      cards: INTERVAL_NOTE_CARDS,
      section: 'intervalNoteStats',
      Prompt: IntervalNotePrompt,
      question: 'Quelle note ?',
      answer: NOTE_ANSWER,
      matches: (sel, card) => sel.root === card.to.root && sel.acc === card.to.acc,
      formatCard: (c) => `${c.label} au-dessus de ${c.fromName} : ${c.toName} (${intervalFacts(c)})`,
    },
    {
      id: 'scale',
      label: 'Notes de la gamme',
      instrument,
      icon,
      hint: 'Majeur, mineur (naturel, harmonique, mélodique), modes, pentatoniques, blues : donne les notes avec la bonne graphie (C# majeur a un E# et un B#).',
      unit: 'gamme',
      cards: SCALE_CARDS,
      section: 'scaleStats',
      Prompt: ScalePrompt,
      question: 'Quelles notes ?',
      answer: SCALE_ANSWER,
      matches: (sel, card) => card.notes.every((n, i) => n.acc === sel.accs[i]),
      formatCard: scaleLabel,
    },
    {
      id: 'mode-parent',
      label: 'Mode → tonalité mère',
      instrument,
      icon,
      hint: 'Un mode (E lydien) : de quelle gamme majeure vient-il ? Le lydien est le IVe degré, donc B majeur.',
      unit: 'carte',
      cards: MODE_PARENT_CARDS,
      section: 'modeParentStats',
      Prompt: ModeParentPrompt,
      question: 'Quelle tonalité ?',
      answer: KEY_ANSWER,
      matches: (sel, card) => sel.root === card.parentRoot && sel.acc === card.parentAcc,
      formatCard: (c) => `${c.name} = ${c.parent} majeur (${c.roman})`,
    },
    {
      id: 'mode-name',
      label: 'Degré → mode',
      instrument,
      icon,
      hint: 'Une tonalité majeure et une de ses notes : quel mode commence là ? Il faut d’abord trouver le degré (E est le IV de B → lydien).',
      unit: 'carte',
      cards: MODE_NAME_CARDS,
      section: 'modeNameStats',
      Prompt: ModeNamePrompt,
      question: 'Quel mode ?',
      answer: MODE_ANSWER,
      matches: (sel, card) => sel.mode === card.mode,
      formatCard: (c) => `${c.parent} majeur, sur ${c.tonic} : ${c.mode} (${c.roman})`,
    },
    {
      id: 'degree-to-chord',
      label: 'Degré → accord',
      instrument,
      icon,
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
      instrument,
      icon,
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
      instrument,
      icon,
      hint: 'Une tonalité majeure et un accord, triade ou tétrade : quel degré ? Comme en lisant la grille d’un morceau.',
      unit: 'carte',
      cards: [...DEGREE_CARDS, ...DEGREE_SEVENTH_CARDS.map((c) => ({ ...c, tier: c.tier + 1 }))],
      section: 'chordToDegreeStats',
      Prompt: ChordToDegreePrompt,
      question: 'Quel degré ?',
      answer: DEGREE_ANSWER,
      matches: (sel, card) => sel.roman === card.roman,
      formatCard: degreeLabel,
    },
  ],
}
