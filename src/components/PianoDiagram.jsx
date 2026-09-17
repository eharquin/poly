/**
 * Clavier en SVG, à partir d'un Do, sur deux octaves (trois si l'accord
 * déborde). `keys` = demi-tons depuis ce Do ; chaque touche jouée reçoit un
 * point. Rien ne trahit la fondamentale : le clavier commence toujours au Do.
 */
const WK = 18 // largeur d'une touche blanche
const WH = 72 // hauteur
const BK = 11 // largeur d'une touche noire
const BH = 44
const PAD = 2

// Demi-ton dans l'octave -> touche blanche (index) ou noire (à droite de la blanche `after`).
const LAYOUT = [
  { white: 0 }, { black: true, after: 0 },
  { white: 1 }, { black: true, after: 1 },
  { white: 2 },
  { white: 3 }, { black: true, after: 3 },
  { white: 4 }, { black: true, after: 4 },
  { white: 5 }, { black: true, after: 5 },
  { white: 6 },
]

export default function PianoDiagram({ chord, label }) {
  const { keys } = chord
  const octaves = Math.max(2, Math.ceil((Math.max(...keys) + 1) / 12))
  const whites = octaves * 7
  const W = whites * WK + PAD * 2
  const H = WH + PAD * 2
  const played = new Set(keys)

  const whiteX = (octave, index) => PAD + (octave * 7 + index) * WK
  const dots = []
  const blacks = []
  for (let semis = 0; semis < octaves * 12; semis++) {
    const octave = Math.floor(semis / 12)
    const l = LAYOUT[semis % 12]
    if (l.black) {
      const x = whiteX(octave, l.after) + WK - BK / 2
      blacks.push(<rect key={`b${semis}`} x={x} y={PAD} width={BK} height={BH} className="piano-black" />)
      if (played.has(semis)) dots.push(<circle key={`d${semis}`} cx={x + BK / 2} cy={BH - 8} r={4.5} className="piano-dot" />)
    } else if (played.has(semis)) {
      dots.push(<circle key={`d${semis}`} cx={whiteX(octave, l.white) + WK / 2} cy={PAD + WH - 12} r={5.5} className="piano-dot" />)
    }
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="piano" style={{ width: W }} role="img" aria-label={label ?? 'Clavier'}>
      {Array.from({ length: whites }, (_, i) => (
        <rect key={`w${i}`} x={PAD + i * WK} y={PAD} width={WK} height={WH} className="piano-white" />
      ))}
      {blacks}
      {dots}
    </svg>
  )
}
