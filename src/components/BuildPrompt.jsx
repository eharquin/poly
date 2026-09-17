import ChordDiagram from './ChordDiagram.jsx'
import PianoDiagram from './PianoDiagram.jsx'

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

/** « Construis Am7 » ; une fois trouvé, la grille de la banque est montrée comme une position possible. */
export function GuitarBuildPrompt({ card, label, solved }) {
  return (
    <>
      <p className="text-prompt">
        Construis <strong className="mono">{card.name}</strong>
      </p>
      {solved ? (
        <>
          <ChordDiagram card={card} label={label} />
          <p className="muted small center">Une position possible, parmi d'autres.</p>
        </>
      ) : (
        <p className="muted small center">N'importe quelle position : seules les notes comptent (la quinte est omissible dans une tétrade).</p>
      )}
    </>
  )
}
