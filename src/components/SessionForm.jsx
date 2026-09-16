import { useEffect, useMemo, useState } from 'react'
import { isTempoBlock, sessionLabel } from '../config/program.js'
import { formatDateFR, getKeyOfWeek } from '../lib/cycle.js'
import { newSessionId, upsertSession } from '../lib/ops.js'
import { CLEAN_PASSES_REQUIRED, TEMPO_STEP_BPM, getCurrentTempo, getNextTarget } from '../lib/progression.js'
import { clearDraft, loadDraft, saveDraft } from '../lib/storage.js'

const CLEAN_CHOICES = [0, 1, 2, 3, 4, 5]

/** Clé du brouillon : un brouillon ne vaut que pour la séance exacte du jour. */
const draftKey = (date, instrument, sessionType) => `${date}|${instrument}|${sessionType}`

/**
 * Séance prescrite du jour : un bloc par exercice du palier actif, plus les
 * blocs continus. Seuls les blocs cochés sont enregistrés.
 */
export default function SessionForm({ date, instrument, sessionType, blocks, sessions, settings, onCommit }) {
  const key = draftKey(date, instrument, sessionType)
  const [entries, setEntries] = useState(() => {
    const draft = loadDraft()
    return draft?.key === key ? draft.entries : {}
  })
  const [note, setNote] = useState(() => {
    const draft = loadDraft()
    return draft?.key === key ? (draft.note ?? '') : ''
  })
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState(null)

  // Le brouillon survit à un verrouillage d'écran en pleine séance.
  useEffect(() => {
    if (!Object.keys(entries).length && !note) clearDraft()
    else saveDraft({ key, entries, note })
  }, [key, entries, note])

  // Tempo cible du jour, calculé une fois pour toutes les séances passées.
  const targets = useMemo(() => {
    const out = {}
    for (const block of blocks) {
      if (isTempoBlock(block)) {
        out[block.id] = { target: getNextTarget(sessions, block.id), current: getCurrentTempo(sessions, block.id) }
      }
    }
    return out
  }, [blocks, sessions])

  const toggle = (block) => {
    setEntries((prev) => {
      const next = { ...prev }
      if (next[block.id]) delete next[block.id]
      else if (isTempoBlock(block)) next[block.id] = { tempoBpm: targets[block.id].target, cleanPasses: 0, note: '' }
      else next[block.id] = { note: '' }
      return next
    })
  }

  const patch = (id, fields) => setEntries((prev) => ({ ...prev, [id]: { ...prev[id], ...fields } }))

  const doneCount = Object.keys(entries).length

  const save = async () => {
    setSaving(true)
    setNotice(null)
    const session = {
      id: newSessionId(),
      date,
      instrument,
      sessionType,
      key_of_week: getKeyOfWeek(date, settings.cycleStart),
      blocks: blocks
        .filter((b) => entries[b.id])
        .map((b) => {
          const entry = entries[b.id]
          const out = { exerciseId: b.id }
          if (isTempoBlock(b)) {
            out.tempoBpm = Number(entry.tempoBpm)
            out.cleanPasses = Number(entry.cleanPasses)
          }
          if (entry.note?.trim()) out.note = entry.note.trim()
          return out
        }),
    }
    if (note.trim()) session.note = note.trim()
    try {
      const { queued } = await onCommit(upsertSession(session), `Séance ${date} - ${instrument} (${sessionType})`)
      clearDraft()
      setEntries({})
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
      <h3>{sessionLabel(instrument, sessionType)}</h3>

      <ul className="blocks">
        {blocks.map((block) => {
          const entry = entries[block.id]
          const tempo = targets[block.id]
          const done = Boolean(entry)
          return (
            <li key={block.id} className={`block ${done ? 'done' : ''}`}>
              <button type="button" className="block-head" onClick={() => toggle(block)} aria-pressed={done}>
                <span className={`check ${done ? 'on' : ''}`} aria-hidden="true">
                  {done ? '✓' : ''}
                </span>
                <span className="block-label">
                  {block.label}
                  {tempo && (
                    <span className="muted small">
                      {' '}
                      · objectif {tempo.target} BPM
                      {tempo.target > tempo.current ? ` (+${tempo.target - tempo.current})` : ''}
                    </span>
                  )}
                  {!tempo && <span className="muted small"> · qualitatif, sans tempo</span>}
                </span>
              </button>

              {done && isTempoBlock(block) && (
                <div className="block-body">
                  <div className="tempo-row">
                    <span className="field-label">Tempo atteint</span>
                    <div className="stepper">
                      <button type="button" onClick={() => patch(block.id, { tempoBpm: Math.max(20, Number(entry.tempoBpm) - 1) })}>
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={entry.tempoBpm}
                        onChange={(e) => patch(block.id, { tempoBpm: e.target.value })}
                        aria-label={`Tempo atteint pour ${block.label}`}
                      />
                      <button type="button" onClick={() => patch(block.id, { tempoBpm: Number(entry.tempoBpm) + 1 })}>
                        +
                      </button>
                    </div>
                    <span className="muted small mono">cap {block.capBpm}</span>
                  </div>

                  <span className="field-label">Passages propres d'affilée</span>
                  <div className="chips">
                    {CLEAN_CHOICES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`chip ${Number(entry.cleanPasses) === n ? 'active' : ''}`}
                        onClick={() => patch(block.id, { cleanPasses: n })}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="muted small">
                    {Number(entry.cleanPasses) >= CLEAN_PASSES_REQUIRED
                      ? Number(entry.tempoBpm) >= block.capBpm
                        ? `Cap atteint et tenu — ce bloc est acquis, le palier suivant se débloque quand tous le sont.`
                        : `Objectif tenu → ${Math.min(Number(entry.tempoBpm) + TEMPO_STEP_BPM, block.capBpm)} BPM la prochaine fois.`
                      : `${CLEAN_PASSES_REQUIRED} passages propres d'affilée pour monter de ${TEMPO_STEP_BPM} BPM.`}
                  </p>
                  <input
                    className="block-note"
                    value={entry.note ?? ''}
                    onChange={(e) => patch(block.id, { note: e.target.value })}
                    placeholder="Note sur ce bloc (facultatif)"
                  />
                </div>
              )}

              {done && !isTempoBlock(block) && (
                <div className="block-body">
                  <input
                    className="block-note"
                    value={entry.note ?? ''}
                    onChange={(e) => patch(block.id, { note: e.target.value })}
                    placeholder="Ce qui a été lu / joué / exploré (facultatif)"
                  />
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <label className="field">
        <span>Note de séance (facultatif)</span>
        <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ressenti global, blocage, matériel…" />
      </label>

      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      <div className="actions">
        <button type="button" className="btn primary" onClick={save} disabled={!doneCount || saving}>
          {saving ? 'Commit en cours…' : `Enregistrer ${doneCount ? `(${doneCount} bloc${doneCount > 1 ? 's' : ''})` : ''}`}
        </button>
      </div>
    </section>
  )
}
