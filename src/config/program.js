// Contenu du programme : quels exercices, dans quel ordre de difficulté.
// C'est le fichier à corriger quand la pratique réelle diverge du plan —
// aucun autre fichier ne connaît le nom d'un exercice.
//
// Chaque catégorie (instrument x type de séance) a :
//   - des `tiers` : des paliers d'exercices À TEMPO, qui changent de nature en
//     avançant (pas seulement « le même exercice plus vite ») ;
//   - une liste `continuous` : des exercices qualitatifs qui tournent en
//     permanence, sans palier ni tempo cible — leur difficulté monte via la
//     tonalité de la semaine et le choix du morceau.

export const PROGRAM = {
  piano: {
    technique: {
      label: 'Technique & lecture',
      tiers: [
        {
          id: 't1',
          blocks: [
            { id: 'gammes_1oct_sep', label: 'Gammes 1 octave, mains séparées', startTempoBpm: 60, capBpm: 100 },
            { id: 'arpeges_1oct_sep', label: 'Arpèges accord parfait, 1 octave, mains séparées', startTempoBpm: 50, capBpm: 90 },
            { id: 'indep_simple', label: 'Indépendance : MG blanches / MD noires (pattern fixe)', startTempoBpm: 50, capBpm: 80 },
          ],
        },
        {
          id: 't2',
          blocks: [
            { id: 'gammes_2oct_ens', label: 'Gammes 2 octaves, mains ensemble', startTempoBpm: 60, capBpm: 110 },
            { id: 'arpeges_renv_2oct', label: 'Arpèges + renversements, 2 octaves', startTempoBpm: 50, capBpm: 100 },
            { id: 'indep_croisee', label: 'Indépendance : MG noires / MD croches', startTempoBpm: 50, capBpm: 90 },
          ],
        },
        {
          id: 't3',
          blocks: [
            { id: 'gammes_tierces', label: 'Gammes 2 octaves en tierces, mains ensemble', startTempoBpm: 50, capBpm: 90 },
            { id: 'arpeges_7e', label: 'Arpèges de 7e (maj7/m7/dom7), 2 octaves', startTempoBpm: 50, capBpm: 90 },
            { id: 'indep_syncope', label: 'Indépendance syncopée (MG pattern syncopé / MD mélodie)', startTempoBpm: 50, capBpm: 80 },
          ],
        },
      ],
      continuous: [{ id: 'lecture_a_vue', label: 'Lecture à vue, 4-8 mesures inédites' }],
    },
    repertoire: {
      label: 'Répertoire & harmonie',
      tiers: [
        { id: 't1', blocks: [{ id: 'cadence_i_iv_v_i', label: 'Cadence I-IV-V-I, tonalité de la semaine', startTempoBpm: 60, capBpm: 100 }] },
        { id: 't2', blocks: [{ id: 'cadence_ii_v_i', label: 'Cadence ii-V-I, tonalité de la semaine', startTempoBpm: 60, capBpm: 100 }] },
        { id: 't3', blocks: [{ id: 'cadence_emprunt', label: 'Cadence avec emprunt modal / substitution', startTempoBpm: 50, capBpm: 90 }] },
      ],
      continuous: [{ id: 'morceau_courant', label: 'Passage du morceau en cours' }],
    },
  },
  guitare: {
    manche: {
      label: 'Manche & lead',
      tiers: [
        {
          id: 't1',
          blocks: [
            { id: 'gamme_position_maj', label: 'Gamme majeure/mineure, 1 position, tonalité de la semaine', startTempoBpm: 70, capBpm: 120 },
            { id: 'accord_vers_gamme_lent', label: 'Accord plaqué -> gamme, transition lente', startTempoBpm: 60, capBpm: 100 },
          ],
        },
        {
          id: 't2',
          blocks: [
            { id: 'gamme_2positions', label: 'Gamme sur 2 positions liées', startTempoBpm: 60, capBpm: 110 },
            { id: 'bends_isoles', label: 'Bends / hammer-ons / pull-offs isolés', startTempoBpm: 60, capBpm: 110 },
          ],
        },
        {
          id: 't3',
          blocks: [
            { id: 'gamme_manche_entier', label: 'Gamme sur 3+ positions (manche entier)', startTempoBpm: 50, capBpm: 100 },
            { id: 'accord_vers_gamme_rapide', label: 'Accord plaqué -> gamme, transition rapide/tempo', startTempoBpm: 60, capBpm: 110 },
          ],
        },
      ],
      continuous: [],
    },
    rythme: {
      label: 'Rythme & accords',
      tiers: [
        { id: 't1', blocks: [{ id: 'fingerstyle_simple', label: 'Fingerstyle pouce + 1 doigt, progression connue', startTempoBpm: 60, capBpm: 100 }] },
        { id: 't2', blocks: [{ id: 'fingerstyle_complet', label: 'Fingerstyle pouce + 3 doigts', startTempoBpm: 50, capBpm: 90 }] },
        { id: 't3', blocks: [{ id: 'fingerstyle_syncope', label: 'Fingerstyle syncopé/complexe', startTempoBpm: 50, capBpm: 80 }] },
      ],
      continuous: [{ id: 'impro_guidee', label: 'Impro 30-60s sur backing track, tonalité de la semaine' }],
    },
  },
}

