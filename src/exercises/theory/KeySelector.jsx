import { ACCIDENTALS, NOTES } from '../../lib/chordName.js'

/** Une tonalité : note + altération, avec l'aperçu. */
export default function KeySelector({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.root ? `${value.root}${value.acc ?? ''} majeur` : '…'}
      </div>
      <span className="field-label">Note</span>
      <div className="chips">
        {NOTES.map((n) => (
          <button key={n} type="button" className={`chip ${value.root === n ? 'active' : ''}`} onClick={() => set({ root: n })}>
            {n}
          </button>
        ))}
      </div>
      <span className="field-label">Altération</span>
      <div className="chips">
        {ACCIDENTALS.map((a) => (
          <button key={a.value} type="button" className={`chip ${value.acc === a.value ? 'active' : ''}`} onClick={() => set({ acc: a.value })}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
