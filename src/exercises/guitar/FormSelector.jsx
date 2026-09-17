import { FORMS } from './caged.js'

/** Les cinq formes CAGED. */
export default function FormSelector({ value, onChange }) {
  return (
    <div className="chips">
      {FORMS.map((f) => (
        <button key={f} type="button" className={`chip mono ${value.form === f ? 'active' : ''}`} onClick={() => onChange({ form: f })}>
          {f}
        </button>
      ))}
    </div>
  )
}
