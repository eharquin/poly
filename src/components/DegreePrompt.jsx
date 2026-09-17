import { formatChordName } from '../lib/chordName.js'

/** « En G majeur, l'accord (de septième) de degré V » — la réponse est l'accord. */
export function DegreeToChordPrompt({ card }) {
  return (
    <p className="text-prompt">
      En <strong>{card.key} majeur</strong>, l'accord{card.seventh ? ' de septième' : ''} de degré <strong className="mono">{card.roman}</strong>
    </p>
  )
}

/** « En G majeur : D » — la réponse est le degré. */
export function ChordToDegreePrompt({ card }) {
  return (
    <p className="text-prompt">
      En <strong>{card.key} majeur</strong> : <strong className="mono">{formatChordName(card)}</strong>
    </p>
  )
}
