const TABS = [
  { key: 'exercises', label: 'Exercices', icon: '🎸' },
  { key: 'settings', label: 'Réglages', icon: '⚙️' },
]

export default function Nav({ current, onChange }) {
  return (
    <nav className="nav">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className={`nav-btn ${current === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  )
}
