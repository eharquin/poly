import { useMemo } from 'react'
import { getBlockConfig, allCategories } from '../config/program.js'
import { instrumentLabel } from '../config/instruments.js'
import { formatDateFR } from '../lib/cycle.js'
import { ADHERENCE_WINDOW_DAYS, computeAdherence, computeLastPracticed } from '../lib/adherence.js'
import { getTempoHistory, practisedExerciseIds } from '../lib/progression.js'
import { getActiveTier } from '../lib/tiers.js'

// Statut d'adhérence : couleur réservée + icône + libellé. Jamais la couleur
// seule — c'est la règle qui rend le code couleur lisible en CVD.
const ADHERENCE_STATUS = {
  ok: { icon: '✓', label: 'dans la cible' },
  warn: { icon: '▲', label: 'en dessous' },
  low: { icon: '✕', label: 'très en dessous' },
  high: { icon: '●', label: 'au-dessus' },
}

const FRESHNESS_LABEL = {
  ok: 'à jour',
  warn: 'à reprendre',
  stale: 'en train de refroidir',
  never: 'jamais pratiqué',
}

export default function ProgressScreen({ data }) {
  const sessions = data.sessions
  const adherence = useMemo(() => computeAdherence(sessions), [sessions])
  const last = useMemo(() => computeLastPracticed(sessions), [sessions])
  const categories = useMemo(
    () => allCategories().map((c) => ({ ...c, tier: getActiveTier(sessions, c.instrument, c.sessionType) })),
    [sessions],
  )
  const charts = useMemo(() => {
    return practisedExerciseIds(sessions)
      .map((id) => ({ id, config: getBlockConfig(id), history: getTempoHistory(sessions, id) }))
      .filter((c) => c.config && c.history.length)
      .sort((a, b) => a.config.instrument.localeCompare(b.config.instrument) || a.config.label.localeCompare(b.config.label))
  }, [sessions])

  return (
    <div className="screen">
      <h2>Progression</h2>

      <section className="card">
        <h3>Adhérence · {ADHERENCE_WINDOW_DAYS} derniers jours</h3>
        <p className="muted small">
          Séances réalisées face à la fourchette cible, dimanches exclus. Fenêtre glissante : une semaine manquée sort du
          calcul, elle ne se rembourse pas.
        </p>
        <ul className="diagnostic">
          {adherence.map((a) => (
            <li key={a.key}>
              <span className="diag-label">
                {instrumentLabel(a.instrument)} · {a.label}
              </span>
              <span className="diag-count mono">
                {a.count} / {a.min}-{a.max}
              </span>
              <span className={`diag-status status-${a.status}`}>
                <span aria-hidden="true">{ADHERENCE_STATUS[a.status].icon}</span> {ADHERENCE_STATUS[a.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Paliers</h3>
        <ul className="diagnostic">
          {categories.map((c) => (
            <li key={c.key}>
              <span className="diag-label">
                {instrumentLabel(c.instrument)} · {c.label}
              </span>
              <span className="diag-count mono">
                {c.tier ? `${c.tier.index + 1}/${c.tier.total}` : '—'}
              </span>
              <span className="muted small">
                {c.tier ? `${c.tier.blocksAtCap}/${c.tier.tempoBlocks} blocs au cap` : ''}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h3>Tempo par exercice</h3>
        {charts.length === 0 ? (
          <p className="muted small">Aucun bloc à tempo enregistré pour l'instant.</p>
        ) : (
          <>
            <p className="muted small">
              Un point par séance. La ligne fine marque le cap du bloc — l'atteindre et le tenir débloque le palier
              suivant. Le détail chiffré de chaque séance est dans Historique.
            </p>
            {charts.map((c) => (
              <TempoChart key={c.id} config={c.config} history={c.history} />
            ))}
          </>
        )}
      </section>

      <section className="card">
        <h3>Dernière pratique</h3>
        <ul className="diagnostic">
          {last.map((f) => (
            <li key={f.id}>
              <span className="diag-label">{f.label}</span>
              <span className={`diag-status fresh-${f.status}`}>
                {f.date === null ? FRESHNESS_LABEL.never : f.days === 0 ? "aujourd'hui" : `il y a ${f.days} j`}
              </span>
              <span className="muted small">{f.date ? formatDateFR(f.date) : '—'}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/**
 * Petite courbe de tempo, une par exercice (small multiples) : une seule
 * série, donc pas de légende — le titre nomme ce qui est tracé. Seule la
 * valeur de fin est étiquetée ; l'axe implicite est le cap, tracé en filet.
 */
function TempoChart({ config, history }) {
  const W = 300
  const H = 68
  const PAD = 5
  const PAD_TOP = 17 // laisse la place à l'étiquette du cap, au-dessus de son filet
  const PLOT_RIGHT = 212 // la bande de droite est réservée à l'étiquette de fin

  const tempos = history.map((h) => h.tempoBpm)
  const yMax = Math.max(config.capBpm, ...tempos)
  const yMin = Math.min(config.startTempoBpm, ...tempos)
  const span = Math.max(yMax - yMin, 1)
  const y = (bpm) => PAD_TOP + (1 - (bpm - yMin) / span) * (H - PAD_TOP - PAD)
  const x = (i) => (history.length === 1 ? PAD : PAD + (i / (history.length - 1)) * (PLOT_RIGHT - PAD))

  const points = history.map((h, i) => ({ ...h, cx: x(i), cy: y(h.tempoBpm) }))
  const path = points.map((p) => `${p.cx},${p.cy}`).join(' ')
  const end = points.at(-1)
  const atCap = end.tempoBpm >= config.capBpm
  // Quand la dernière valeur longe le filet de cap, on décale son étiquette
  // au-dessus plutôt que de la poser sur la ligne.
  const onCapLine = Math.abs(end.cy - y(config.capBpm)) < 8
  const valueY = onCapLine ? end.cy - 8 : end.cy + 4

  return (
    <figure className="chart">
      <figcaption>
        {config.label}
        <span className="muted small"> · départ {config.startTempoBpm} BPM</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`${config.label} : ${end.tempoBpm} BPM sur ${history.length} séance(s), cap ${config.capBpm} BPM`}
      >
        <line x1={PAD} y1={y(config.capBpm)} x2={PLOT_RIGHT} y2={y(config.capBpm)} className="chart-cap" vectorEffect="non-scaling-stroke" />
        {!atCap && (
          <text x={PAD} y={y(config.capBpm) - 5} className="chart-tick">
            cap {config.capBpm}
          </text>
        )}
        {points.length > 1 && <polyline points={path} className="chart-line" vectorEffect="non-scaling-stroke" />}
        {points.length <= 12 &&
          points.map((p) => (
            <circle key={`${p.date}-${p.cx}`} cx={p.cx} cy={p.cy} r="4" className="chart-dot">
              <title>{`${formatDateFR(p.date)} · ${p.tempoBpm} BPM · ${p.cleanPasses} passage(s) propre(s)`}</title>
            </circle>
          ))}
        {points.length > 12 && <circle cx={end.cx} cy={end.cy} r="4" className="chart-dot" />}
        <text x={end.cx + 10} y={valueY} className="chart-value">
          {end.tempoBpm} BPM
        </text>
      </svg>
      <p className="muted small">
        {history.length} séance{history.length > 1 ? 's' : ''} · dernière le {formatDateFR(end.date)}
        {atCap ? ` · cap atteint` : ''}
      </p>
    </figure>
  )
}