// Cibles d'adhérence sur la fenêtre glissante de 14 jours : nombre de séances
// de ce type attendues. Diagnostic, jamais un score.
export const ADHERENCE_TARGETS = {
  'piano.technique': { min: 4, max: 6 },
  'piano.repertoire': { min: 2, max: 3 },
  'guitare.manche': { min: 4, max: 6 },
  'guitare.rythme': { min: 2, max: 3 },
}

/**
 * Type de séance non prescrite : touche secondaire du soir, habitude voix,
 * composition du dimanche. Enregistré pour la dernière pratique et
 * l'historique, mais absent d'ADHERENCE_TARGETS — donc jamais compté.
 */
export const FREE_SESSION = { id: 'libre', label: 'Libre' }

export const adherenceKey = (instrument, sessionType) => `${instrument}.${sessionType}`

/** Config d'une catégorie, ou null si la combinaison n'est pas au programme. */
export function getSessionConfig(instrument, sessionType) {
  return PROGRAM[instrument]?.[sessionType] ?? null
}

export function sessionLabel(instrument, sessionType) {
  if (!sessionType || sessionType === FREE_SESSION.id) return FREE_SESSION.label
  return getSessionConfig(instrument, sessionType)?.label ?? sessionType
}

/** Toutes les catégories du programme, à plat. */
export function allCategories() {
  return Object.entries(PROGRAM).flatMap(([instrument, sessions]) =>
    Object.entries(sessions).map(([sessionType, cfg]) => ({
      instrument,
      sessionType,
      key: adherenceKey(instrument, sessionType),
      label: cfg.label,
    })),
  )
}

/**
 * Config d'un exercice par son id, où qu'il soit dans le programme.
 * `continuous: true` signale un bloc sans mécanique de tempo.
 */
export function getBlockConfig(exerciseId) {
  for (const [instrument, sessions] of Object.entries(PROGRAM)) {
    for (const [sessionType, cfg] of Object.entries(sessions)) {
      for (const tier of cfg.tiers) {
        const block = tier.blocks.find((b) => b.id === exerciseId)
        if (block) return { ...block, instrument, sessionType, tierId: tier.id, continuous: false }
      }
      const cont = cfg.continuous.find((b) => b.id === exerciseId)
      if (cont) return { ...cont, instrument, sessionType, tierId: null, continuous: true }
    }
  }
  return null
}

/** Un bloc est « à tempo » s'il définit un tempo de départ. */
export const isTempoBlock = (block) => typeof block?.startTempoBpm === 'number'
