import { useCallback, useState } from 'react'
import { loadSettings, saveSettings } from '../lib/storage.js'

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings)
  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])
  return [settings, update]
}
