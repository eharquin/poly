import { NUMBERS, QUALITIES, intervalLabel } from './intervals.js'

/** Nombre (2de … 8ve) et qualité (diminuée … augmentée), avec l'aperçu. */
export default function IntervalSelector({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.number && value.quality ? intervalLabel(value.number, value.quality) : value.number ? NUMBERS.find((x) => x.n === value.number).label : '…'}
      </div>
      <span className="field-label">Nombre</span>
      <div className="chips">
        {NUMBERS.map((x) => (
          <button key={x.n} type="button" className={`chip ${value.number === x.n ? 'active' : ''}`} onClick={() => set({ number: x.n })}>
            {x.short}
          </button>
        ))}
      </div>
      <span className="field-label">Qualité</span>
      <div className="chips">
        {QUALITIES.map((q) => (
          <button key={q.id} type="button" className={`chip ${value.quality === q.id ? 'active' : ''}`} onClick={() => set({ quality: q.id })}>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  )
}
