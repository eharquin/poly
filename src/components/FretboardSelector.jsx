import FretboardDiagram from './FretboardDiagram.jsx'

/** Manche cliquable, limité à la corde de la carte ; la sélection est une case. */
export default function FretboardSelector({ value, onChange, card }) {
  const marks = value.fret === null ? [] : [{ string: card.string, fret: value.fret }]
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.fret === null ? '…' : value.fret === 0 ? 'à vide' : `case ${value.fret}`}
      </div>
      <FretboardDiagram marks={marks} label="Manche : tape la case" onSelect={(_, fret) => onChange({ fret })} activeString={card.string} />
    </div>
  )
}
