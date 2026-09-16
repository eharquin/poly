// Accès au fichier data.json via l'API GitHub REST (Contents API).
// Le token n'est jamais persisté ailleurs que dans le localStorage.

const API = 'https://api.github.com'

export const EMPTY_DATA = { sessions: [] }

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function contentsUrl({ owner, repo, path }) {
  return `${API}/repos/${owner}/${repo}/contents/${path.split('/').map(encodeURIComponent).join('/')}`
}

// base64 <-> UTF-8 (btoa/atob ne gèrent pas les accents directement)
function encodeBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

function decodeBase64(b64) {
  const bin = atob(b64.replace(/\n/g, ''))
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function handle(res) {
  if (res.ok) return res.json()
  let msg = `${res.status} ${res.statusText}`
  try {
    const body = await res.json()
    if (body.message) msg += ` — ${body.message}`
  } catch {
    /* pas de corps JSON */
  }
  const err = new Error(msg)
  err.status = res.status
  throw err
}

/**
 * Lit data.json. Retourne { data, sha } ; sha = null si le fichier n'existe
 * pas encore. Les clés inconnues du fichier sont conservées telles quelles :
 * une phase ultérieure peut ajouter ses propres sections sans qu'un client
 * plus ancien les efface au prochain commit.
 */
export async function fetchData(settings) {
  const url = `${contentsUrl(settings)}?ref=${encodeURIComponent(settings.branch)}`
  const res = await fetch(url, { headers: headers(settings.token), cache: 'no-store' })
  if (res.status === 404) return { data: { ...EMPTY_DATA }, sha: null }
  const json = await handle(res)
  const parsed = JSON.parse(decodeBase64(json.content))
  return {
    data: { ...parsed, sessions: parsed.sessions ?? [] },
    sha: json.sha,
  }
}

/** Écrit data.json (crée le fichier si sha = null). Retourne le nouveau sha. */
export async function putData(settings, data, sha, message) {
  const body = {
    message,
    content: encodeBase64(JSON.stringify(data, null, 2) + '\n'),
    branch: settings.branch,
  }
  if (sha) body.sha = sha
  const res = await fetch(contentsUrl(settings), {
    method: 'PUT',
    headers: { ...headers(settings.token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await handle(res)
  return json.content.sha
}

/**
 * Applique `mutate(data)` sur la version la plus fraîche du fichier et commit.
 * En cas de conflit de sha (409/422), on relit et on réessaie une fois.
 */
export async function commitData(settings, mutate, message) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { data, sha } = await fetchData(settings)
    const next = mutate(structuredClone(data))
    try {
      const newSha = await putData(settings, next, sha, message)
      return { data: next, sha: newSha }
    } catch (e) {
      if (attempt === 0 && (e.status === 409 || e.status === 422)) continue
      throw e
    }
  }
}

/** Vérifie le token et l'accès au repo. */
export async function testConnection(settings) {
  const res = await fetch(`${API}/repos/${settings.owner}/${settings.repo}`, {
    headers: headers(settings.token),
  })
  const json = await handle(res)
  return { fullName: json.full_name, permissions: json.permissions }
}
