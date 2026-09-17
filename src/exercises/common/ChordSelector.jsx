import { ACCIDENTALS, NOTES, QUALITIES, formatChordName } from '../../lib/chordName.js'

/** Trois groupes de boutons (note, altération, qualité) et l'aperçu du nom construit. */
export default function ChordSelector({ value, onChange, hidePreview = false }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const name = formatChordName(value)
  return (
    <div className="chord-selector">
      {!hidePreview && (
        <div className="chord-preview mono" aria-live="polite">
          {name || '…'}
        </div>
      )}
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
      <span className="field-label">Qualité</span>
      <div className="chips">
        {QUALITIES.map((q) => (
          <button key={q} type="button" className={`chip ${value.qual === q ? 'active' : ''}`} onClick={() => set({ qual: q })}>
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
