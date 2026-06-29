import { cn } from '../lib/utils'

export function YksiLogoMark({
  href = '/',
  className,
}: {
  href?: string
  className?: string
}) {
  return (
    <a
      href={href}
      aria-label="Yksi etusivu"
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold lowercase text-on-primary transition-opacity hover:opacity-90',
        className,
      )}
    >
      y
    </a>
  )
}
