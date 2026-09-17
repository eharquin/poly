import { EMPTY_SELECTION, formatChordName, isComplete } from '../../lib/chordName.js'
import ChordSelector from '../common/ChordSelector.jsx'

/**
 * Une case par accord de la progression ; le sélecteur d'accord édite la
 * case active, et passe à la suivante dès qu'elle est complète.
 */
export default function ProgressionSelector({ value, onChange, card }) {
  const n = card.chords.length
  const chords = card.chords.map((_, i) => value.chords[i] ?? EMPTY_SELECTION)
  const active = value.active ?? 0
  const setChord = (sel) => {
    const next = chords.map((c, i) => (i === active ? sel : c))
    const firstIncomplete = next.findIndex((c, i) => i !== active && !isComplete(c))
    onChange({ chords: next, active: isComplete(sel) && firstIncomplete >= 0 ? firstIncomplete : active })
  }
  return (
    <div>
      <div className="chips progression">
        {chords.map((c, i) => (
          <button key={i} type="button" className={`chip ${i === active ? 'active' : ''} ${isComplete(c) ? 'filled' : ''}`} onClick={() => onChange({ chords, active: i })}>
            <span className="muted small">{card.chords[i].roman}</span> {isComplete(c) ? formatChordName(c) : '…'}
          </button>
        ))}
      </div>
      <ChordSelector value={chords[active]} onChange={setChord} hidePreview />
      <span className="muted small">{n} accords — tape une case pour la corriger.</span>
    </div>
  )
}
