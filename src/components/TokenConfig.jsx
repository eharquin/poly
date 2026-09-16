import { useState } from 'react'
import { CIRCLE_OF_FIFTHS, KEY_CYCLE_WEEKS } from '../config/instruments.js'
import { getKeyOfWeek, toISO, mondayOf } from '../lib/cycle.js'
import { testConnection } from '../lib/github.js'
import { isConfigured } from '../lib/storage.js'

/** Réglages : repo de données, token GitHub, départ du cycle de tonalités. */
export default function TokenConfig({ settings, onChange, onSaved }) {
  const [form, setForm] = useState(settings)
  const [status, setStatus] = useState(null)
  const [showToken, setShowToken] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const save = () => {
    onChange(form)
    setStatus({ ok: true, msg: 'Réglages enregistrés (token en localStorage uniquement).' })
    onSaved?.()
  }

  const test = async () => {
    setStatus({ msg: 'Test en cours…' })
    try {
      const r = await testConnection(form)
      const canWrite = r.permissions?.push
      setStatus({
        ok: canWrite,
        msg: canWrite
          ? `OK : accès en écriture à ${r.fullName}`
          : `Accès lecture seule à ${r.fullName} — vérifie le scope Contents: write`,
      })
    } catch (e) {
      setStatus({ ok: false, msg: `Échec : ${e.message}` })
    }
  }

  return (
    <div className="screen">
      <h2>Réglages</h2>

      <section className="card">
        <h3>Repo GitHub (données)</h3>
        <label className="field">
          <span>Owner</span>
          <input value={form.owner} onChange={set('owner')} placeholder="mon-user" autoCapitalize="none" />
        </label>
        <label className="field">
          <span>Repo</span>
          <input value={form.repo} onChange={set('repo')} placeholder="poly-data" autoCapitalize="none" />
        </label>
        <div className="row-2">
          <label className="field">
            <span>Branche</span>
            <input value={form.branch} onChange={set('branch')} autoCapitalize="none" />
          </label>
          <label className="field">
            <span>Fichier</span>
            <input value={form.path} onChange={set('path')} autoCapitalize="none" />
          </label>
        </div>
        <p className="muted small">Repo privé conseillé : le fichier contient tout l'historique de pratique.</p>
      </section>

      <section className="card">
        <h3>Token GitHub</h3>
        <p className="muted">
          Fine-grained PAT, scope <code>Contents: read/write</code> limité à ce repo, avec expiration. Stocké
          uniquement dans ce navigateur.
        </p>
        <label className="field">
          <span>Personal Access Token</span>
          <input
            type={showToken ? 'text' : 'password'}
            value={form.token}
            onChange={set('token')}
            placeholder="github_pat_…"
            autoCapitalize="none"
            autoComplete="off"
          />
        </label>
        <button type="button" className="btn-link" onClick={() => setShowToken((s) => !s)}>
          {showToken ? 'Masquer' : 'Afficher'} le token
        </button>
        <label className="field">
          <span>Date d'expiration du token (alerte 7 jours avant)</span>
          <input type="date" value={form.tokenExpires ?? ''} onChange={set('tokenExpires')} />
        </label>
      </section>

      <section className="card">
        <h3>Cycle des tonalités</h3>
        <p className="muted small">
          Une tonalité du cercle des quintes toutes les {KEY_CYCLE_WEEKS} semaines, dans l'ordre{' '}
          {CIRCLE_OF_FIFTHS.join(' → ')}.
        </p>
        <label className="field">
          <span>Date de départ (lundi de la 1re tonalité)</span>
          <input type="date" value={form.cycleStart} onChange={set('cycleStart')} />
        </label>
        <button
          type="button"
          className="btn-link"
          onClick={() => setForm((f) => ({ ...f, cycleStart: toISO(mondayOf(new Date())) }))}
        >
          Démarrer au lundi de cette semaine
        </button>
        {form.cycleStart && (
          <p className="muted small">
            Tonalité en cours avec ce réglage : <strong>{getKeyOfWeek(new Date(), form.cycleStart)}</strong>
          </p>
        )}
      </section>

      {status && <div className={`notice ${status.ok === false ? 'error' : status.ok ? 'ok' : ''}`}>{status.msg}</div>}

      <div className="actions">
        <button type="button" className="btn secondary" onClick={test} disabled={!isConfigured(form)}>
          Tester la connexion
        </button>
        <button type="button" className="btn primary" onClick={save}>
          Enregistrer
        </button>
      </div>
    </div>
  )
}
