import { useState } from 'react'
import ExercisesScreen from './components/ExercisesScreen.jsx'
import GameScreen from './components/GameScreen.jsx'
import Nav from './components/Nav.jsx'
import TokenConfig from './components/TokenConfig.jsx'
import { getExercise } from './exercises/index.js'
import { useData } from './hooks/useData.js'
import { useSettings } from './hooks/useSettings.js'
import { isConfigured, loadGameDraft } from './lib/storage.js'

/** Jours entre aujourd'hui et une date ISO (négatif si passée), ou null. */
function daysUntil(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(y, m - 1, d) - today) / 86400000)
}

export default function App() {
  const [settings, updateSettings] = useSettings()
  const configured = isConfigured(settings)
  const [tab, setTab] = useState(configured ? 'exercises' : 'settings')
  // Exercice ouvert ; une partie en cours (brouillon) rouvre le sien au lancement.
  const [exerciseId, setExerciseId] = useState(() => loadGameDraft()?.exerciseId ?? null)
  const exercise = getExercise(exerciseId)
  const { data, loading, error, lastSync, online, pending, refresh, commit } = useData(settings)

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Poly</span>
        <button
          type="button"
          className={`sync ${pending.length ? 'pending' : ''} ${!online ? 'offline' : ''}`}
          onClick={refresh}
          disabled={loading || !configured}
          title="Synchroniser avec GitHub"
        >
          {!online
            ? `⚠ hors-ligne${pending.length ? ` · ${pending.length} en attente` : ''}`
            : pending.length
              ? `⟳ ${pending.length} en attente`
              : loading
                ? '⟳ sync…'
                : lastSync
                  ? `⟳ ${lastSync.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`
                  : '⟳'}
        </button>
      </header>

      {error && <div className="notice error global">GitHub : {error}</div>}
      <TokenExpiryNotice days={daysUntil(settings.tokenExpires)} onOpen={() => setTab('settings')} />

      <main>
        {tab === 'exercises' &&
          (configured ? (
            exercise ? (
              <GameScreen key={exercise.id} exercise={exercise} data={data} onCommit={commit} onBack={() => setExerciseId(null)} />
            ) : (
              <ExercisesScreen data={data} onOpen={setExerciseId} />
            )
          ) : (
            <NeedConfig go={() => setTab('settings')} />
          ))}
        {tab === 'settings' && <TokenConfig settings={settings} onChange={updateSettings} onSaved={() => setTab('exercises')} />}
      </main>

      <Nav current={tab} onChange={setTab} />
    </div>
  )
}

function TokenExpiryNotice({ days, onOpen }) {
  if (days === null || days > 7) return null
  const msg =
    days < 0
      ? `Le token GitHub a expiré il y a ${-days} j — les sauvegardes échoueront.`
      : days === 0
        ? "Le token GitHub expire aujourd'hui."
        : `Le token GitHub expire dans ${days} j.`
  return (
    <div className={`notice global ${days <= 1 ? 'error' : ''}`}>
      {msg}{' '}
      <button type="button" className="btn-link" onClick={onOpen}>
        Régénérer et mettre à jour dans Réglages
      </button>
    </div>
  )
}

function NeedConfig({ go }) {
  return (
    <div className="screen">
      <div className="card">
        <p>Configure d'abord ton token GitHub et le repo de données.</p>
        <button type="button" className="btn primary" onClick={go}>
          Ouvrir les réglages
        </button>
      </div>
    </div>
  )
}
