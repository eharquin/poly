import { useEffect, useMemo, useState } from 'react'
import { getKeyOfWeek, todayISO } from '../lib/cycle.js'
import { CHORD_NAME_DRILL, DRILL_SESSION_TYPE } from '../lib/drills.js'
import { LEITNER_BOXES, buildQueue, deckState, deckSummary } from '../lib/leitner.js'
import { newSessionId, upsertSession } from '../lib/ops.js'
import { clearDrillDraft, loadDrillDraft, saveDrillDraft } from '../lib/storage.js'
import { QUALITIES, QUALITY_IDS, noteNameBoth } from '../lib/theory.js'
import ChordDiagram from './ChordDiagram.jsx'

const ROOTS = Array.from({ length: 12 }, (_, pc) => pc)

/**
 * Écran Exercices : une série de cartes dues + quelques nouvelles, jugée par
 * le drill, enregistrée d'un bloc à la fin. La série en cours survit à un
 * verrouillage d'écran via le brouillon local.
 */
export default function DrillScreen({ data, settings, onCommit }) {
  const drill = CHORD_NAME_DRILL
  const today = todayISO()
  const keyOfWeek = getKeyOfWeek(today, settings.cycleStart)
  const state = useMemo(() => deckState(data.sessions, drill.id), [data.sessions, drill.id])
  const summary = useMemo(() => deckSummary(state, drill.cards, today), [state, drill.cards, today])
  const pending = useMemo(() => buildQueue(state, drill.cards, today), [state, drill.cards, today])

  const [run, setRun] = useState(() => {
    const draft = loadDrillDraft()
    return draft?.date === today && draft.drillId === drill.id ? draft : null
  })
  const [answer, setAnswer] = useState({ root: null, quality: null })
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  useEffect(() => {
    if (run) saveDrillDraft(run)
    else clearDrillDraft()
  }, [run])

  const start = () => {
    setNotice(null)
    setRun({ date: today, drillId: drill.id, queue: pending, index: 0, answers: [], retries: [] })
    setAnswer({ root: null, quality: null })
    setResult(null)
  }

  const cardId = run?.queue[run.index] ?? null
  const card = cardId ? drill.getCard(cardId) : null
  const prompt = card ? drill.prompt(card) : null
  const isRetry = card && run.answers.some((a) => a.cardId === card.id)
  const finished = run && run.index >= run.queue.length && run.retries.length === 0
  const answered = run?.answers.length ?? 0
  const correctCount = run?.answers.filter((a) => a.correct).length ?? 0

  const validate = () => {
    if (answer.root === null || !answer.quality) return
    setResult(drill.evaluate(card, answer, keyOfWeek))
  }

  const next = () => {
    setRun((r) => {
      const answers = isRetry ? r.answers : [...r.answers, { cardId: card.id, correct: result.correct, boxLeitner: state.get(card.id)?.box ?? 0 }]
      // Une carte ratée revient en fin de série, sans être comptée deux fois.
      const retries = result.correct || isRetry ? r.retries : [...r.retries, card.id]
      let queue = r.queue
      let index = r.index + 1
      let rest = retries
      if (index >= queue.length && retries.length) {
        queue = [...queue, ...retries]
        rest = []
      }
      return { ...r, queue, index, answers, retries: rest }
    })
    setAnswer({ root: null, quality: null })
    setResult(null)
  }

  const save = async () => {
    setSaving(true)
    setNotice(null)
    const session = {
      id: newSessionId(),
      date: today,
      instrument: drill.instrument,
      sessionType: DRILL_SESSION_TYPE,
      key_of_week: keyOfWeek,
      blocks: run.answers.map((a) => ({ drillId: drill.id, ...a })),
    }
    try {
      const { queued } = await onCommit(upsertSession(session), `Séance ${today} - ${drill.instrument} (${DRILL_SESSION_TYPE})`)
      setRun(null)
      setResult(null)
      setNotice({
        ok: true,
        msg: `${run.answers.length} carte${run.answers.length > 1 ? 's' : ''} enregistrée${run.answers.length > 1 ? 's' : ''}${queued ? ' (hors-ligne, en attente)' : ' ✓'}`,
      })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="screen">
      <h2>Exercices</h2>

      <section className="card">
        <h3>{drill.label}</h3>
        <p className="muted small">
          {summary.seen}/{summary.total} cartes vues · {summary.dueToday} à revoir aujourd'hui
          {summary.dueTomorrow ? ` · ${summary.dueTomorrow} demain` : ''}
        </p>
        <div className="boxes" aria-label="Répartition par boîte">
          {Array.from({ length: LEITNER_BOXES + 1 }, (_, b) => (
            <span key={b} className={`box ${b === 0 ? 'box-new' : ''}`} title={b === 0 ? 'jamais vues' : `boîte ${b}`}>
              <span className="box-count mono">{summary.byBox[b]}</span>
              <span className="box-label">{b === 0 ? 'new' : `B${b}`}</span>
            </span>
          ))}
        </div>
        {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}
        {!run && (
          <div className="actions">
            <button type="button" className="btn primary" onClick={start} disabled={pending.length === 0}>
              {pending.length === 0 ? 'Rien à revoir aujourd’hui' : `Commencer (${pending.length} cartes)`}
            </button>
          </div>
        )}
      </section>

      {run && card && (
        <section className="card drill">
          <div className="line-head">
            <span className="muted small">
              Carte {Math.min(run.index + 1, run.queue.length)} / {run.queue.length}
              {isRetry ? ' · reprise' : ''}
            </span>
            <span className="muted small mono">{correctCount}/{answered} justes</span>
          </div>

          <div className="drill-prompt">
            <ChordDiagram
              frets={prompt.frets}
              baseFret={prompt.baseFret}
              highlightString={result ? result.feedback.rootString?.index ?? null : null}
              label={result ? result.expected.name : prompt.question}
            />
            {!result && <p className="drill-question">{prompt.question}</p>}
          </div>

          {!result ? (
            <>
              <span className="field-label">Fondamentale</span>
              <div className="chips roots">
                {ROOTS.map((pc) => (
                  <button
                    key={pc}
                    type="button"
                    className={`chip ${answer.root === pc ? 'active' : ''}`}
                    onClick={() => setAnswer((a) => ({ ...a, root: pc }))}
                  >
                    {noteNameBoth(pc)}
                  </button>
                ))}
              </div>
              <span className="field-label">Qualité</span>
              <div className="chips">
                {QUALITY_IDS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`chip ${answer.quality === q ? 'active' : ''}`}
                    onClick={() => setAnswer((a) => ({ ...a, quality: q }))}
                  >
                    {QUALITIES[q].label || 'maj'}
                  </button>
                ))}
              </div>
              <div className="actions">
                <button type="button" className="btn primary" onClick={validate} disabled={answer.root === null || !answer.quality}>
                  Valider
                </button>
              </div>
            </>
          ) : (
            <div className={`verdict ${result.correct ? 'right' : 'wrong'}`}>
              <div className="verdict-head">
                <span className="verdict-icon" aria-hidden="true">
                  {result.correct ? '✓' : '✕'}
                </span>
                <div>
                  <strong>{result.expected.name}</strong>
                  <span className="muted small"> · {result.feedback.qualityName}</span>
                  {!result.correct && (
                    <div className="muted small">
                      Tu as répondu {result.given.name}
                      {result.rootCorrect ? ' — fondamentale juste, qualité fausse' : result.qualityCorrect ? ' — qualité juste, fondamentale fausse' : ''}
                    </div>
                  )}
                </div>
              </div>
              <ul className="facts">
                <li>
                  <span className="muted">Notes</span> {result.feedback.tones.join(' · ')}
                </li>
                {result.feedback.rootString && (
                  <li>
                    <span className="muted">Fondamentale</span> {result.feedback.rootString.label}
                  </li>
                )}
                <li>
                  <span className="muted">Tonalité {keyOfWeek}</span>{' '}
                  {result.feedback.degree ? `degré ${result.feedback.degree.roman}` : 'hors tonalité de la semaine'}
                </li>
                <li>
                  <span className="muted">Forme</span> {result.feedback.form} · palier {result.feedback.tier}
                </li>
              </ul>
              <div className="actions">
                <button type="button" className="btn primary" onClick={next}>
                  Suivant
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {run && (finished || !card) && (
        <section className="card">
          <h3>Série terminée</h3>
          <p>
            <strong>{correctCount}</strong> juste{correctCount > 1 ? 's' : ''} sur {answered}.
          </p>
        </section>
      )}

      {run && answered > 0 && (
        <div className="actions">
          <button type="button" className={`btn ${finished || !card ? 'primary' : 'secondary'}`} onClick={save} disabled={saving}>
            {saving ? 'Commit en cours…' : finished || !card ? 'Enregistrer' : `Terminer maintenant (${answered} carte${answered > 1 ? 's' : ''})`}
          </button>
        </div>
      )}
    </div>
  )
}
