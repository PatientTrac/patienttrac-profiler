import { useState, useEffect, useCallback, useRef } from 'react'
import type { ProfileFormData, SavedProgress } from '../types'

const STORAGE_KEY = 'ptrac_profiler_progress'
const AUTOSAVE_DELAY = 1500 // ms

interface UseProgressReturn {
  savedStep:   number
  savedData:   Partial<ProfileFormData>
  saveProgress: (step: number, data: Partial<ProfileFormData>) => void
  clearProgress: () => void
  lastSaved:   Date | null
  isSaving:    boolean
}

export function useProgress(sessionKey: string): UseProgressReturn {
  const key = `${STORAGE_KEY}_${sessionKey}`
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isSaving,  setIsSaving]  = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Load on mount
  const [initial] = useState<SavedProgress | null>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as SavedProgress) : null
    } catch {
      return null
    }
  })

  const saveProgress = useCallback((step: number, data: Partial<ProfileFormData>) => {
    // Debounce
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsSaving(true)

    timerRef.current = setTimeout(() => {
      try {
        const progress: SavedProgress = { step, formData: data, savedAt: new Date().toISOString() }
        localStorage.setItem(key, JSON.stringify(progress))
        setLastSaved(new Date())
      } catch {
        // localStorage may be unavailable in private browsing
        console.warn('Could not save progress to localStorage')
      } finally {
        setIsSaving(false)
      }
    }, AUTOSAVE_DELAY)
  }, [key])

  const clearProgress = useCallback(() => {
    try {
      localStorage.removeItem(key)
    } catch { /* noop */ }
  }, [key])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return {
    savedStep:    initial?.step    ?? 0,
    savedData:    initial?.formData ?? {},
    saveProgress,
    clearProgress,
    lastSaved,
    isSaving,
  }
}
