// Lance chaque fichier *.test.mjs et cumule les échecs. Aucune dépendance.
const files = ['./chords.test.mjs', './leitner.test.mjs', './degrees.test.mjs', './roles.test.mjs', './scales.test.mjs']
let total = 0
for (const f of files) {
  const { failures } = await import(f)
  total += failures
}
console.log(total ? `${total} assertion(s) en échec` : 'Tous les tests passent')
process.exit(total ? 1 : 0)
