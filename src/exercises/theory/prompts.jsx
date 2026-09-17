import { formatChordName } from '../../lib/chordName.js'

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

/** « Les notes de la gamme de C# majeur ». */
export function ScalePrompt({ card }) {
  return (
    <p className="text-prompt">
      Les notes de la gamme de <strong>{card.name}</strong>
    </p>
  )
}

/** « E lydien : mode de quelle gamme majeure ? » */
export function ModeParentPrompt({ card }) {
  return (
    <p className="text-prompt">
      <strong>{card.name}</strong> : mode de quelle gamme majeure ?
    </p>
  )
}

/** « Dans B majeur, le mode qui commence sur E » */
export function ModeNamePrompt({ card }) {
  return (
    <p className="text-prompt">
      Dans <strong>{card.parent} majeur</strong>, le mode qui commence sur <strong className="mono">{card.tonic}</strong>
    </p>
  )
}

/** « De C à A » — la réponse est l'intervalle. */
export function IntervalNamePrompt({ card }) {
  return (
    <p className="text-prompt">
      De <strong className="mono">{card.fromName}</strong> à <strong className="mono">{card.toName}</strong>, en montant
    </p>
  )
}

/** « Une sixte majeure au-dessus de E » — la réponse est la note. */
export function IntervalNotePrompt({ card }) {
  return (
    <p className="text-prompt">
      Une <strong>{card.label}</strong> au-dessus de <strong className="mono">{card.fromName}</strong>
    </p>
  )
}
