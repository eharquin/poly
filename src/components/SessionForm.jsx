import { useEffect, useState } from 'react'
import { DURATION_CHIPS, INSTRUMENTS } from '../config/instruments.js'
import { formatDateFR, getKeyOfWeek } from '../lib/cycle.js'
import { newSessionId, upsertSession } from '../lib/ops.js'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage.js'

/** Log rapide d'une séance : instrument, durée, note. */
export default function SessionForm({ date, settings, onCommit, suggested }) {
  // Brouillon relu une seule fois, au montage, et seulement s'il porte sur ce jour.
  const [draft] = useState(() => {
    const d = loadDraft()
    return d && d.date === date ? d : {}
  })
  // Tant que l'utilisateur n'a pas choisi d'instrument, on suit la suggestion
  // du jour — elle change donc si l'on recule la date.
  const [picked, setPicked] = useState(() => draft.instrument ?? null)
  const instrument = picked ?? suggested ?? INSTRUMENTS[0].id
  const [minutes, setMinutes] = useState(() => draft.minutes ?? '')
  const [note, setNote] = useState(() => draft.note ?? '')
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  // Brouillon : une saisie interrompue (appel, verrouillage) n'est pas perdue.
  useEffect(() => {
    if (minutes === '' && !note) clearDraft()
    else saveDraft({ date, instrument, minutes, note })
  }, [date, instrument, minutes, note])

  const min = Number(minutes)
  const valid = Number.isFinite(min) && min > 0

  const save = async () => {
    setSaving(true)
    setNotice(null)
    const session = {
      id: newSessionId(),
      date,
      instrument,
      minutes: Math.round(min),
      key_of_week: getKeyOfWeek(date, settings.cycleStart),
    }
    if (note.trim()) session.note = note.trim()
    try {
      const { queued } = await onCommit(upsertSession(session), `Séance ${date} - ${instrument}`)
      clearDraft()
      setMinutes('')
      setNote('')
      setNotice(
        queued
          ? { ok: true, msg: `Hors-ligne : séance du ${formatDateFR(date)} enregistrée, elle sera commitée au retour du réseau.` }
          : { ok: true, msg: `Séance du ${formatDateFR(date)} commitée sur GitHub ✓` },
      )
    } catch (e) {
      setNotice({ ok: false, msg: `Échec de la sauvegarde : ${e.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card">
      <h3>Loguer une séance</h3>

      <div className="pills" role="group" aria-label="Instrument">
        {INSTRUMENTS.map((i) => (
          <button
            key={i.id}
            type="button"
            className={`pill ${instrument === i.id ? 'active' : ''}`}
            onClick={() => setPicked(i.id)}
          >
            {i.label}
          </button>
        ))}
      </div>

      <h4>Durée</h4>
      <div className="chips">
        {DURATION_CHIPS.map((d) => (
          <button
            key={d}
            type="button"
            className={`chip ${min === d ? 'active' : ''}`}
            onClick={() => setMinutes(min === d ? '' : d)}
          >
            {d} min
          </button>
        ))}
        <input
          className="chip chip-input"
          type="number"
          inputMode="numeric"
          min="1"
          max="600"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value === '' ? '' : Number(e.target.value))}
          placeholder="min"
          aria-label="Durée libre en minutes"
        />
      </div>

      <label className="field">
        <span>Note (ce qui a été travaillé, ressenti, blocage…)</span>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex. gammes Sol majeur + cadence ii-V-I"
        />
      </label>

      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      <div className="actions">
        <button type="button" className="btn primary" onClick={save} disabled={!valid || saving}>
          {saving ? 'Commit en cours…' : 'Enregistrer'}
        </button>
      </div>
    </section>
  )
}
