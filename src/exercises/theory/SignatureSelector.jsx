/** Une armure : nombre d'altérations (0 à 7) et leur type. */
export default function SignatureSelector({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch })
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.count === null ? '…' : value.count === 0 ? 'aucune altération' : `${value.count} ${value.kind === '#' ? 'dièse' : value.kind === 'b' ? 'bémol' : '?'}${value.count > 1 ? 's' : ''}`}
      </div>
      <span className="field-label">Nombre</span>
      <div className="chips">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button key={n} type="button" className={`chip ${value.count === n ? 'active' : ''}`} onClick={() => set({ count: n })}>
            {n}
          </button>
        ))}
      </div>
      <span className="field-label">Altérations</span>
      <div className="chips">
        {[
          { v: '#', label: 'dièses' },
          { v: 'b', label: 'bémols' },
        ].map((k) => (
          <button key={k.v} type="button" className={`chip ${value.kind === k.v ? 'active' : ''}`} onClick={() => set({ kind: k.v })}>
            {k.label}
          </button>
        ))}
      </div>
    </div>
  )
}
