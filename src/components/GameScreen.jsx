import { useEffect, useState } from 'react'
import CHORDS from '../chords.json'
import { EMPTY_SELECTION, formatChordName, isComplete, sameChord } from '../lib/chordName.js'
import { BOXES, applyAnswers, deckSummary, pickChord, statOf } from '../lib/leitner.js'
import { recordChordAnswers } from '../lib/ops.js'
import { clearGameDraft, loadGameDraft, saveGameDraft } from '../lib/storage.js'
import ChordDiagram from './ChordDiagram.jsx'
import ChordSelector from './ChordSelector.jsx'

const byId = Object.fromEntries(CHORDS.map((c) => [c.id, c]))

/**
 * Jeu « nommer l'accord » : une grille, un sélecteur, Valider jusqu'à la
 * bonne réponse. Chaque question résolue s'ajoute aux réponses de la partie,
 * prises en compte par Leitner pour les tirages suivants, et le tout part
 * dans data.json en un seul commit à « Terminer ». La partie en cours survit
 * à un verrouillage d'écran via le brouillon local.
 */
export default function GameScreen({ data, onCommit }) {
  const [game, setGame] = useState(loadGameDraft)
  const [selection, setSelection] = useState(EMPTY_SELECTION)
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (game) saveGameDraft(game)
    else clearGameDraft()
  }, [game])

  // Stats effectives = stats commitées + réponses de la partie en cours.
  const answers = game?.answers ?? []
  const stats = applyAnswers(data.chordStats, answers)
  const summary = deckSummary(CHORDS, stats)

  const chord = game?.current ? byId[game.current.chordId] : null
  const answered = answers.length

  const show = (exclude) => {
    const next = pickChord(CHORDS, stats, { exclude })
    setGame((g) => ({ ...(g ?? { answers: [] }), current: { chordId: next.id, shownAt: Date.now(), attempts: 0 } }))
    setSelection(EMPTY_SELECTION)
    setFeedback(null)
  }

  const start = () => {
    setNotice(null)
    show(null)
  }

  const validate = () => {
    if (!isComplete(selection) || !chord) return
    const attempts = game.current.attempts + 1
    if (sameChord(selection, chord)) {
      const answer = { chordId: chord.id, attempts, timeMs: Date.now() - game.current.shownAt, at: new Date().toISOString() }
      setGame((g) => ({ ...g, answers: [...g.answers, answer], current: { ...g.current, attempts } }))
      setFeedback({ correct: true, name: formatChordName(chord), attempts, timeMs: answer.timeMs })
    } else {
      setGame((g) => ({ ...g, current: { ...g.current, attempts } }))
      setFeedback({ correct: false, name: formatChordName(selection) })
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
      const { queued } = await onCommit(recordChordAnswers(answers), `Accords : ${answers.length} réponse${answers.length > 1 ? 's' : ''}`)
      setGame(null)
      setFeedback(null)
      setNotice({ ok: true, msg: `${answers.length} accord${answers.length > 1 ? 's' : ''} enregistré${answers.length > 1 ? 's' : ''}${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <h2>Accords</h2>

      <section className="card">
        <h3>Nommer l'accord</h3>
        <p className="muted small">
          {summary.seen}/{summary.total} accords vus · {summary.due} à revoir
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

      {game && chord && (
        <section className="card">
          <div className="line-head">
            <span className="muted small">{answered} trouvé{answered > 1 ? 's' : ''}</span>
            <span className="muted small mono">essai {game.current.attempts + (feedback?.correct ? 0 : 1)}</span>
          </div>

          <ChordDiagram chord={chord} label={feedback?.correct ? feedback.name : 'Quel accord ?'} />

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
              <ChordSelector value={selection} onChange={setSelection} />
            </>
          )}

          <div className="actions">
            {feedback?.correct ? (
              <button type="button" className="btn primary" onClick={() => show(chord.id)}>
                Suivant
              </button>
            ) : (
              <button type="button" className="btn primary" onClick={validate} disabled={!isComplete(selection)}>
                Valider
              </button>
            )}
          </div>
        </section>
      )}

      {game && (
        <div className="actions">
          <button type="button" className="btn secondary" onClick={finish} disabled={saving}>
            {saving ? 'Commit en cours…' : answered ? `Terminer (${answered} accord${answered > 1 ? 's' : ''})` : 'Abandonner'}
          </button>
        </div>
      )}

      <ChordStats stats={stats} />
    </div>
  )
}

/** Accords vus, les plus difficiles d'abord : boîte, taux de réussite, temps moyen. */
function ChordStats({ stats }) {
  const rows = CHORDS.map((c) => ({ chord: c, stat: statOf(stats, c.id) }))
    .filter((r) => r.stat.attempts > 0)
    .map((r) => ({ ...r, rate: r.stat.successes / r.stat.attempts }))
    .sort((a, b) => a.rate - b.rate || a.stat.box - b.stat.box)
  if (!rows.length) return null
  return (
    <details className="card">
      <summary>Stats par accord ({rows.length})</summary>
      <table className="table">
        <thead>
          <tr>
            <th>Accord</th>
            <th className="num">Boîte</th>
            <th className="num">Réussite</th>
            <th className="num">Temps</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ chord, stat, rate }) => (
            <tr key={chord.id}>
              <td>{formatChordName(chord)}</td>
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
