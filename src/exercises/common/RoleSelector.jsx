import { ROLES } from './roles.js'

/** Fondamentale, tierce, quinte, septième. */
export default function RoleSelector({ value, onChange }) {
  return (
    <div className="chips">
      {ROLES.map((r) => (
        <button key={r.id} type="button" className={`chip ${value.role === r.id ? 'active' : ''}`} onClick={() => onChange({ role: r.id })}>
          {r.label}
        </button>
      ))}
    </div>
  )
}
