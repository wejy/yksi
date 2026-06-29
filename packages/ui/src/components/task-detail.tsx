// Based on ui/teht_v_n_tiedot/code.html
import * as React from 'react'
import { cn } from '../lib/utils'

export function BentoSettingCard({
  icon,
  label,
  value,
  onClick,
  className,
}: {
  icon: string
  label: string
  value: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-left transition-colors hover:border-primary/30',
        className,
      )}
    >
      <span className="material-symbols-outlined text-primary">{icon}</span>
      <span className="text-xs text-on-surface-variant">{label}</span>
      <span className="text-sm font-semibold text-on-surface">{value}</span>
    </button>
  )
}

export function SubtaskList({
  items,
  onToggle,
  onAdd,
}: {
  items: { id: string; title: string; done: boolean }[]
  onToggle: (id: string) => void
  onAdd: (title: string) => void
}) {
  const [newTitle, setNewTitle] = React.useState('')

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-on-surface">
        Alitehtävät ({items.filter((i) => i.done).length}/{items.length})
      </h3>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => onToggle(item.id)}
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded border-2',
              item.done
                ? 'border-primary bg-primary text-on-primary'
                : 'border-outline-variant',
            )}
          >
            {item.done && (
              <span className="material-symbols-outlined text-sm">check</span>
            )}
          </button>
          <span className={cn('text-sm', item.done && 'line-through opacity-60')}>
            {item.title}
          </span>
        </div>
      ))}
      <input
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && newTitle.trim()) {
            onAdd(newTitle.trim())
            setNewTitle('')
          }
        }}
        placeholder="Lisää alitehtävä..."
        className="w-full rounded-lg border border-outline-variant bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}
