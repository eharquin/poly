import { useCallback, useEffect, useRef, useState } from 'react'
import { commitData, EMPTY_DATA, fetchData } from '../lib/github.js'
import { applyOp, applyOps, isNetworkError } from '../lib/ops.js'
import { isConfigured, loadCache, loadPending, saveCache, savePending } from '../lib/storage.js'

/**
 * Source de vérité = data.json sur GitHub. Le cache localStorage sert
 * d'affichage immédiat / hors-ligne. Les écritures qui échouent faute de
 * réseau sont mises en file d'attente et rejouées au retour de la connexion ;
 * une erreur d'authentification ou de droits n'est PAS mise en file, elle
 * remonte immédiatement à l'appelant.
 */
export function useData(settings) {
  const [data, setData] = useState(() => {
    const cached = loadCache() ?? EMPTY_DATA
    return applyOps(cached, loadPending())
  })
  const [pending, setPending] = useState(loadPending)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastSync, setLastSync] = useState(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const flushing = useRef(false)

  const applyLocal = useCallback((fresh, queue) => {
    saveCache(fresh)
    setData(applyOps(fresh, queue))
  }, [])

  /** Rejoue la file d'attente dans l'ordre ; s'arrête à la première erreur réseau. */
  const flush = useCallback(async () => {
    if (flushing.current || !isConfigured(settings)) return
    let queue = loadPending()
    if (!queue.length) return
    flushing.current = true
    try {
      while (queue.length) {
        const item = queue[0]
        const { data: next } = await commitData(settings, (d) => applyOp(d, item.op), item.message)
        queue = queue.slice(1)
        savePending(queue)
        setPending(queue)
        applyLocal(next, queue)
        setLastSync(new Date())
      }
      setError(null)
    } catch (e) {
      if (!isNetworkError(e)) {
        setError(`Synchronisation en attente : ${e.message}`)
      }
    } finally {
      flushing.current = false
    }
  }, [settings, applyLocal])

  const refresh = useCallback(async () => {
    if (!isConfigured(settings)) return
    setLoading(true)
    setError(null)
    try {
      await flush()
      const { data: fresh } = await fetchData(settings)
      applyLocal(fresh, loadPending())
      setLastSync(new Date())
    } catch (e) {
      setError(isNetworkError(e) ? 'Hors-ligne — données du cache local' : e.message)
    } finally {
      setLoading(false)
    }
  }, [settings, flush, applyLocal])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Retour du réseau → on rejoue la file
  useEffect(() => {
    const up = () => {
      setOnline(true)
      refresh()
    }
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [refresh])

  /**
   * Applique une op et la commit sur GitHub. Sans réseau, l'op est appliquée
   * localement et mise en attente : retourne { queued: true }.
   * Les autres erreurs (token, droits…) sont levées.
   */
  const commit = useCallback(
    async (op, message) => {
      try {
        await flush()
        const { data: next } = await commitData(settings, (d) => applyOp(d, op), message)
        applyLocal(next, [])
        setLastSync(new Date())
        return { queued: false }
      } catch (e) {
        if (!isNetworkError(e)) throw e
        const queue = [...loadPending(), { id: Date.now(), op, message, createdAt: new Date().toISOString() }]
        savePending(queue)
        setPending(queue)
        setData((d) => applyOp(structuredClone(d), op))
        return { queued: true }
      }
    },
    [settings, flush, applyLocal],
  )

  return { data, loading, error, lastSync, online, pending, refresh, commit }
}
