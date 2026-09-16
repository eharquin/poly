// Programme : rotation, tonalité, progression du tempo, paliers, adhérence.
import { eq, done } from './eq.mjs'
const P = new URL('../src', import.meta.url).pathname
const { getRotationForDate, getKeyOfWeek, daysLeftOnKey } = await import(`${P}/lib/cycle.js`)
const { getCurrentTempo, getNextTarget, isAtCap, getTempoHistory, getStagnation, STAGNATION_SESSIONS } = await import(`${P}/lib/progression.js`)
const { getActiveTier, getBlocksForDay } = await import(`${P}/lib/tiers.js`)
const { computeAdherence, computeLastPracticed, adherenceWindow } = await import(`${P}/lib/adherence.js`)
const { applyOp } = await import(`${P}/lib/ops.js`)

let n = 0
const S = (date, instrument, sessionType, blocks = []) => ({
  id: `s${++n}`, date, instrument, sessionType, key_of_week: 'C',
  blocks: blocks.map(([exerciseId, tempoBpm, cleanPasses]) => (tempoBpm === undefined ? { exerciseId } : { exerciseId, tempoBpm, cleanPasses })),
})
const LIBRE = (date, instrument) => ({ id: `l${++n}`, date, instrument, sessionType: 'libre', key_of_week: 'C', blocks: [] })

// Rotation et tonalité (2026-09-16 = mercredi ; cycle démarré lundi 14/09)
eq('rotation mercredi', getRotationForDate('2026-09-16'), { main: { instrument: 'piano', session: 'repertoire' }, secondary: 'guitare' })
eq('rotation dimanche = libre', getRotationForDate('2026-09-20'), { main: { instrument: 'libre', session: null }, secondary: null })
eq('tonalité S1', getKeyOfWeek('2026-09-16', '2026-09-14'), 'C')
eq('tonalité S3 bascule', getKeyOfWeek('2026-09-28', '2026-09-14'), 'G')
eq('tonalité boucle après 24 semaines', getKeyOfWeek('2027-03-01', '2026-09-14'), 'C')
eq('tonalité avant le départ', getKeyOfWeek('2026-09-07', '2026-09-14'), 'F')
eq('sans date de départ', getKeyOfWeek('2026-09-16', ''), 'C')
eq('jours restants', daysLeftOnKey('2026-09-16', '2026-09-14'), 12)

// Progression : gammes_1oct_sep, départ 60, cap 100
eq('tempo sans historique', getCurrentTempo([], 'gammes_1oct_sep'), 60)
eq('3 propres -> +4', getNextTarget([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 60, 3]])], 'gammes_1oct_sep'), 64)
eq('2 propres -> tenu', getNextTarget([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 60, 2]])], 'gammes_1oct_sep'), 60)
eq('plafonné au cap', getNextTarget([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 98, 3]])], 'gammes_1oct_sep'), 100)
eq('cap tenu', isAtCap([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 100, 3]])], 'gammes_1oct_sep'), true)
eq('cap pas tenu', isAtCap([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 100, 1]])], 'gammes_1oct_sep'), false)
eq('bloc continu sans tempo', getCurrentTempo([], 'lecture_a_vue'), null)
eq('historique', getTempoHistory([S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 60, 3]]), S('2026-09-12', 'piano', 'technique', [['gammes_1oct_sep', 64, 1]])], 'gammes_1oct_sep').map((h) => h.tempoBpm), [60, 64])

// Stagnation
const stag = (tempos) => tempos.map((t, i) => S(`2026-09-0${i + 1}`, 'piano', 'technique', [['gammes_1oct_sep', t, 1]]))
eq('seuil', STAGNATION_SESSIONS, 3)
eq('2 séances : pas encore', getStagnation(stag([64, 64]), 'gammes_1oct_sep').stagnating, false)
eq('3 séances : stagne', getStagnation(stag([64, 64, 64]), 'gammes_1oct_sep'), { stagnating: true, count: 3, tempoBpm: 64 })
eq('une montée remet à 1', getStagnation(stag([64, 64, 64, 68]), 'gammes_1oct_sep').count, 1)
eq('au cap : pas une stagnation', getStagnation(stag([100, 100, 100]), 'gammes_1oct_sep').stagnating, false)

