// Répétition espacée à boîtes (Leitner), dérivée du seul historique : chaque
// réponse est un bloc { drillId, cardId, correct } dans une séance de type
// 'drill'. Rien d'autre n'est stocké — l'état du paquet se rejoue depuis
// data.json, comme les paliers se déduisent des tempos.

import { addDays, asDate, toISO, todayISO } from './cycle.js'
import { sortedSessions } from './ops.js'

export const LEITNER_BOXES = 5
// Jours avant la prochaine revue, par boîte. Boîte 0 = jamais vue.
export const LEITNER_INTERVALS_DAYS = [0, 1, 2, 4, 8, 16]

// Combien de cartes nouvelles au plus par série, et taille max d'une série.
export const NEW_CARDS_PER_QUEUE = 5
export const MAX_QUEUE = 30

/** Réponses d'un drill, chronologiques : [{ date, cardId, correct }]. */
export function drillAnswers(sessions, drillId) {
  const out = []
  for (const session of sortedSessions(sessions)) {
    for (const block of session.blocks ?? []) {
      if (block.drillId === drillId && block.cardId) {
        out.push({ date: session.date, cardId: block.cardId, correct: Boolean(block.correct) })
      }
    }
  }
  return out
}

/**
 * État de chaque carte vue : { box, due, seen, correct, lastDate }.
 * Juste → boîte suivante (plafonnée) ; faux → retour en boîte 1.
 */
export function deckState(sessions, drillId) {
  const state = new Map()
  for (const a of drillAnswers(sessions, drillId)) {
    const prev = state.get(a.cardId) ?? { box: 0, seen: 0, correct: 0 }
    const box = a.correct ? Math.min(prev.box + 1, LEITNER_BOXES) : 1
    state.set(a.cardId, {
      box,
      due: toISO(addDays(a.date, LEITNER_INTERVALS_DAYS[box])),
      seen: prev.seen + 1,
      correct: prev.correct + (a.correct ? 1 : 0),
      lastDate: a.date,
    })
  }
  return state
}

/**
 * Série du jour : les cartes dues (boîtes faibles d'abord), puis quelques
 * nouvelles dans l'ordre des paliers. Une carte n'est proposée qu'une fois.
 */
export function buildQueue(state, cards, today = todayISO(), { newLimit = NEW_CARDS_PER_QUEUE, maxQueue = MAX_QUEUE } = {}) {
  const due = cards
    .filter((c) => state.has(c.id) && state.get(c.id).due <= today)
    .sort((a, b) => state.get(a.id).box - state.get(b.id).box || state.get(a.id).due.localeCompare(state.get(b.id).due))
  const fresh = cards.filter((c) => !state.has(c.id)).sort((a, b) => a.tier - b.tier).slice(0, newLimit)
  return [...due, ...fresh].slice(0, maxQueue).map((c) => c.id)
}

/** Vue d'ensemble du paquet, pour l'en-tête de l'écran. */
export function deckSummary(state, cards, today = todayISO()) {
  const byBox = Array.from({ length: LEITNER_BOXES + 1 }, () => 0)
  let dueToday = 0
  let dueTomorrow = 0
  const tomorrow = toISO(addDays(asDate(today), 1))
  for (const c of cards) {
    const s = state.get(c.id)
    if (!s) {
      byBox[0]++
      continue
    }
    byBox[s.box]++
    if (s.due <= today) dueToday++
    else if (s.due === tomorrow) dueTomorrow++
  }
  return { total: cards.length, seen: cards.length - byBox[0], byBox, dueToday, dueTomorrow }
}
