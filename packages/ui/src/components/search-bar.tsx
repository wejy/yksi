import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '../lib/utils'
import { fabOffsetClass } from '../tokens'
import { formatFilterCountLabel } from '@yksi/core'

export function SearchBar({
  value,
  onChange,
  placeholder = 'Etsi tehtäviä...',
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <label
      className={cn(
        'group flex h-12 w-full cursor-text items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 transition-colors focus-within:border-primary/35 focus-within:ring-2 focus-within:ring-primary/20',
        className,
      )}
    >
      <span
        className="material-symbols-outlined flex size-6 shrink-0 items-center justify-center text-[22px] leading-none text-on-surface-variant transition-colors group-focus-within:text-primary"
        aria-hidden
      >
        search
      </span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base leading-normal text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  )
}

export function CategoryChip({
  label,
  count,
  color,
  icon,
  active,
  onClick,
}: {
  label: string
  count?: number
  color?: string | null
  icon?: string | null
  active?: boolean
  onClick?: () => void
}) {
  const displayLabel =
    count !== undefined ? formatFilterCountLabel(label, count) : label

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors whitespace-nowrap tabular-nums',
        active
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high',
      )}
      style={!active && color ? { backgroundColor: `${color}18` } : undefined}
    >
      {!active && color ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      ) : null}
      {!active && icon ? (
        <span
          className="material-symbols-outlined text-base"
          style={color ? { color } : undefined}
        >
          {icon}
        </span>
      ) : null}
      {displayLabel}
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
