import PianoDiagram from './PianoDiagram.jsx'

/** Clavier sans nom, une touche marquée : quel rôle joue cette note ? */
export function PianoRolePrompt({ card, label }) {
  return (
    <>
      <PianoDiagram card={card} label={label} highlightKey={card.highlight} />
      <p className="text-prompt">La note marquée est la…</p>
    </>
  )
}

/** « Construis Dm7 » ; une fois trouvé, la position fondamentale est montrée. */
export function PianoBuildPrompt({ card, label, solved }) {
  return (
    <>
      <p className="text-prompt">
        Construis <strong className="mono">{card.name}</strong>
      </p>
      {solved ? <PianoDiagram card={card} label={label} /> : <p className="muted small center">N'importe quel renversement ou octave, sans doublure obligatoire.</p>}
    </>
  )
}
