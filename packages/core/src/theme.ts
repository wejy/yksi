export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

export type ThemePreference = (typeof THEME_PREFERENCES)[number]

export type ResolvedTheme = 'light' | 'dark'

export const DEFAULT_THEME_PREFERENCE: ThemePreference = 'system'

export function isThemePreference(value: string): value is ThemePreference {
  return (THEME_PREFERENCES as readonly string[]).includes(value)
}

export function resolveTheme(
  preference: ThemePreference,
  prefersDark = false,
): ResolvedTheme {
  if (preference === 'system') return prefersDark ? 'dark' : 'light'
  return preference
}
