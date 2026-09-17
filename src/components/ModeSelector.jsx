import { MODE_NAMES } from '../modes.js'

/** Les sept modes de la gamme majeure, dans l'ordre des degrés. */
export default function ModeSelector({ value, onChange }) {
  return (
    <div className="chips">
      {MODE_NAMES.map((m) => (
        <button key={m} type="button" className={`chip ${value.mode === m ? 'active' : ''}`} onClick={() => onChange({ mode: m })}>
          {m}
        </button>
      ))}
    </div>
  )
}
