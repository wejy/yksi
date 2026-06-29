import type { CSSProperties } from 'react'
import { GoogleCalendarLogo } from '../assets/integrations/google-calendar-logo'
import { LinearLogo } from '../assets/integrations/linear-logo'
import { NotionLogo } from '../assets/integrations/notion-logo'
import { cn } from '../lib/utils'

const PROVIDER_LOGO_CLASS: Record<string, string> = {
  notion: 'text-on-surface',
  google_calendar: 'text-on-surface',
}

export function IntegrationLogo({
  provider,
  className,
  size = 24,
  fallbackIcon = 'extension',
}: {
  provider: string
  className?: string
  size?: number
  fallbackIcon?: string
}) {
  const style: CSSProperties = { width: size, height: size }
  const logoClass = cn('shrink-0', PROVIDER_LOGO_CLASS[provider], className)

  switch (provider) {
    case 'linear':
      return <LinearLogo className={cn('shrink-0', className)} style={style} />
    case 'notion':
      return <NotionLogo className={logoClass} style={style} />
    case 'google_calendar':
      return <GoogleCalendarLogo className={logoClass} style={style} />
    default:
      return (
        <span
          className={cn('material-symbols-outlined shrink-0 text-on-surface-variant', className)}
          style={{ fontSize: size }}
          aria-hidden
        >
          {fallbackIcon}
        </span>
      )
  }
}
