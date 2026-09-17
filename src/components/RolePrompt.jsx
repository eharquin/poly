import ChordDiagram from './ChordDiagram.jsx'
import PianoDiagram from './PianoDiagram.jsx'

/** Grille nommée, une corde marquée : quel rôle joue cette note ? */
export function GuitarRolePrompt({ card, label }) {
  return (
    <>
      <ChordDiagram card={card} label={label} highlightString={card.string} />
      <p className="text-prompt">
        <strong>{card.name}</strong> — la note marquée est la…
      </p>
    </>
  )
}

/** Clavier sans nom, une touche marquée : quel rôle joue cette note ? */
export function PianoRolePrompt({ card, label }) {
  return (
    <>
      <PianoDiagram card={card} label={label} highlightKey={card.highlight} />
      <p className="text-prompt">La note marquée est la…</p>
    </>
  )
}
