import ChordDiagram from './ChordDiagram.jsx'
import FretboardDiagram from './FretboardDiagram.jsx'

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

/** Un point de départ sur le manche : où est l'intervalle demandé, sur une corde plus aiguë ? */
export function FretIntervalPrompt({ card, label, solved }) {
  return (
    <>
      {solved && <FretboardDiagram marks={[...card.marks, ...card.targets]} label={label} />}
      <p className="text-prompt">
        Une <strong>{card.interval}</strong> au-dessus de la note marquée
        <br />
        <span className="muted small">sur une corde plus aiguë, n'importe laquelle</span>
      </p>
    </>
  )
}

/** Une forme barrée sans son nom : quelle forme CAGED ? */
export function CagedPrompt({ card, label }) {
  return (
    <>
      <ChordDiagram card={card} label={label} />
      <p className="text-prompt">Quelle forme ?</p>
    </>
  )
}
