// Fonctions pures de calendrier : aucun state, aucune dépendance au DOM.

import { CIRCLE_OF_FIFTHS, DAY_KEYS, KEY_CYCLE_WEEKS, WEEKLY_ROTATION } from '../config/instruments.js'

const DAY_MS = 86400000
const WEEK_MS = 7 * DAY_MS

export function todayISO() {
  return toISO(new Date())
}

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Accepte indifféremment une chaîne ISO ou un Date ; renvoie un Date à minuit. */
export function asDate(date) {
  const d = typeof date === 'string' ? parseISO(date) : new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, n) {
  const d = asDate(date)
  d.setDate(d.getDate() + n)
  return d
}

/** Lundi de la semaine contenant `date`. */
export function mondayOf(date) {
  const d = asDate(date)
  const dow = (d.getDay() + 6) % 7 // 0 = lundi
  d.setDate(d.getDate() - dow)
  return d
}

/** Clé de jour de semaine ('mon'…'sun') utilisée par WEEKLY_ROTATION. */
export function dayKey(date) {
  return DAY_KEYS[asDate(date).getDay()]
}

/**
 * Programme du jour : { main: { instrument, session }, secondary }.
 * `main.instrument` vaut 'libre' le dimanche (composition, hors adhérence).
 * Simple lecture de la config — rien n'est imposé à l'utilisateur.
 */
export function getRotationForDate(date) {
  return WEEKLY_ROTATION[dayKey(date)] ?? { main: { instrument: 'libre', session: null }, secondary: null }
}

/** Nombre de semaines pleines (lundi → lundi) écoulées entre deux dates. */
export function weeksBetween(fromDate, toDate) {
  return Math.round((mondayOf(toDate) - mondayOf(fromDate)) / WEEK_MS)
}

/**
 * Tonalité en cours : une entrée du cercle des quintes toutes les
 * KEY_CYCLE_WEEKS semaines depuis `cycleStartDate` (réglages).
 * Sans date de départ configurée, on reste sur la première tonalité.
 */
export function getKeyOfWeek(date, cycleStartDate) {
  if (!cycleStartDate) return CIRCLE_OF_FIFTHS[0]
  const step = Math.floor(weeksBetween(cycleStartDate, date) / KEY_CYCLE_WEEKS)
  const i = ((step % CIRCLE_OF_FIFTHS.length) + CIRCLE_OF_FIFTHS.length) % CIRCLE_OF_FIFTHS.length
  return CIRCLE_OF_FIFTHS[i]
}

/** Jours restants sur la tonalité en cours (pour l'affichage « change dans N j »). */
export function daysLeftOnKey(date, cycleStartDate) {
  if (!cycleStartDate) return null
  const weeks = weeksBetween(cycleStartDate, date)
  const weeksDone = ((weeks % KEY_CYCLE_WEEKS) + KEY_CYCLE_WEEKS) % KEY_CYCLE_WEEKS
  const nextSwitch = addDays(mondayOf(date), (KEY_CYCLE_WEEKS - weeksDone) * 7)
  return Math.round((nextSwitch - asDate(date)) / DAY_MS)
}

export function formatDateFR(iso) {
  return parseISO(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Nombre de jours entre aujourd'hui et `iso` (négatif si passé). */
export function daysUntil(iso) {
  if (!iso) return null
  return Math.round((asDate(iso) - asDate(new Date())) / DAY_MS)
}

/** Nombre de jours écoulés depuis `iso` (0 = aujourd'hui). */
export function daysSince(iso, from = new Date()) {
  return Math.round((asDate(from) - asDate(iso)) / DAY_MS)
}

/** Les `n` derniers jours en ISO, du plus ancien au plus récent (inclut `end`). */
export function lastDays(n, end = new Date()) {
  return Array.from({ length: n }, (_, i) => toISO(addDays(end, i - (n - 1))))
}
