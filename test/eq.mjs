// Mini-harnais : une assertion d'égalité structurelle, un compteur, un bilan.
// Zéro dépendance — `node test/run.mjs`.
let fails = 0
let count = 0
export const eq = (label, got, want) => {
  count++
  const ok = JSON.stringify(got) === JSON.stringify(want)
  if (!ok) fails++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ` : ${JSON.stringify(got)} (attendu ${JSON.stringify(want)})`}`)
}
export const done = (name) => {
  console.log(fails ? `\n${name} : ${fails}/${count} en échec\n` : `\n${name} : ${count} assertions OK\n`)
  const f = fails
  fails = 0
  count = 0
  return f
}
