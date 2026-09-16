import { useMemo, useState } from 'react'
import {
  DAILY_VOICE_HABIT,
  FREE_DAY,
  MAIN_HINT,
  SECONDARY_HINT,
  VOICE_HABIT_HINT,
  instrumentLabel,
} from '../config/instruments.js'
import { daysLeftOnKey, formatDateFR, getKeyOfWeek, getRotationForDate, todayISO } from '../lib/cycle.js'
import { computeXpForDay, minutesByInstrument, sessionsOn, XP_CAP_MINUTES } from '../lib/stats.js'
import SessionForm from './SessionForm.jsx'

export default function TodayScreen({ data, settings, onCommit }) {
  const [date, setDate] = useState(todayISO)
  const rotation = useMemo(() => getRotationForDate(date), [date])
  const keyOfWeek = useMemo(() => getKeyOfWeek(date, settings.cycleStart), [date, settings.cycleStart])
  const daysLeft = useMemo(() => daysLeftOnKey(date, settings.cycleStart), [date, settings.cycleStart])

  const daySessions = useMemo(() => sessionsOn(data.sessions, date), [data.sessions, date])
  const xp = useMemo(() => computeXpForDay(data.sessions, date), [data.sessions, date])
  const byInstrument = useMemo(() => minutesByInstrument(daySessions), [daySessions])
  const suggested = rotation.main === FREE_DAY.id ? undefined : rotation.main

  return (
    <div className="screen">
      <section className="banner">
        <div className="banner-main">
          <span className="banner-label">Suggestion du jour</span>
          {rotation.main === FREE_DAY.id ? (
            <strong>{FREE_DAY.label}</strong>
          ) : (
            <strong>{instrumentLabel(rotation.main)}</strong>
          )}
          <span className="muted small">
            {rotation.main === FREE_DAY.id ? FREE_DAY.hint : MAIN_HINT}
          </span>
        </div>
        <div className="banner-key">
          <span className="banner-label">Tonalité</span>
          <strong>{keyOfWeek}</strong>
          <span className="muted small">
            {settings.cycleStart
              ? `change dans ${daysLeft} j`
              : 'définis la date de départ du cycle'}
          </span>
        </div>
      </section>

      <ul className="suggestions">
        {rotation.secondary && (
          <li>
            <span className="tag">Touche</span> {instrumentLabel(rotation.secondary)} — <span className="muted">{SECONDARY_HINT}</span>
          </li>
        )}
        {DAILY_VOICE_HABIT && (
          <li>
            <span className="tag tag-habit">Quotidien</span> Voix — <span className="muted">{VOICE_HABIT_HINT}</span>
          </li>
        )}
      </ul>

      <div className="session-head">
        <input type="date" className="date-input" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="xp-badge">
          <strong>{xp}</strong> XP
        </div>
      </div>

      <SessionForm date={date} settings={settings} onCommit={onCommit} suggested={suggested} />

      <section className="card">
        <h3>Séances du {formatDateFR(date)}</h3>
        {daySessions.length === 0 ? (
          <p className="muted small">Rien de logué pour ce jour.</p>
        ) : (
          <ul className="session-lines">
            {daySessions.map((s) => (
              <li key={s.id}>
                <span className="line-head">
                  <strong>{instrumentLabel(s.instrument)}</strong>
                  <span className="mono">{s.minutes} min</span>
                </span>
                {s.note && <span className="muted small">{s.note}</span>}
              </li>
            ))}
          </ul>
        )}
        {Object.entries(byInstrument)
          .filter(([, min]) => min > XP_CAP_MINUTES)
          .map(([id, min]) => (
            <p key={id} className="muted small">
              {instrumentLabel(id)} : {min} min jouées, {XP_CAP_MINUTES} comptées en XP (plafond quotidien).
            </p>
          ))}
      </section>
    </div>
  )
}
