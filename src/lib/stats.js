// Calculs dérivés des séances : XP, niveau, streak, volume hebdo, fraîcheur.
// Fonctions pures — elles ne lisent que le tableau `sessions`.

import { INSTRUMENTS, XP_CAP_MINUTES, freshnessFor } from '../config/instruments.js'
import { addDays, asDate, daysSince, lastDays, toISO, todayISO } from './cycle.js'

export { XP_CAP_MINUTES }

export function sortedSessions(sessions) {
  return [...sessions].sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)))
}

export function sessionsOn(sessions, dateStr) {
  return sessions.filter((s) => s.date === dateStr)
}

/** Minutes par instrument sur une liste de séances déjà filtrée. */
export function minutesByInstrument(sessions) {
  const out = {}
  for (const s of sessions) out[s.instrument] = (out[s.instrument] ?? 0) + (s.minutes || 0)
  return out
}

/**
 * 1 XP par minute, plafonné à XP_CAP_MINUTES par instrument et par jour :
 * au-delà, les minutes supplémentaires sur le même instrument ne rapportent
 * plus rien ce jour-là (anti-bourrage — l'alternance prime sur le volume).
 */
export function computeXpForDay(sessions, dateStr) {
  const byInstrument = minutesByInstrument(sessionsOn(sessions, dateStr))
  return Object.values(byInstrument).reduce((sum, min) => sum + Math.min(min, XP_CAP_MINUTES), 0)
}

/** XP cumulé sur tout l'historique (plafond appliqué jour par jour). */
export function computeXpTotal(sessions) {
  const perDay = new Map() // date -> { instrument: minutes }
  for (const s of sessions) {
    if (!perDay.has(s.date)) perDay.set(s.date, {})
    const day = perDay.get(s.date)
    day[s.instrument] = (day[s.instrument] ?? 0) + (s.minutes || 0)
  }
  let total = 0
  for (const day of perDay.values()) {
    for (const min of Object.values(day)) total += Math.min(min, XP_CAP_MINUTES)
  }
  return total
}

// Palier n → n+1 : 100 × n XP (0 / 100 / 300 / 600 / 1000…).
const LEVEL_STEP = 100

/** Niveau et progression vers le suivant. */
export function levelForXp(xp) {
  let level = 1
  let floor = 0
  let next = LEVEL_STEP
  while (xp >= next) {
    level += 1
    floor = next
    next += LEVEL_STEP * level
  }
  return {
    level,
    xpIntoLevel: xp - floor,
    xpForLevel: next - floor,
    toNext: next - xp,
    progress: (xp - floor) / (next - floor),
  }
}

/**
 * Jours consécutifs avec au moins une séance. Le jour courant n'est pas
 * comptabilisé tant qu'il est vide mais ne casse pas la série : on a jusqu'à
 * minuit pour jouer.
 */
export function computeStreak(sessions, today = todayISO()) {
  const days = new Set(sessions.map((s) => s.date))
  if (!days.size) return 0
  let cursor = asDate(today)
  if (!days.has(toISO(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (days.has(toISO(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Minutes par instrument sur les 7 derniers jours (jour courant inclus). */
export function computeWeekMinutesByInstrument(sessions, end = todayISO()) {
  const window = new Set(lastDays(7, asDate(end)))
  return minutesByInstrument(sessions.filter((s) => window.has(s.date)))
}

/**
 * Dernière pratique par instrument, avec un statut de fraîcheur dépendant de
 * la priorité de l'instrument (config) : 'ok' | 'warn' | 'stale' | 'never'.
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

/** Minutes totales par date (pour le calendrier de l'historique). */
export function minutesByDate(sessions) {
  const out = {}
  for (const s of sessions) out[s.date] = (out[s.date] ?? 0) + (s.minutes || 0)
  return out
}

export function totalMinutes(sessions) {
  return sessions.reduce((sum, s) => sum + (s.minutes || 0), 0)
}
