import { FRETS } from './fretboard.js'

/**
 * Manche horizontal, corde aiguë en haut comme sur une tablature : sillet à
 * gauche, 12 cases, repères aux cases 3, 5, 7, 9 et 12. `marks` = positions
 * { string, fret } à pointer (case 0 = corde à vide, à gauche du sillet).
 * Une marque peut porter `kind: 'origin'` (point de départ, autre couleur).
 * Avec `onSelect`, chaque case se tape ; `activeStrings` limite les taps à
 * ces cordes et estompe les autres.
 */
const CW = 26 // largeur d'une case
const OPEN_W = 22 // zone « à vide »
const SH = 20 // écart entre cordes
const X0 = OPEN_W + 4 // sillet
const Y0 = 14
const W = X0 + CW * FRETS + 4
const H = Y0 + SH * 5 + 22
const INLAYS = [3, 5, 7, 9, 12]

export default function FretboardDiagram({ marks = [], label, onSelect = null, activeStrings = null }) {
  const inactive = (s) => activeStrings !== null && !activeStrings.includes(s)
  const interactive = Boolean(onSelect)
  const y = (string) => Y0 + (5 - string) * SH // corde 5 (Mi aigu) en haut
  const cx = (fret) => (fret === 0 ? X0 - OPEN_W / 2 : X0 + CW * (fret - 1) + CW / 2)
  const isMarked = (s, f) => marks.some((m) => m.string === s && m.fret === f)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`fretboard ${interactive ? 'interactive' : ''}`} role={interactive ? 'group' : 'img'} aria-label={label ?? 'Manche'}>
      {/* repères */}
      {INLAYS.map((f) =>
        f === 12 ? (
          [1.5, 3.5].map((s) => <circle key={`i${f}${s}`} cx={cx(f)} cy={y(s)} r={3.5} className="fret-inlay" />)
        ) : (
          <circle key={`i${f}`} cx={cx(f)} cy={y(2.5)} r={3.5} className="fret-inlay" />
        ),
      )}
      {/* frettes, sillet compris */}
      {Array.from({ length: FRETS + 1 }, (_, i) => (
        <line key={`f${i}`} x1={X0 + CW * i} y1={y(5)} x2={X0 + CW * i} y2={y(0)} className={i === 0 ? 'fret-nut' : 'fret-wire'} />
      ))}
      {/* cordes */}
      {Array.from({ length: 6 }, (_, s) => (
        <line key={`s${s}`} x1={X0 - OPEN_W} y1={y(s)} x2={X0 + CW * FRETS} y2={y(s)} className={`fret-string ${inactive(s) ? 'dim' : ''}`} style={{ strokeWidth: 0.8 + (5 - s) * 0.25 }} />
      ))}
      {/* numéros de case */}
      {INLAYS.map((f) => (
        <text key={`n${f}`} x={cx(f)} y={H - 6} className="fret-number">
          {f}
        </text>
      ))}
      {/* positions pointées */}
      {marks.map((m) => (
        <circle key={`m${m.string}-${m.fret}`} cx={cx(m.fret)} cy={y(m.string)} r={7} className={`fret-dot ${m.kind ?? ''}`} />
      ))}
      {/* zones cliquables */}
      {interactive &&
        Array.from({ length: 6 }, (_, s) =>
          inactive(s)
            ? null
            : Array.from({ length: FRETS + 1 }, (_, f) => (
                <rect
                  key={`h${s}-${f}`}
                  x={f === 0 ? X0 - OPEN_W : X0 + CW * (f - 1)}
                  y={y(s) - SH / 2}
                  width={f === 0 ? OPEN_W : CW}
                  height={SH}
                  className={`chord-hit ${isMarked(s, f) ? 'on' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`corde ${6 - s}, ${f === 0 ? 'à vide' : `case ${f}`}`}
                  onClick={() => onSelect(s, f)}
                />
              )),
        )}
    </svg>
  )
}
