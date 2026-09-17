// Tout ce qui vit dans le localStorage : réglages (dont le token), cache des
// données, partie en cours et file d'attente des écritures hors-ligne.

const KEYS = {
  settings: 'poly.settings',
  cache: 'poly.data-cache',
  gameDraft: 'poly.game-draft',
  pending: 'poly.pending',
}

const DEFAULT_SETTINGS = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  path: 'data.json',
  tokenExpires: '', // date d'expiration du PAT (saisie manuelle) pour l'alerte
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / navigation privée : on ignore */
  }
}

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) })
export const saveSettings = (s) => write(KEYS.settings, s)

export const loadCache = () => read(KEYS.cache, null)
export const saveCache = (data) => write(KEYS.cache, data)

// Partie en cours (accord affiché, réponses non encore commitées) : on ne
// perd pas une partie commencée dans le métro parce que l'écran s'est verrouillé.
export const loadGameDraft = () => read(KEYS.gameDraft, null)
export const saveGameDraft = (d) => write(KEYS.gameDraft, d)
export const clearGameDraft = () => write(KEYS.gameDraft, null)

// File d'attente des écritures non synchronisées : [{ id, op, message, createdAt }]
export const loadPending = () => read(KEYS.pending, [])
export const savePending = (list) => write(KEYS.pending, list.length ? list : null)

export function isConfigured(s) {
  return Boolean(s.token && s.owner && s.repo)
}
