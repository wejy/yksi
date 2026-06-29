import { cn } from '../lib/utils'

export function AddTaskButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80',
        className,
      )}
    >
      <span className="material-symbols-outlined text-[20px] leading-none">add</span>
      Lisää tehtävä
    </button>
  )
}
