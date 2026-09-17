import { ACCIDENTALS } from '../lib/chordName.js'

/**
 * Les 7 lettres de la gamme à partir de la tonique (elles sont toujours
 * consécutives), et pour chacune ♮ / # / b : c'est la graphie qu'on apprend.
 */
export default function ScaleSelector({ value, onChange, card }) {
  const set = (i, acc) => onChange({ accs: value.accs.map((a, j) => (j === i ? acc : a)) })
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.accs.some((a) => a !== null) ? card.letters.map((l, i) => (value.accs[i] === null ? '·' : `${l}${value.accs[i]}`)).join(' ') : '…'}
      </div>
      <div className="scale-grid">
        {card.letters.map((letter, i) => (
          <div key={i} className="scale-col">
            <span className="scale-letter mono">{letter}</span>
            {ACCIDENTALS.map((a) => (
              <button key={a.value} type="button" className={`chip ${value.accs[i] === a.value ? 'active' : ''}`} onClick={() => set(i, a.value)} aria-label={`${letter}${a.value || ' naturel'}`}>
                {a.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
