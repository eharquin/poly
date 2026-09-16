import { useMemo, useState } from 'react'
import {
  DAILY_VOICE_HABIT,
  FREE_DAY,
  INSTRUMENTS,
  SECONDARY_HINT,
  VOICE_HABIT_HINT,
  instrumentLabel,
} from '../config/instruments.js'
import { FREE_SESSION, getSessionConfig, sessionLabel } from '../config/program.js'
import { daysLeftOnKey, formatDateFR, getKeyOfWeek, getRotationForDate, todayISO } from '../lib/cycle.js'
import { newSessionId, sortedSessions, upsertSession } from '../lib/ops.js'
import { getActiveTier, getBlocksForDay } from '../lib/tiers.js'
import SessionForm from './SessionForm.jsx'

export default function TodayScreen({ data, settings, onCommit }) {
  const [date, setDate] = useState(todayISO)
  const sessions = useMemo(() => sortedSessions(data.sessions), [data.sessions])
  const rotation = useMemo(() => getRotationForDate(date), [date])
  const keyOfWeek = useMemo(() => getKeyOfWeek(date, settings.cycleStart), [date, settings.cycleStart])
  const daysLeft = useMemo(() => daysLeftOnKey(date, settings.cycleStart), [date, settings.cycleStart])

  const { instrument, session: sessionType } = rotation.main
  const prescribed = Boolean(getSessionConfig(instrument, sessionType))
  const blocks = useMemo(
    () => (prescribed ? getBlocksForDay(sessions, instrument, sessionType) : []),
    [prescribed, sessions, instrument, sessionType],
  )
  const tier = useMemo(
    () => (prescribed ? getActiveTier(sessions, instrument, sessionType) : null),
    [prescribed, sessions, instrument, sessionType],
  )
  const daySessions = useMemo(() => sessions.filter((s) => s.date === date), [sessions, date])

  return (
    <div className="screen">
      <section className="banner">
        <div className="banner-main">
          <span className="banner-label">Séance du jour</span>
          <strong>{prescribed ? `${instrumentLabel(instrument)} · ${sessionLabel(instrument, sessionType)}` : FREE_DAY.label}</strong>
          <span className="muted small">
            {prescribed ? `Palier ${tier.index + 1}/${tier.total} · ${tier.blocksAtCap}/${tier.tempoBlocks} blocs au cap` : FREE_DAY.hint}
          </span>
        </div>
        <div className="banner-key">
          <span className="banner-label">Tonalité</span>
          <strong>{keyOfWeek}</strong>
          <span className="muted small">{settings.cycleStart ? `change dans ${daysLeft} j` : 'à configurer'}</span>
        </div>
      </section>

      <div className="session-head">
        <input type="date" className="date-input" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {prescribed && (
        <SessionForm
          key={`${date}-${instrument}-${sessionType}`}
          date={date}
          instrument={instrument}
          sessionType={sessionType}
          blocks={blocks}
          sessions={sessions}
          settings={settings}
          onCommit={onCommit}
        />
      )}

      <FreeLog
        date={date}
        settings={settings}
        onCommit={onCommit}
        defaultInstrument={rotation.secondary ?? INSTRUMENTS[0].id}
        secondary={rotation.secondary}
      />

      <section className="card">
        <h3>Séances du {formatDateFR(date)}</h3>
        {daySessions.length === 0 ? (
          <p className="muted small">Rien d'enregistré pour ce jour.</p>
        ) : (
          <ul className="session-lines">
            {daySessions.map((s) => (
              <li key={s.id}>
                <span className="line-head">
                  <strong>
                    {instrumentLabel(s.instrument)} · {sessionLabel(s.instrument, s.sessionType)}
                  </strong>
                  <span className="muted small">
                    {s.sessionType === 'drill'
                      ? `${s.blocks.length} carte${s.blocks.length > 1 ? 's' : ''} · ${s.blocks.filter((b) => b.correct).length} justes`
                      : s.blocks?.length
                        ? `${s.blocks.length} bloc${s.blocks.length > 1 ? 's' : ''}`
                        : 'libre'}
                  </span>
                </span>
                {s.note && <span className="muted small">{s.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/**
 * Tout ce qui n'est pas prescrit : touche secondaire du soir, habitude voix,
 * composition du dimanche. Enregistré pour la fraîcheur et l'historique,
 * jamais compté dans l'adhérence.
 */
function FreeLog({ date, settings, onCommit, defaultInstrument, secondary }) {
  const [instrument, setInstrument] = useState(defaultInstrument)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  const save = async () => {
    setSaving(true)
    setNotice(null)
    const session = {
      id: newSessionId(),
      date,
      instrument,
      sessionType: FREE_SESSION.id,
      key_of_week: getKeyOfWeek(date, settings.cycleStart),
      blocks: [],
    }
    if (note.trim()) session.note = note.trim()
    try {
      const { queued } = await onCommit(upsertSession(session), `Séance ${date} - ${instrument} (${FREE_SESSION.id})`)
      setNote('')
      setNotice({ ok: true, msg: `${instrumentLabel(instrument)} enregistré${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card">
      <h3>Hors programme</h3>
      <ul className="suggestions">
        {secondary && (
          <li>
            <span className="tag">Touche</span> {instrumentLabel(secondary)} — <span className="muted">{SECONDARY_HINT}</span>
          </li>
        )}
        {DAILY_VOICE_HABIT && (
          <li>
            <span className="tag tag-habit">Quotidien</span> Voix — <span className="muted">{VOICE_HABIT_HINT}</span>
          </li>
        )}
      </ul>

      <div className="pills" role="group" aria-label="Instrument">
        {INSTRUMENTS.map((i) => (
          <button
            key={i.id}
            type="button"
            className={`pill ${instrument === i.id ? 'active' : ''}`}
            onClick={() => setInstrument(i.id)}
          >
            {i.label}
          </button>
        ))}
      </div>

      <input className="block-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (facultatif)" />

      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      <div className="actions">
        <button type="button" className="btn secondary" onClick={save} disabled={saving}>
          {saving ? 'Enregistrement…' : 'Enregistrer une séance libre'}
        </button>
      </div>
    </section>
  )
}
