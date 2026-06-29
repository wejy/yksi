import * as React from 'react'
import { cn } from '../lib/utils'
import { navItems } from '../tokens'

export interface TopAppBarProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
  onNotifications?: () => void
  rightAction?: React.ReactNode
  className?: string
}

export function TopAppBar({
  title = 'Yksi',
  showBack,
  onBack,
  onNotifications,
  rightAction,
  className,
}: TopAppBarProps) {
  return (
    <header
      className={cn(
        'fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/50 bg-surface-container-lowest/80 px-4 backdrop-blur-md',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
            aria-label="Takaisin"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        ) : (
          <div className="h-8 w-8 rounded-full bg-primary-container" />
        )}
        <h1 className="text-lg font-bold text-on-surface">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {rightAction}
        {onNotifications && (
          <button
            type="button"
            onClick={onNotifications}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low"
            aria-label="Ilmoitukset"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        )}
      </div>
    </header>
  )
}

export interface BottomNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
  labels?: Partial<Record<string, string>>
  className?: string
}

export function BottomNav({ activeTab, onTabChange, labels, className }: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 flex min-h-16 items-center justify-around border-t border-outline-variant/50 bg-surface-container-lowest/90 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md',
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors',
              isActive ? 'text-primary' : 'text-on-surface-variant',
            )}
          >
            <span
              className="material-symbols-outlined text-2xl"
              style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
              {item.icon}
            </span>
            <span className="font-medium">{labels?.[item.id] ?? item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
