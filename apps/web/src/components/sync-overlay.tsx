interface SyncOverlayProps {
  title: string
  description: string
}

export function SyncOverlay({ title, description }: SyncOverlayProps) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 text-center shadow-lg">
        <div
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-outline-variant border-t-primary"
          role="status"
          aria-label="Ladataan"
        />
        <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
        <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
      </div>
    </div>
  )
}
