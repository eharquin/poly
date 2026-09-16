// Lance chaque fichier *.test.mjs et cumule les échecs. Aucune dépendance.
const files = ['./program.test.mjs', './chords.test.mjs', './drill.test.mjs']
let total = 0
for (const f of files) {
  const { failures } = await import(f)
  total += failures
}
console.log(total ? `${total} assertion(s) en échec` : 'Tous les tests passent')
process.exit(total ? 1 : 0)
