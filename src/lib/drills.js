// Moteur d'exercices : Drill { id, type, tier, prompt(), evaluate() }.
// Un drill décrit ce qu'il montre et comment il juge une réponse ; l'écran
// ne connaît que ce contrat, et Leitner ne connaît que { cardId, correct }.

import { CHORD_CARDS, CHORD_TIERS, getChordCard } from '../config/chords.js'
import { QUALITIES, chordName, chordRootName, chordTones, degreeInKey, rootString } from './theory.js'

// Type de séance des exercices : hors adhérence (pas une séance à
// l'instrument), hors dernière pratique, mais dans l'historique.
export const DRILL_SESSION_TYPE = 'drill'

const STRING_LABELS = ['6e corde (Mi grave)', '5e corde (La)', '4e corde (Ré)', '3e corde (Sol)', '2e corde (Si)', '1re corde (Mi aigu)']

export const CHORD_NAME_DRILL = {
  id: 'chord_name',
  type: 'flashcard',
  label: "Nommer l'accord",
  instrument: 'guitare',
  cards: CHORD_CARDS,
  tiers: CHORD_TIERS,
  getCard: getChordCard,

  /** Ce que l'écran affiche : la grille, sans rien qui trahisse la réponse. */
  prompt(card) {
    return { kind: 'chord-diagram', frets: card.frets, baseFret: card.baseFret, question: 'Quel accord ?' }
  },

  /**
   * Juge une réponse { root: pc, quality } et construit le retour — c'est là
   * que ça apprend : notes de l'accord, corde de la fondamentale, degré dans
   * la tonalité de la semaine.
   */
  evaluate(card, answer, keyOfWeek) {
    const rootCorrect = answer.root === card.root
    const qualityCorrect = answer.quality === card.quality
    const rs = rootString(card.frets, card.root)
    const degree = degreeInKey(card.root, card.quality, keyOfWeek)
    return {
      correct: rootCorrect && qualityCorrect,
      rootCorrect,
      qualityCorrect,
      expected: { name: chordName(card.root, card.quality), root: card.root, quality: card.quality },
      given: { name: chordName(answer.root, answer.quality) },
      feedback: {
        qualityName: QUALITIES[card.quality].name,
        tones: chordTones(card.root, card.quality).map(chordRootName),
        rootString: rs === null ? null : { index: rs, label: STRING_LABELS[rs] },
        degree,
        form: card.form,
        tier: card.tier,
      },
    }
  },
}

export const DRILLS = { [CHORD_NAME_DRILL.id]: CHORD_NAME_DRILL }

export function getDrill(id) {
  return DRILLS[id] ?? null
}
