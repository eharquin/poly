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
