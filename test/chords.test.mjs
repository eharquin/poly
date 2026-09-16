const P = new URL('../src', import.meta.url).pathname
const { CHORD_CARDS } = await import(`${P}/config/chords.js`)
const { voicingMatches, chordName, rootString, voicingPitches, chordRootName } = await import(`${P}/lib/theory.js`)
let bad = 0
const ids = new Set()
for (const c of CHORD_CARDS) {
  if (ids.has(c.id)) { console.log(`FAIL id en double : ${c.id}`); bad++ }
  ids.add(c.id)
  const ok = voicingMatches(c.frets, c.root, c.quality)
  const rs = rootString(c.frets, c.root)
  if (!ok || rs === null) {
    bad++
    const sounding = [...new Set(voicingPitches(c.frets).map(p => chordRootName(p.pc)))].join(' ')
    console.log(`FAIL ${c.id.padEnd(12)} annoncé ${chordName(c.root, c.quality).padEnd(8)} sonne ${sounding}${rs === null ? ' (fondamentale absente)' : ''}`)
  }
}
console.log(`${CHORD_CARDS.length} cartes, ${bad} invalide(s)`)
console.log('par palier :', [1,2,3].map(t => `${t}: ${CHORD_CARDS.filter(c => c.tier === t).length}`).join('  '))
export const failures = bad
