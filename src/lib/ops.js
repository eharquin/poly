// Opérations d'écriture sérialisables (pour la file d'attente hors-ligne).
// Chaque op est un objet JSON ; `applyOp` la rejoue sur une copie des données.
//
// Une séance est identifiée par son `id` (et non par date+instrument) : rien
// n'interdit deux séances du même instrument le même jour, et les champs des
// phases suivantes (drillId, tempsMs, tempo, boxLeitner…) se rangeront dans
// le même objet sans changer ces opérations.

/** Identifiant court et trié chronologiquement (base36 du temps + aléa). */
export function newSessionId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function upsertSession(session) {
  return { type: 'upsertSession', session }
}

export function deleteSession(id) {
  return { type: 'deleteSession', id }
}

/** Remplace toutes les séances (import d'une sauvegarde JSON). */
export function replaceSessions(sessions) {
  return { type: 'replaceSessions', sessions }
}

function sortSessions(sessions) {
  return sessions.sort((a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)))
}

export function applyOp(data, op) {
  switch (op.type) {
    case 'upsertSession':
      data.sessions = sortSessions([...data.sessions.filter((s) => s.id !== op.session.id), op.session])
      return data
    case 'deleteSession':
      data.sessions = data.sessions.filter((s) => s.id !== op.id)
      return data
    case 'replaceSessions':
      data.sessions = sortSessions([...op.sessions])
      return data
    default:
      return data
  }
}

/** Rejoue une liste d'ops sur des données (clone). */
export function applyOps(data, ops) {
  return ops.reduce((d, item) => applyOp(d, item.op), structuredClone(data))
}

/** Erreur réseau (hors-ligne, DNS…) par opposition à une erreur renvoyée par GitHub. */
export function isNetworkError(e) {
  return e instanceof TypeError || (typeof navigator !== 'undefined' && navigator.onLine === false)
}
