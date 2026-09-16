import { useMemo } from 'react'
import { INSTRUMENTS } from '../config/instruments.js'
import { formatDateFR } from '../lib/cycle.js'
import {
  computeLastPracticed,
  computeStreak,
  computeWeekMinutesByInstrument,
  computeXpTotal,
  levelForXp,
  totalMinutes,
} from '../lib/stats.js'

/** Couleur de série stable par position dans INSTRUMENTS. */
const seriesColor = (i) => `var(--series-${(i % 3) + 1})`

const FRESHNESS_LABEL = {
  ok: 'à jour',
  warn: 'à reprendre',
  stale: 'en train de refroidir',
  never: 'jamais logué',
}

export default function ProgressScreen({ data }) {
  const sessions = data.sessions
  const xp = useMemo(() => computeXpTotal(sessions), [sessions])
  const lvl = useMemo(() => levelForXp(xp), [xp])
  const streak = useMemo(() => computeStreak(sessions), [sessions])
  const week = useMemo(() => computeWeekMinutesByInstrument(sessions), [sessions])
  const last = useMemo(() => computeLastPracticed(sessions), [sessions])

  const weekTotal = Object.values(week).reduce((a, b) => a + b, 0)
  const scale = Math.max(...Object.values(week), 1)

  return (
    <div className="screen">
      <h2>Progression</h2>

      <section className="card">
        <div className="level-head">
          <div>
            <span className="muted small">Niveau</span>
            <div className="level-num">{lvl.level}</div>
          </div>
          <div className="level-xp">
            <strong className="mono">{xp}</strong> <span className="muted">XP</span>
            <div className="muted small mono">encore {lvl.toNext} XP pour le niveau {lvl.level + 1}</div>
          </div>
        </div>
        <div className="progress">
          <div className="progress-fill" style={{ width: `${Math.round(lvl.progress * 100)}%` }} />
        </div>
        <p className="muted small">
          1 XP par minute, plafonné à 45 min par instrument et par jour — l'alternance rapporte plus que le bourrage.
        </p>
      </section>

      <section className="card">
        <h3>Série en cours</h3>
        <div className="streak">
          <span className="streak-num">{streak}</span>
          <span className="muted">jour{streak > 1 ? 's' : ''} d'affilée</span>
        </div>
        <p className="muted small">
          {streak === 0
            ? 'Une séance aujourd’hui relance la série.'
            : 'Le jour en cours ne casse rien tant qu’il n’est pas minuit.'}
        </p>
      </section>

      <section className="card">
        <h3>7 derniers jours</h3>
        {weekTotal === 0 ? (
          <p className="muted small">Aucune minute enregistrée sur la semaine glissante.</p>
        ) : (
          <div className="bars">
            {INSTRUMENTS.map((inst, i) => {
              const minutes = week[inst.id] ?? 0
              return (
                <div className="bar-row" key={inst.id}>
                  <span className="bar-label">{inst.label}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${Math.round((minutes / scale) * 100)}%`, background: seriesColor(i) }}
                    />
                  </div>
                  <span className="bar-value mono">{minutes} min</span>
                </div>
              )
            })}
          </div>
        )}
        <p className="muted small">Total {weekTotal} min · {totalMinutes(sessions)} min depuis le début.</p>
      </section>

      <section className="card">
        <h3>Dernière pratique</h3>
        <ul className="freshness">
          {last.map((f) => (
            <li key={f.id}>
              <span>{f.label}</span>
              <span className={`freshness-value fresh-${f.status}`}>
                {f.date === null
                  ? FRESHNESS_LABEL.never
                  : f.days === 0
                    ? "aujourd'hui"
                    : `il y a ${f.days} j`}
              </span>
              <span className="muted small">{f.date ? formatDateFR(f.date) : '—'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
