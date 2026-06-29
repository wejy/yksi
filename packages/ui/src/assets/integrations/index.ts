export type IntegrationLogoId = 'linear' | 'notion' | 'google_calendar'

export const INTEGRATION_LOGO_IDS = [
  'linear',
  'notion',
  'google_calendar',
] as const satisfies readonly IntegrationLogoId[]

export { GoogleCalendarLogo } from './google-calendar-logo'
export { LinearLogo } from './linear-logo'
export { NotionLogo } from './notion-logo'
