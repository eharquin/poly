import { EXERCISES } from '../exercises.js'
import { deckSummary } from '../lib/leitner.js'

/** Liste des exercices, avec l'état du paquet de chacun. */
export default function ExercisesScreen({ data, onOpen }) {
  return (
    <div className="screen">
      <h2>Exercices</h2>
      {EXERCISES.map((ex) => {
        const s = deckSummary(ex.chords, data[ex.section])
        return (
          <section key={ex.id} className="card">
            <div className="line-head">
              <h3>
                {ex.icon} {ex.label} · {ex.instrument}
              </h3>
              <span className="muted small mono">{s.due} à revoir</span>
            </div>
            <p className="muted small">{ex.hint}</p>
            <p className="muted small">
              {s.seen}/{s.total} accords vus
            </p>
            <div className="actions">
              <button type="button" className="btn primary" onClick={() => onOpen(ex.id)}>
                Ouvrir
              </button>
            </div>
          </section>
        )
      })}
    </div>
  )
}
