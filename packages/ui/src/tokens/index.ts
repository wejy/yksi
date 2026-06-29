// Design tokens from ui/unified_design_system/DESIGN.md

export const colors = {
  surface: '#f8f9ff',
  'surface-dim': '#cbdbf5',
  'surface-bright': '#f8f9ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#eff4ff',
  'surface-container': '#e5eeff',
  'surface-container-high': '#dce9ff',
  'surface-container-highest': '#d3e4fe',
  'on-surface': '#0b1c30',
  'on-surface-variant': '#464555',
  'inverse-surface': '#213145',
  'inverse-on-surface': '#eaf1ff',
  outline: '#777587',
  'outline-variant': '#c7c4d8',
  'surface-tint': '#4d44e3',
  primary: '#3525cd',
  'on-primary': '#ffffff',
  'primary-container': '#4f46e5',
  'on-primary-container': '#dad7ff',
  'inverse-primary': '#c3c0ff',
  secondary: '#5c5f61',
  'on-secondary': '#ffffff',
  'secondary-container': '#e0e3e5',
  'on-secondary-container': '#626567',
  tertiary: '#7e3000',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#a44100',
  'on-tertiary-container': '#ffd2be',
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',
  background: '#f8f9ff',
  'on-background': '#0b1c30',
  'surface-variant': '#d3e4fe',
} as const

export const spacing = {
  base: '4px',
  'container-padding': '24px',
  gutter: '16px',
  'stack-sm': '8px',
  'stack-md': '16px',
  'stack-lg': '32px',
} as const

export const borderRadius = {
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
} as const

export const typography = {
  h1: { fontSize: '36px', fontWeight: '700', lineHeight: '40px' },
  h2: { fontSize: '30px', fontWeight: '600', lineHeight: '36px' },
  h3: { fontSize: '24px', fontWeight: '600', lineHeight: '32px' },
  'h1-mobile': { fontSize: '28px', fontWeight: '700', lineHeight: '34px' },
  'body-lg': { fontSize: '18px', fontWeight: '400', lineHeight: '28px' },
  'body-base': { fontSize: '16px', fontWeight: '400', lineHeight: '24px' },
  'body-sm': { fontSize: '14px', fontWeight: '400', lineHeight: '20px' },
  'label-md': { fontSize: '14px', fontWeight: '500', lineHeight: '20px' },
  'label-sm': { fontSize: '12px', fontWeight: '500', lineHeight: '16px' },
} as const

export const priorityLabels = {
  urgent: 'Korkea',
  high: 'Korkea',
  medium: 'Normaali',
  low: 'Matala',
  none: '',
} as const

export const navItems = [
  { id: 'dashboard', icon: 'dashboard', label: 'Etusivu' },
  { id: 'tasks', icon: 'checklist', label: 'Tehtävät' },
  { id: 'calendar', icon: 'calendar_month', label: 'Kalenteri' },
  { id: 'profile', icon: 'person', label: 'Profiili' },
] as const

/** Fixed BottomNav bar height (excludes safe-area inset). */
export const BOTTOM_NAV_HEIGHT_PX = 64

/** Extra scroll padding below main content so it clears the fixed nav. */
export const BOTTOM_NAV_CONTENT_GAP_PX = 24

/** Page/container padding below scrollable content (web). */
export const bottomNavPaddingClass =
  'pb-[calc(4rem+1.5rem+env(safe-area-inset-bottom,0px))]'

/** FAB offset above the fixed BottomNav (web). */
export const fabOffsetClass =
  'bottom-[calc(4rem+1rem+env(safe-area-inset-bottom,0px))]'

/** Bottom padding for detail screens without BottomNav. */
export const screenBottomPaddingClass =
  'pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]'
