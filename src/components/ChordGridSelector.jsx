import { pitchClassName } from '../lib/chordName.js'
import { fretsPitchClasses } from '../lib/tones.js'
import ChordDiagram from './ChordDiagram.jsx'

/**
 * Grille cliquable : une case par corde, la zone au-dessus du sillet pour la
 * corde à vide ; retaper la même position étouffe la corde. La sélection est
 * `frets`, au format de la banque.
 */
export default function ChordGridSelector({ value, onChange }) {
  const select = (string, fret) => onChange({ frets: value.frets.map((f, i) => (i !== string ? f : f === fret ? null : fret)) })
  const notes = fretsPitchClasses(value.frets).map(pitchClassName)
  return (
    <div>
      <div className="chord-preview mono" aria-live="polite">
        {notes.length ? notes.join(' · ') : '…'}
      </div>
      <ChordDiagram card={{ frets: value.frets }} label="Grille : place les doigts" onSelect={select} />
      <p className="muted small center">Une case par corde ; au-dessus du sillet = à vide ; retaper = étouffer.</p>
    </div>
  )
}
