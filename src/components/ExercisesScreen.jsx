import { CATEGORIES } from '../exercises/index.js'
import { deckSummary } from '../lib/leitner.js'

/** Les exercices par catégorie, avec l'état du paquet de chacun. */
export default function ExercisesScreen({ data, onOpen }) {
  return (
    <div className="screen">
      <h2>Exercices</h2>
      {CATEGORIES.map((cat) => (
        <section key={cat.id} className="category">
          <h3 className="category-title">
            {cat.icon} {cat.label}
          </h3>
          {cat.exercises.map((ex) => {
            const s = deckSummary(ex.cards, data[ex.section])
            return (
              <button key={ex.id} type="button" className="card exercise" onClick={() => onOpen(ex.id)}>
                <span className="line-head">
                  <strong>{ex.label}</strong>
                  <span className="muted small mono">{s.due} à revoir</span>
                </span>
                <span className="muted small">{ex.hint}</span>
                <span className="muted small">
                  {s.seen}/{s.total} {ex.unit}s vu{ex.unit === 'accord' ? '' : 'e'}s
                </span>
              </button>
            )
          })}
        </section>
      ))}
    </div>
  )
}
