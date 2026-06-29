'use client'

import { formatTaskCountBadge } from '@yksi/core'
import { cn } from '../lib/utils'

export function CalendarTaskCountBadge({
  count,
  selected = false,
  className,
}: {
  count: number
  selected?: boolean
  className?: string
}) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        'inline-flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none',
        selected
          ? 'bg-on-primary/25 text-on-primary ring-1 ring-on-primary/40'
          : 'bg-primary text-on-primary shadow-sm',
        className,
      )}
    >
      {formatTaskCountBadge(count)}
    </span>
  )
}

export function CalendarDayTaskIndicator({
  count,
  selected = false,
}: {
  count: number
  selected?: boolean
}) {
  if (count <= 0) {
    return <span className="h-[18px]" aria-hidden />
  }

  return (
    <div className="flex w-full flex-col items-center gap-0.5">
      <div
        className={cn(
          'h-1 w-5 rounded-full',
          selected ? 'bg-on-primary/50' : 'bg-primary/35',
        )}
      />
      <CalendarTaskCountBadge count={count} selected={selected} />
    </div>
  )
}
