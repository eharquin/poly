/**
 * Grille d'accord en SVG : 6 cordes verticales (Mi grave à gauche), 5 cases,
 * sillet en trait épais en haut, × / ○ au-dessus des cordes étouffées / à
 * vide, points pleins aux positions à jouer. Un `barre` { fret, from, to }
 * est dessiné comme une barre entre les cordes `from` et `to`.
 * `highlightString` met en évidence la note d'une corde (point ou ○).
 * `card.baseFret` > 1 : la grille commence à cette case (numéro à gauche,
 * pas de sillet), pour les formes déplacées sur le manche.
 * Avec `onSelect(string, fret)`, la grille devient un sélecteur : chaque case
 * se tape, et la zone au-dessus du sillet vaut « corde à vide » (fret 0).
 */
const STRINGS = 6
const FRETS_SHOWN = 5
const X0 = 30 // première corde
const DX = 20 // écart entre cordes
const Y0 = 34 // sillet
const DY = 28 // hauteur d'une case
const W = X0 * 2 + DX * (STRINGS - 1)
const H = Y0 + DY * FRETS_SHOWN + 8
const STRING_NAMES = ['Mi grave', 'La', 'Ré', 'Sol', 'Si', 'Mi aigu']

export default function ChordDiagram({ card, label, highlightString = null, onSelect = null }) {
  const { frets, barre, baseFret = 1 } = card
  const interactive = Boolean(onSelect)
  const x = (string) => X0 + string * DX
  const y = (fret) => Y0 + (fret - baseFret) * DY + DY / 2
  const inBarre = (string, fret) => barre && fret === barre.fret && string >= barre.from && string <= barre.to

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`chord ${interactive ? 'interactive' : ''}`} role={interactive ? 'group' : 'img'} aria-label={label ?? 'Grille d’accord'}>
      {Array.from({ length: STRINGS }, (_, i) => (
        <line key={`s${i}`} x1={x(i)} y1={Y0} x2={x(i)} y2={Y0 + DY * FRETS_SHOWN} className="chord-string" />
      ))}
      {Array.from({ length: FRETS_SHOWN + 1 }, (_, i) => (
        <line key={`f${i}`} x1={x(0)} y1={Y0 + DY * i} x2={x(STRINGS - 1)} y2={Y0 + DY * i} className={i === 0 && baseFret === 1 ? 'chord-nut' : 'chord-fret'} />
      ))}
      {baseFret > 1 && (
        <text x={4} y={y(baseFret) + 4} className="chord-pos">
          {baseFret}
        </text>
      )}
      {frets.map((f, i) =>
        f === null || f === 0 ? (
          <text key={`m${i}`} x={x(i)} y={Y0 - 12} className={`chord-mark ${f === 0 && i === highlightString ? 'hl' : ''}`}>
            {f === null ? '×' : '○'}
          </text>
        ) : null,
      )}
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
      {frets.map((f, i) =>
        f && (!inBarre(i, f) || i === highlightString) ? (
          <circle key={`d${i}`} cx={x(i)} cy={y(f)} r={i === highlightString && inBarre(i, f) ? 5 : 7.5} className={`chord-dot ${i === highlightString ? 'hl' : ''}`} />
        ) : null,
      )}
      {interactive &&
        frets.map((_, i) =>
          Array.from({ length: FRETS_SHOWN + 1 }, (__, f) => (
            <rect
              key={`h${i}-${f}`}
              x={x(i) - DX / 2}
              y={f === 0 ? 0 : Y0 + DY * (f - 1)}
              width={DX}
              height={f === 0 ? Y0 : DY}
              className="chord-hit"
              role="button"
              tabIndex={0}
              aria-label={`${STRING_NAMES[i]}, ${f === 0 ? 'à vide' : `case ${f}`}`}
              onClick={() => onSelect(i, f)}
            />
          )),
        )}
    </svg>
  )
}
