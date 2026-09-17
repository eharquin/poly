// Exercices guitare : grilles d'accords et manche.

import { NOTE_NAMES_BOTH, QUALITY_NAMES, formatChordName, pitchClassName, rootPitchClass, sameChord } from '../../lib/chordName.js'
import { BUILDABLE, QUALITY_TIER, STANDARD_TUNING, chordTonesWithRoles, fretsPitchClasses, soundsLike } from '../../lib/tones.js'
import { STRING_LABELS } from './fretboard.js'

// Corde la plus grave qui sonne la fondamentale.
const rootString = (c) => c.frets.findIndex((f, s) => f !== null && (STANDARD_TUNING[s] + f) % 12 === rootPitchClass(c.root, c.acc))
const explainChord = (c) => [
  { label: 'Notes', value: chordTonesWithRoles(c), mono: true },
  { label: 'Qualité', value: QUALITY_NAMES[c.qual] },
  { label: 'Fondamentale', value: STRING_LABELS[rootString(c)] },
]
import { CHORD_ANSWER, ROLE_ANSWER, sameRole } from '../common/answers.js'
import { roleLabel } from '../common/roles.js'
import ChordDiagram from './ChordDiagram.jsx'
import ChordGridSelector from './ChordGridSelector.jsx'
import CHORDS from './chords.json' with { type: 'json' }
import FretboardSelector from './FretboardSelector.jsx'
import { FRETBOARD_FIND_CARDS, FRETBOARD_NOTE_CARDS, FRET_INTERVAL_CARDS } from './fretboard.js'
import { CAGED_CARDS } from './caged.js'
import FormSelector from './FormSelector.jsx'
import NoteSelector from './NoteSelector.jsx'
import { CagedPrompt, FretIntervalPrompt, FretboardFindPrompt, FretboardNotePrompt, GuitarBuildPrompt, GuitarRolePrompt } from './prompts.jsx'
import { GUITAR_ROLE_CARDS } from './roles.js'

const FRETS_ANSWER = {
  Selector: ChordGridSelector,
  empty: { frets: [null, null, null, null, null, null] },
  isComplete: (s) => s.frets.filter((f) => f !== null).length >= 3,
  format: (s) => fretsPitchClasses(s.frets).map(pitchClassName).join(' · '),
}
const NOTE_ANSWER = { Selector: NoteSelector, empty: { pc: null }, isComplete: (s) => s.pc !== null, format: (s) => NOTE_NAMES_BOTH[s.pc] }
const FRET_ANSWER = { Selector: FretboardSelector, empty: { string: null, fret: null }, isComplete: (s) => s.fret !== null, format: (s) => (s.fret === 0 ? 'à vide' : `case ${s.fret}`) }
const POSITION_ANSWER = { ...FRET_ANSWER, format: (s) => `${STRING_LABELS[s.string]}, ${s.fret === 0 ? 'à vide' : `case ${s.fret}`}` }
const FORM_ANSWER = { Selector: FormSelector, empty: { form: null }, isComplete: (s) => Boolean(s.form), format: (s) => `forme ${s.form}` }
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
      explain: explainChord,
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
      explain: (c) => [{ label: 'Notes', value: chordTonesWithRoles(c), mono: true }, { label: 'Qualité', value: QUALITY_NAMES[c.qual] }],
    },
    {
      id: 'fret-interval',
      label: 'Intervalle sur le manche',
      instrument,
      icon,
      hint: 'Une case marquée, un intervalle : tape la note sur une corde plus aiguë. Les formes d’intervalles, pour construire n’importe quel accord.',
      unit: 'position',
      cards: FRET_INTERVAL_CARDS,
      section: 'fretIntervalStats',
      Prompt: FretIntervalPrompt,
      question: 'Quelle case ?',
      answer: POSITION_ANSWER,
      matches: (sel, card) => card.targets.some((t) => t.string === sel.string && t.fret === sel.fret),
      formatCard: (c) => `${c.interval} au-dessus de ${c.fromName} : ${c.name}`,
      explain: (c) => [
        { label: 'Demi-tons', value: `${c.semitones}` },
        { label: 'Corde suivante', value: `${c.semitones - 5 >= 0 ? '+' : ''}${c.semitones - 5} case${Math.abs(c.semitones - 5) > 1 ? 's' : ''} (${c.semitones - 4 >= 0 ? '+' : ''}${c.semitones - 4} entre Sol et Si)` },
      ],
    },
    {
      id: 'caged',
      label: 'Formes CAGED',
      instrument,
      icon,
      hint: 'Un barré sans son nom : quelle forme d’accord ouvert est déplacée ? C, A, G, E ou D — la corde de la fondamentale trahit la forme.',
      unit: 'forme',
      cards: CAGED_CARDS,
      section: 'cagedStats',
      Prompt: CagedPrompt,
      question: 'Quelle forme ?',
      answer: FORM_ANSWER,
      matches: (sel, card) => sel.form === card.form,
      formatCard: (c) => `${c.formLabel} en case ${c.baseFret} : ${c.name}`,
      explain: (c) => [
        { label: 'Fondamentale', value: STRING_LABELS[c.rootString] },
        { label: 'Accord', value: `${c.name} (${QUALITY_NAMES[c.qual]})` },
      ],
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
      explain: (c) => [{ label: 'Notes', value: chordTonesWithRoles(c.chord), mono: true }, { label: 'Cette corde', value: `${c.note}, ${roleLabel(c.role).toLowerCase()} de ${c.name}` }],
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
      explain: (c) => [
        { label: 'Corde à vide', value: pitchClassName(STANDARD_TUNING[c.string]) },
        { label: 'Même note', value: c.others.length ? c.others.map(fretLabel).join(', ') : 'nulle part ailleurs sur cette corde' },
      ],
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
      explain: (c) => [{ label: 'Corde à vide', value: pitchClassName(STANDARD_TUNING[c.string]) }, { label: 'Demi-tons', value: `${c.frets[0]} depuis la corde à vide` }],
    },
  ],
}
