import * as React from 'react'
import { cn } from '../lib/utils'
import { fabOffsetClass } from '../tokens'

export function SearchBar({
  value,
  onChange,
  onFilter,
  placeholder = 'Etsi tehtäviä...',
  className,
}: {
  value: string
  onChange: (value: string) => void
  onFilter?: () => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={cn('flex gap-2', className)}>
      <div className="relative flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-low pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {onFilter && (
        <button
          type="button"
          onClick={onFilter}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant hover:bg-surface-container-low"
          aria-label="Suodata"
        >
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      )}
    </div>
  )
}

export function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string
  active?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap',
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
      )}
    >
      {label}
    </button>
  )
}

export function Fab({ onClick, className }: { onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform active:scale-95',
        fabOffsetClass,
        className,
      )}
      aria-label="Lisää tehtävä"
    >
      <span className="material-symbols-outlined text-2xl">add</span>
    </button>
  )
}
