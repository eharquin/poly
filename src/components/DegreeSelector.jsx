import { ROMANS } from '../degrees.js'

/** Sept boutons, un par degré de la gamme majeure. */
export default function DegreeSelector({ value, onChange }) {
  return (
    <div>
      <span className="field-label">Degré</span>
      <div className="chips">
        {ROMANS.map((r) => (
          <button key={r} type="button" className={`chip mono ${value.roman === r ? 'active' : ''}`} onClick={() => onChange({ roman: r })}>
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
