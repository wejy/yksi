'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@yksi/core'
import {
  applyResolvedTheme,
  getSystemPrefersDark,
  storeThemePreference,
} from '@/lib/theme'

interface ThemeContextValue {
  theme: ThemePreference
  resolvedTheme: ResolvedTheme
  setTheme: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({
  children,
  initialTheme,
  persistTheme,
}: {
  children: ReactNode
  initialTheme?: ThemePreference
  persistTheme?: (preference: ThemePreference) => void | Promise<void>
}) {
  const [theme, setThemeState] = useState<ThemePreference>(
    () => initialTheme ?? DEFAULT_THEME_PREFERENCE,
  )
  const [prefersDark, setPrefersDark] = useState(false)

  useEffect(() => {
    if (initialTheme && isThemePreference(initialTheme)) {
      setThemeState(initialTheme)
    }
  }, [initialTheme])

  useEffect(() => {
    setPrefersDark(getSystemPrefersDark())
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setPrefersDark(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const resolvedTheme = useMemo(
    () => resolveTheme(theme, prefersDark),
    [theme, prefersDark],
  )

  useEffect(() => {
    storeThemePreference(theme)
    applyResolvedTheme(resolvedTheme)
  }, [theme, resolvedTheme])

  const setTheme = useCallback(
    (preference: ThemePreference) => {
      setThemeState(preference)
      void persistTheme?.(preference)
    },
    [persistTheme],
  )

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}
