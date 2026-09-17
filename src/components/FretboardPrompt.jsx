import FretboardDiagram from './FretboardDiagram.jsx'

/** Une position marquée : quelle note ? */
export function FretboardNotePrompt({ card, label }) {
  return (
    <>
      <FretboardDiagram marks={[card]} label={label} />
      <p className="text-prompt">
        Quelle note ? <span className="muted small">({card.stringLabel})</span>
      </p>
    </>
  )
}

/** « Sur la corde de La, où est le C ? » ; une fois trouvé, toutes les positions. */
export function FretboardFindPrompt({ card, label, solved }) {
  return (
    <>
      <p className="text-prompt">
        Sur la corde <strong>{card.stringLabel}</strong>, où est le <strong className="mono">{card.name}</strong> ?
      </p>
      {solved && <FretboardDiagram marks={card.frets.map((fret) => ({ string: card.string, fret }))} label={label} />}
    </>
  )
}
