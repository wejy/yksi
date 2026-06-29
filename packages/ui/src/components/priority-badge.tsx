import * as React from 'react'
import { cn } from '../lib/utils'
import type { TaskPriority } from '@yksi/core'
import { priorityLabels } from '../tokens'

const priorityStyles: Record<TaskPriority, string> = {
  urgent: 'bg-error-container text-on-error-container',
  high: 'bg-error-container text-on-error-container',
  medium: 'bg-tertiary-container/20 text-tertiary',
  low: 'bg-surface-container text-on-surface-variant',
  none: 'hidden',
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority
  className?: string
}) {
  const label = priorityLabels[priority]
  if (!label) return null

  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        priorityStyles[priority],
        className,
      )}
    >
      {label}
    </span>
  )
}
