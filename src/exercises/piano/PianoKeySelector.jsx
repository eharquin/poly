import { pitchClassName } from '../../lib/chordName.js'
import PianoDiagram from './PianoDiagram.jsx'

/** Deux octaves cliquables ; la sélection est la liste des touches allumées. */
export default function PianoKeySelector({ value, onChange }) {
  const toggle = (key) => onChange({ keys: value.keys.includes(key) ? value.keys.filter((k) => k !== key) : [...value.keys, key].sort((a, b) => a - b) })
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {value.keys.length ? value.keys.map((k) => pitchClassName(k % 12)).join(' · ') : '…'}
      </div>
      <PianoDiagram card={{ keys: value.keys }} label="Clavier : tape les touches de l’accord" onToggle={toggle} />
    </div>
  )
}
