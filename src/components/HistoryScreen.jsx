import { useMemo, useRef, useState } from 'react'
import { instrumentLabel } from '../config/instruments.js'
import { getBlockConfig, sessionLabel } from '../config/program.js'
import { getDrill } from '../lib/drills.js'
import { chordName } from '../lib/theory.js'
import { addDays, formatDateFR, mondayOf, toISO, todayISO } from '../lib/cycle.js'
import { activeDates } from '../lib/adherence.js'
import { deleteSession, newSessionId, replaceSessions, sortedSessions } from '../lib/ops.js'

const CALENDAR_WEEKS = 9
const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Grille des 9 dernières semaines, une ligne par semaine (lundi → dimanche). */
function buildCalendar(today) {
  const firstMonday = addDays(mondayOf(today), -7 * (CALENDAR_WEEKS - 1))
  return Array.from({ length: CALENDAR_WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => toISO(addDays(firstMonday, w * 7 + d))),
  )
}

/** Valide un JSON importé : on ne commit que des séances exploitables. */
function normalizeImport(raw) {
  const list = Array.isArray(raw) ? raw : raw?.sessions
  if (!Array.isArray(list)) throw new Error('fichier sans tableau "sessions"')
  return list.map((s, i) => {
    if (!s || typeof s.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s.date)) {
      throw new Error(`séance ${i + 1} : date manquante ou invalide`)
    }
    if (!s.instrument) throw new Error(`séance ${i + 1} : instrument manquant`)
    if (s.blocks && !Array.isArray(s.blocks)) throw new Error(`séance ${i + 1} : "blocks" n'est pas un tableau`)
    // Les champs des phases suivantes (drillId, boxLeitner…) passent tels quels.
    return { ...s, id: s.id ?? newSessionId(), blocks: s.blocks ?? [] }
  })
}

export default function HistoryScreen({ data, onCommit }) {
  const today = todayISO()
  const sessions = useMemo(() => sortedSessions(data.sessions).reverse(), [data.sessions])
  const active = useMemo(() => activeDates(data.sessions), [data.sessions])
  const weeks = useMemo(() => buildCalendar(today), [today])
  const [confirm, setConfirm] = useState(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const fileInput = useRef(null)

  const remove = async (s) => {
    setBusy(true)
    setNotice(null)
    try {
      const { queued } = await onCommit(deleteSession(s.id), `Suppression séance ${s.date} - ${s.instrument}`)
      setConfirm(null)
      setNotice({ ok: true, msg: `Séance du ${formatDateFR(s.date)} supprimée${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (e) {
      setNotice({ ok: false, msg: `Échec : ${e.message}` })
    } finally {
      setBusy(false)
    }
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ sessions: data.sessions }, null, 2) + '\n'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poly-${today}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de réimporter le même fichier
    if (!file) return
    setNotice(null)
    try {
      const list = normalizeImport(JSON.parse(await file.text()))
      if (!window.confirm(`Remplacer les ${data.sessions.length} séance(s) actuelles par les ${list.length} du fichier ?`)) return
      setBusy(true)
      const { queued } = await onCommit(replaceSessions(list), `Import de ${list.length} séance(s)`)
      setNotice({ ok: true, msg: `${list.length} séance(s) importée(s)${queued ? ' (hors-ligne, en attente)' : ' ✓'}` })
    } catch (err) {
      setNotice({ ok: false, msg: `Import impossible : ${err.message}` })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <h2>Historique</h2>

      <section className="card">
        <h3>9 dernières semaines</h3>
        <div className="calendar">
          <div className="cal-row cal-head">
            {DOW.map((d, i) => (
              <span key={i} className="cal-dow">
                {d}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <div className="cal-row" key={week[0]}>
              {week.map((iso) => {
                const state = iso > today ? 'future' : active.has(iso) ? 'active' : 'idle'
                return (
                  <span key={iso} className={`cal-day cal-${state} ${iso === today ? 'cal-today' : ''}`} title={formatDateFR(iso)} />
                )
              })}
            </div>
          ))}
        </div>
      </section>

      {notice && <div className={`notice ${notice.ok ? 'ok' : 'error'}`}>{notice.msg}</div>}

      <section className="card">
        <h3>Sauvegarde locale</h3>
        <p className="muted small">
          La source de vérité reste <code>data.json</code> sur GitHub ; l'export est un filet de secours.
        </p>
        <div className="actions">
          <button type="button" className="btn secondary" onClick={exportJson}>
            Exporter
          </button>
          <button type="button" className="btn secondary" onClick={() => fileInput.current?.click()} disabled={busy}>
            Importer
          </button>
          <input ref={fileInput} type="file" accept="application/json,.json" onChange={importJson} hidden />
        </div>
      </section>

      <h3>{sessions.length} séance(s)</h3>
      {sessions.length === 0 && <p className="muted small">Aucune séance enregistrée.</p>}
      {sessions.map((s) => (
        <section className="card session-item" key={s.id}>
          <div className="line-head">
            <strong>
              {formatDateFR(s.date)} · {instrumentLabel(s.instrument)}
            </strong>
            <span className="muted small">{sessionLabel(s.instrument, s.sessionType)}</span>
          </div>
          <div className="muted small">
            {s.key_of_week ? `Tonalité ${s.key_of_week}` : 'Tonalité non renseignée'}
            {s.note ? ` · ${s.note}` : ''}
          </div>

          {s.sessionType === 'drill' && s.blocks?.length > 0 && (
            <table className="table">
              <tbody>
                {s.blocks.map((b, i) => {
                  const card = getDrill(b.drillId)?.getCard(b.cardId)
                  return (
                    <tr key={`${b.cardId}-${i}`}>
                      <td>{card ? chordName(card.root, card.quality) : b.cardId}</td>
                      <td className={`num ${b.correct ? 'status-ok' : 'status-low'}`}>{b.correct ? '✓ juste' : '✕ faux'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
          {s.sessionType !== 'drill' && s.blocks?.length > 0 && (
            <table className="table">
              <tbody>
                {s.blocks.map((b) => (
                  <tr key={b.exerciseId}>
                    <td>{getBlockConfig(b.exerciseId)?.label ?? b.exerciseId}</td>
                    <td className="num mono">
                      {typeof b.tempoBpm === 'number' ? `${b.tempoBpm} BPM · ${b.cleanPasses ?? 0} propre(s)` : 'fait'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {s.blocks?.some((b) => b.note) && (
            <ul className="block-notes">
              {s.blocks
                .filter((b) => b.note)
                .map((b) => (
                  <li key={b.exerciseId} className="muted small">
                    {getBlockConfig(b.exerciseId)?.label ?? b.exerciseId} : {b.note}
                  </li>
                ))}
            </ul>
          )}

          {confirm === s.id ? (
            <div className="actions">
              <button type="button" className="btn secondary" onClick={() => setConfirm(null)} disabled={busy}>
                Annuler
              </button>
              <button type="button" className="btn danger" onClick={() => remove(s)} disabled={busy}>
                {busy ? 'Suppression…' : 'Confirmer'}
              </button>
            </div>
          ) : (
            <button type="button" className="btn-link danger-text" onClick={() => setConfirm(s.id)}>
              Supprimer
            </button>
          )}
        </section>
      ))}
    </div>
  )
}
