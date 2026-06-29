import {
  DEFAULT_THEME_PREFERENCE,
  isThemePreference,
  resolveTheme,
  type ResolvedTheme,
  type ThemePreference,
} from '@yksi/core'

export const THEME_STORAGE_KEY = 'yksi_theme'
export const THEME_COOKIE = 'yksi_theme'

export function readStoredTheme(): ThemePreference | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored && isThemePreference(stored)) return stored
  } catch {
    // ignore
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`))
  const cookieValue = match?.[1]
  return cookieValue && isThemePreference(cookieValue) ? cookieValue : null
}

export function storeThemePreference(preference: ThemePreference) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // ignore
  }

  document.cookie = `${THEME_COOKIE}=${preference};path=/;max-age=31536000;SameSite=Lax`
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyResolvedTheme(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export function applyThemePreference(preference: ThemePreference) {
  applyResolvedTheme(resolveTheme(preference, getSystemPrefersDark()))
}

export function getInitialThemePreference(): ThemePreference {
  return readStoredTheme() ?? DEFAULT_THEME_PREFERENCE
}

export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('yksi_theme');if(!t){var m=document.cookie.match(/(?:^|; )yksi_theme=([^;]*)/);t=m&&m[1]}if(t!=='light'&&t!=='dark'&&t!=='system')t='system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`
