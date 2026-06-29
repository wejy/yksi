import { cn } from '../lib/utils'

export interface IntressiBadgeProps {
  name: string
  color?: string | null
  icon?: string | null
  size?: 'sm' | 'md'
  className?: string
}

export type TaskIntressiDisplay = Pick<IntressiBadgeProps, 'name' | 'color' | 'icon'>

export function IntressiBadge({
  name,
  color,
  icon,
  size = 'sm',
  className,
}: IntressiBadgeProps) {
  const iconSize = size === 'sm' ? 'text-sm' : 'text-base'
  const fallbackIcon = icon ?? (color ? null : 'target')

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-full font-medium text-on-surface',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        !color && 'bg-surface-container',
        className,
      )}
      style={color ? { backgroundColor: `${color}22` } : undefined}
    >
      {color ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : null}
      {fallbackIcon ? (
        <span
          className={cn('material-symbols-outlined shrink-0', iconSize)}
          style={color ? { color } : undefined}
        >
          {fallbackIcon}
        </span>
      ) : null}
      <span className="truncate">{name}</span>
    </span>
  )
}
