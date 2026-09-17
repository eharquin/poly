import { useEffect, useState } from 'react'
import { BOXES, applyAnswers, deckSummary, pickChord, statOf } from '../lib/leitner.js'
import { recordAnswers } from '../lib/ops.js'
import { clearGameDraft, loadGameDraft, saveGameDraft } from '../lib/storage.js'

const plural = (n, unit) => `${n} ${unit}${n > 1 ? 's' : ''}`

/**
 * Une partie d'un exercice : son énoncé (diagramme ou texte), son sélecteur,
 * Valider jusqu'à la bonne réponse. Chaque question résolue s'ajoute aux
 * réponses de la partie, prises en compte par Leitner pour les tirages
 * suivants, et le tout part dans data.json en un seul commit à « Terminer ».
 * La partie en cours survit à un verrouillage d'écran via le brouillon local
 * (propre à l'exercice).
 */
export default function GameScreen({ exercise, data, onCommit, onBack }) {
  const { cards, section, Prompt, answer: kind, matches, formatCard, unit } = exercise
  const [game, setGame] = useState(() => {
    const draft = loadGameDraft()
    return draft?.exerciseId === exercise.id ? draft : null
  })
  const [selection, setSelection] = useState(kind.empty)
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (game) saveGameDraft(game)
    else clearGameDraft()
  }, [game])

  // Stats effectives = stats commitées + réponses de la partie en cours.
  const answers = game?.answers ?? []
  const stats = applyAnswers(data[section], answers)
  const summary = deckSummary(cards, stats)

  const card = game?.current ? cards.find((c) => c.id === game.current.chordId) : null
  const answered = answers.length

  const show = (exclude) => {
    const next = pickChord(cards, stats, { exclude })
    setGame((g) => ({ ...(g ?? { exerciseId: exercise.id, answers: [] }), current: { chordId: next.id, shownAt: Date.now(), attempts: 0 } }))
    setSelection(kind.empty)
    setFeedback(null)
  }

  const start = () => {
    setNotice(null)
    show(null)
  }

  const validate = () => {
    if (!kind.isComplete(selection) || !card) return
    const attempts = game.current.attempts + 1
    if (matches(selection, card)) {
      const answer = { chordId: card.id, attempts, timeMs: Date.now() - game.current.shownAt, at: new Date().toISOString() }
      setGame((g) => ({ ...g, answers: [...g.answers, answer], current: { ...g.current, attempts } }))
      setFeedback({ correct: true, name: formatCard(card), attempts, timeMs: answer.timeMs })
    } else {
      setGame((g) => ({ ...g, current: { ...g.current, attempts } }))
      setFeedback({ correct: false, name: kind.format(selection) })
    }
  }

  const finish = async () => {
    if (!answers.length) {
      setGame(null)
      setFeedback(null)
      return
    }
    setSaving(true)
    setNotice(null)
    try {
      const { queued } = await onCommit(recordAnswers(section, answers), `${exercise.label} (${exercise.instrument}) : ${plural(answers.length, unit)}`)
      setGame(null)
      setFeedback(null)
      setNotice({ ok: true, msg: `${plural(answers.length, unit)} enregistré${answers.length > 1 ? 's' : ''}${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <div className="line-head">
        <h2>
          {exercise.icon} {exercise.label} · {exercise.instrument}
        </h2>
        <button type="button" className="btn-link" onClick={onBack} disabled={Boolean(game)}>
          ← Exercices
        </button>
      </div>

      <section className="card">
        <p className="muted small">
          {summary.seen}/{summary.total} {unit}s vu{unit === 'accord' ? '' : 'e'}s · {summary.due} à revoir
        </p>
        <div className="boxes" aria-label="Répartition par boîte">
          {Array.from({ length: BOXES }, (_, i) => i + 1).map((b) => (
            <span key={b} className="box" title={`boîte ${b}`}>
              <span className="box-count mono">{summary.byBox[b]}</span>
              <span className="box-label">B{b}</span>
            </span>
          ))}
        </div>
        {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}
        {!game && (
          <div className="actions">
            <button type="button" className="btn primary" onClick={start}>
              Commencer
            </button>
          </div>
        )}
      </section>

      {game && card && (
        <section className="card">
          <div className="line-head">
            <span className="muted small">{answered} trouvé{answered > 1 ? 's' : ''}</span>
            <span className="muted small mono">essai {game.current.attempts + (feedback?.correct ? 0 : 1)}</span>
          </div>

          <Prompt card={card} label={feedback?.correct ? feedback.name : exercise.question} />

          {feedback?.correct ? (
            <div className="game-feedback right">
              <span className="feedback-icon" aria-hidden="true">
                ✓
              </span>
              <div>
                <strong>{feedback.name}</strong>
                <div className="muted small">
                  {feedback.attempts} essai{feedback.attempts > 1 ? 's' : ''} · {(feedback.timeMs / 1000).toFixed(1)} s
                </div>
              </div>
            </div>
          ) : (
            <>
              {feedback && (
                <div className="game-feedback wrong">
                  <span className="feedback-icon" aria-hidden="true">
                    ✕
                  </span>
                  <div>
                    Ce n'est pas <strong>{feedback.name}</strong>
                  </div>
                </div>
              )}
              <kind.Selector value={selection} onChange={setSelection} />
            </>
          )}

          <div className="actions">
            {feedback?.correct ? (
              <button type="button" className="btn primary" onClick={() => show(card.id)}>
                Suivant
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={validate} disabled={!kind.isComplete(selection)}>
                Valider
              </button>
            )}
          </div>
        </section>
      )}

      {game && (
        <div className="actions">
          <button type="button" className="btn secondary" onClick={finish} disabled={saving}>
            {saving ? 'Commit en cours…' : answered ? `Terminer (${plural(answered, unit)})` : 'Abandonner'}
          </button>
        </div>
      )}

      <CardStats cards={cards} stats={stats} formatCard={formatCard} unit={unit} />
    </div>
  )
}

/** Cartes vues, les plus difficiles d'abord : boîte, taux de réussite, temps moyen. */
function CardStats({ cards, stats, formatCard, unit }) {
  const rows = cards.map((c) => ({ card: c, stat: statOf(stats, c.id) }))
    .filter((r) => r.stat.attempts > 0)
    .map((r) => ({ ...r, rate: r.stat.successes / r.stat.attempts }))
    .sort((a, b) => a.rate - b.rate || a.stat.box - b.stat.box)
  if (!rows.length) return null
  return (
    <details className="card">
      <summary>Stats par {unit} ({rows.length})</summary>
      <table className="table">
        <thead>
          <tr>
            <th>{unit[0].toUpperCase() + unit.slice(1)}</th>
            <th className="num">Boîte</th>
            <th className="num">Réussite</th>
            <th className="num">Temps</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ card, stat, rate }) => (
            <tr key={card.id}>
              <td>{formatCard(card)}</td>
              <td className="num mono">{stat.box}</td>
              <td className={`num mono ${rate >= 0.8 ? 'status-ok' : rate >= 0.5 ? 'status-warn' : 'status-low'}`}>{Math.round(rate * 100)} %</td>
              <td className="num mono">{stat.avgTimeMs == null ? '—' : `${(stat.avgTimeMs / 1000).toFixed(1)} s`}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