// Paliers
eq('palier initial', getActiveTier([], 'piano', 'technique').tier.id, 't1')
eq('blocs du jour = palier + continus', getBlocksForDay([], 'piano', 'technique').map((b) => b.id), ['gammes_1oct_sep', 'arpeges_1oct_sep', 'indep_simple', 'lecture_a_vue'])
const complet = [S('2026-09-10', 'piano', 'technique', [['gammes_1oct_sep', 100, 3], ['arpeges_1oct_sep', 90, 3], ['indep_simple', 80, 3]])]
eq('palier acquis -> suivant', getActiveTier(complet, 'piano', 'technique').tier.id, 't2')
eq('partiel -> inchangé', getActiveTier(complet.map((s) => ({ ...s, blocks: s.blocks.slice(0, 2) })), 'piano', 'technique').blocksAtCap, 2)
eq('guitare manche t1 : araignée en tête', getBlocksForDay([], 'guitare', 'manche').map((b) => b.id), ['araignee_doigts', 'gamme_position_maj', 'accord_vers_gamme_lent'])
eq('guitare rythme t1 : soustraction de temps', getBlocksForDay([], 'guitare', 'rythme').map((b) => b.id), ['fingerstyle_simple', 'soustraction_rythme', 'impro_guidee'])
eq('catégorie hors programme', getActiveTier([], 'voix', 'technique'), null)

// Adhérence (référence mercredi 16/09)
const REF = '2026-09-16'
const key = (list, k) => list.find((a) => a.key === k)
eq('fenêtre sans dimanche', [adherenceWindow(REF).length, adherenceWindow(REF)[0]], [12, '2026-09-03'])
const dates = ['2026-09-07', '2026-09-08', '2026-09-09', '2026-09-10']
const quatre = dates.map((d) => S(d, 'piano', 'technique'))
eq('0 -> low', key(computeAdherence([], REF), 'piano.technique').status, 'low')
eq('2 -> warn', key(computeAdherence(quatre.slice(0, 2), REF), 'piano.technique').status, 'warn')
eq('4 -> ok', key(computeAdherence(quatre, REF), 'piano.technique').status, 'ok')
eq('7 -> high', key(computeAdherence([...dates, '2026-09-11', '2026-09-14', '2026-09-15'].map((d) => S(d, 'piano', 'technique')), REF), 'piano.technique').status, 'high')
eq('dimanche non compté', key(computeAdherence([S('2026-09-13', 'piano', 'technique')], REF), 'piano.technique').count, 0)
eq('libre jamais compté', key(computeAdherence([LIBRE('2026-09-15', 'piano')], REF), 'piano.technique').count, 0)

// Fraîcheur
const fresh = computeLastPracticed([LIBRE('2026-09-15', 'voix'), S('2026-09-10', 'guitare', 'manche')], REF)
eq('voix fraîche via libre', fresh.find((f) => f.id === 'voix').status, 'ok')
eq('guitare froide', fresh.find((f) => f.id === 'guitare').status, 'stale')
eq('piano jamais', fresh.find((f) => f.id === 'piano').status, 'never')

// Ops
let data = applyOp({ sessions: [] }, { type: 'upsertSession', session: S('2026-09-16', 'piano', 'technique', [['gammes_1oct_sep', 64, 3]]) })
eq('blocs conservés', data.sessions[0].blocks[0], { exerciseId: 'gammes_1oct_sep', tempoBpm: 64, cleanPasses: 3 })
data = applyOp(data, { type: 'deleteSession', id: data.sessions[0].id })
eq('suppression par id', data.sessions.length, 0)

export const failures = done('programme')
