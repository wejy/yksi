// Based on ui/dashboard_korjattu/code.html (progress ring)
import * as React from 'react'
import { cn } from '../lib/utils'

export function ProgressRing({
  completed,
  total,
  size = 120,
  className,
}: {
  completed: number
  total: number
  size?: number
  className?: string
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const progress = total > 0 ? completed / total : 0
  const offset = circumference - progress * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          className="text-surface-container"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-on-surface">
          {completed}/{total}
        </span>
        <span className="text-xs text-on-surface-variant">valmis</span>
      </div>
    </div>
  )
}
