/**
 * Grille d'accord en SVG : 6 cordes verticales (grave à gauche), 5 cases,
 * sillet épais en haut pour une position ouverte, sinon numéro de case à
 * gauche. Un barré est dessiné comme une barre quand la case la plus basse
 * est tenue sur deux cordes éloignées d'au moins trois positions — le F ne
 * fait sonner que trois cordes à la case 1, mais l'index les couvre toutes.
 * `highlightString` colore la fondamentale
 * — seulement dans le retour, jamais dans la question.
 */
const STRINGS = 6
const FRETS_SHOWN = 5
const X0 = 40 // première corde
const DX = 20 // écart entre cordes
const Y0 = 36 // sillet / première frette
const DY = 28 // hauteur d'une case
const W = X0 + DX * (STRINGS - 1) + 20
const H = Y0 + DY * FRETS_SHOWN + 8

export default function ChordDiagram({ frets, baseFret = 1, highlightString = null, label }) {
  const played = frets.map((f, i) => ({ string: i, fret: f })).filter((p) => p.fret !== 'x' && p.fret !== 0)
  const minFret = played.length ? Math.min(...played.map((p) => p.fret)) : null
  const atMin = played.filter((p) => p.fret === minFret).map((p) => p.string)
  const barre =
    atMin.length >= 2 && Math.max(...atMin) - Math.min(...atMin) >= 3
      ? { from: Math.min(...atMin), to: Math.max(...atMin), fret: minFret }
      : null

  const x = (string) => X0 + string * DX
  const y = (fret) => Y0 + (fret - baseFret) * DY + DY / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chord" role="img" aria-label={label ?? 'Grille d’accord'}>
      {/* cordes */}
      {Array.from({ length: STRINGS }, (_, i) => (
        <line key={`s${i}`} x1={x(i)} y1={Y0} x2={x(i)} y2={Y0 + DY * FRETS_SHOWN} className="chord-string" />
      ))}
      {/* frettes ; la première est le sillet en position ouverte */}
      {Array.from({ length: FRETS_SHOWN + 1 }, (_, i) => (
        <line
          key={`f${i}`}
          x1={x(0)}
          y1={Y0 + DY * i}
          x2={x(STRINGS - 1)}
          y2={Y0 + DY * i}
          className={i === 0 && baseFret === 1 ? 'chord-nut' : 'chord-fret'}
        />
      ))}
      {baseFret > 1 && (
        <text x={6} y={y(baseFret) + 4} className="chord-pos">
          {baseFret}fr
        </text>
      )}
      {/* cordes étouffées / à vide */}
      {frets.map((f, i) =>
        f === 'x' || f === 0 ? (
          <text key={`m${i}`} x={x(i)} y={Y0 - 12} className={`chord-mark ${f === 0 && i === highlightString ? 'root' : ''}`}>
            {f === 'x' ? '×' : '○'}
          </text>
        ) : null,
      )}
      {/* barré */}
      {barre && (
        <rect
          x={x(barre.from) - 8}
          y={y(barre.fret) - 7}
          width={x(barre.to) - x(barre.from) + 16}
          height={14}
          rx={7}
          className="chord-dot"
        />
      )}
      {/* doigts */}
      {played.map((p) =>
        barre && p.fret === barre.fret && p.string >= barre.from && p.string <= barre.to ? (
          p.string === highlightString ? (
            <circle key={`r${p.string}`} cx={x(p.string)} cy={y(p.fret)} r={5} className="chord-dot root" />
          ) : null
        ) : (
          <circle key={`d${p.string}`} cx={x(p.string)} cy={y(p.fret)} r={7.5} className={`chord-dot ${p.string === highlightString ? 'root' : ''}`} />
        ),
      )}
    </svg>
  )
}
