import { NOTE_NAMES_BOTH } from '../lib/chordName.js'

/** Douze classes de hauteur, les deux graphies sur une même pastille. */
export default function NoteSelector({ value, onChange }) {
  return (
    <div className="chips notes">
      {NOTE_NAMES_BOTH.map((name, pc) => (
        <button key={pc} type="button" className={`chip ${value.pc === pc ? 'active' : ''}`} onClick={() => onChange({ pc })}>
          {name}
        </button>
      ))}
    </div>
  )
}
