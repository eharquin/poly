// Adhérence au programme : « est-ce que je néglige quelque chose ? », sur une
// fenêtre glissante. Jamais de score cumulatif ni de pourcentage à vie — une
// semaine ratée sort de la fenêtre au bout de 14 jours et n'hypothèque pas
// les suivantes. Même logique que le volume par groupe musculaire de
// sport-tool : un diagnostic avec une fourchette, pas une note.

import { INSTRUMENTS, freshnessFor } from '../config/instruments.js'
import { ADHERENCE_TARGETS, adherenceKey, allCategories } from '../config/program.js'
import { asDate, daysSince, lastDays, parseISO, todayISO } from './cycle.js'

export const ADHERENCE_WINDOW_DAYS = 14

// Le dimanche est libre (composition) : il est exclu de la fenêtre, sinon on
// pénaliserait un jour volontairement non prescrit.
const isSunday = (iso) => parseISO(iso).getDay() === 0

/** Dates de la fenêtre d'adhérence, dimanches exclus. */
export function adherenceWindow(referenceDate = todayISO()) {
  return lastDays(ADHERENCE_WINDOW_DAYS, asDate(referenceDate)).filter((iso) => !isSunday(iso))
}

/**
 * Statut d'une catégorie : dans la fourchette, en dessous, très en dessous,
 * ou au-dessus du haut de fourchette (informatif, jamais une alerte).
 */
function statusFor(count, { min, max }) {
  if (count > max) return 'high'
  if (count >= min) return 'ok'
  if (count >= min / 2) return 'warn'
  return 'low'
}

/**
 * Réalisé vs cible sur les 14 derniers jours, pour chaque catégorie de
 * ADHERENCE_TARGETS. Les séances libres (touche secondaire, habitude voix,
 * composition) n'ont pas de clé de cible : elles ne comptent nulle part.
 */
export function computeAdherence(sessions, referenceDate = todayISO()) {
  const window = new Set(adherenceWindow(referenceDate))
  const counts = {}
  for (const session of sessions) {
    if (!session.sessionType || !window.has(session.date)) continue
    const key = adherenceKey(session.instrument, session.sessionType)
    if (key in ADHERENCE_TARGETS) counts[key] = (counts[key] ?? 0) + 1
  }
  return allCategories()
    .filter((c) => c.key in ADHERENCE_TARGETS)
    .map((c) => {
      const target = ADHERENCE_TARGETS[c.key]
      const count = counts[c.key] ?? 0
      return { ...c, count, ...target, status: statusFor(count, target) }
    })
}

/**
 * Dernière pratique par instrument, avec un statut de fraîcheur dépendant de
 * la priorité de l'instrument : 'ok' | 'warn' | 'stale' | 'never'.
 * Toutes les séances comptent ici, y compris les libres.
 */
export function computeLastPracticed(sessions, today = todayISO()) {
  const last = {}
  for (const s of sessions) {
    if (!last[s.instrument] || s.date > last[s.instrument]) last[s.instrument] = s.date
  }
  return INSTRUMENTS.map(({ id, label, priority }) => {
    const date = last[id] ?? null
    if (!date) return { id, label, priority, date: null, days: null, status: 'never' }
    const days = daysSince(date, today)
    const { ok, warn } = freshnessFor(id)
    return { id, label, priority, date, days, status: days <= ok ? 'ok' : days <= warn ? 'warn' : 'stale' }
  })
}

/** Jours où au moins une séance a été enregistrée (points du calendrier). */
export function activeDates(sessions) {
  return new Set(sessions.map((s) => s.date))
}
