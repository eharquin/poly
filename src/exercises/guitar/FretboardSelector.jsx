import FretboardDiagram from './FretboardDiagram.jsx'

/**
 * Manche cliquable, limité aux cordes de la carte (`activeStrings`, ou sa
 * seule `string`) ; la sélection est une position { string, fret }. Les
 * `marks` de la carte (point de départ) restent affichées.
 */
export default function FretboardSelector({ value, onChange, card }) {
  const active = card.activeStrings ?? [card.string]
  const marks = [...(card.marks ?? []), ...(value.fret === null ? [] : [{ string: value.string, fret: value.fret }])]
  const label = value.fret === null ? '…' : `${['6e', '5e', '4e', '3e', '2e', '1re'][value.string]} corde, ${value.fret === 0 ? 'à vide' : `case ${value.fret}`}`
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {label}
      </div>
      <FretboardDiagram marks={marks} label="Manche : tape la case" onSelect={(string, fret) => onChange({ string, fret })} activeStrings={active} />
    </div>
  )
}
