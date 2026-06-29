'use client'

import type { CalendarViewMode } from '@yksi/core'
import { CALENDAR_VIEW_LABELS, CALENDAR_VIEW_MODES } from '@yksi/core'
import { cn } from '../lib/utils'

export function CalendarViewToggle({
  value,
  onChange,
  className,
}: {
  value: CalendarViewMode
  onChange: (mode: CalendarViewMode) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex rounded-lg border border-outline-variant bg-surface-container-low p-1',
        className,
      )}
    >
      {CALENDAR_VIEW_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === mode
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface',
          )}
        >
          {CALENDAR_VIEW_LABELS[mode]}
        </button>
      ))}
    </div>
  )
}
