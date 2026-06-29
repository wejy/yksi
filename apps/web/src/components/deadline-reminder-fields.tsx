'use client'

import { DEADLINE_LABEL, REMINDER_LABEL } from '@yksi/core'

interface DeadlineReminderFieldsProps {
  deadline: string
  reminder: string
  onDeadlineChange: (value: string) => void
  onReminderChange: (value: string) => void
  className?: string
}

const inputClassName =
  'w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface'

export function DeadlineReminderFields({
  deadline,
  reminder,
  onDeadlineChange,
  onReminderChange,
  className,
}: DeadlineReminderFieldsProps) {
  function copyDeadlineToReminder() {
    if (!deadline) return
    onReminderChange(deadline)
  }

  function setSameAsDeadline() {
    onReminderChange(deadline)
  }

  const sameAsDeadline = Boolean(deadline && reminder && deadline === reminder)

  return (
    <div className={className}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {DEADLINE_LABEL}
          </label>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => onDeadlineChange(e.target.value)}
            className={inputClassName}
          />
          {deadline ? (
            <button
              type="button"
              onClick={() => onDeadlineChange('')}
              className="mt-1 text-xs text-on-surface-variant underline hover:text-on-surface"
            >
              Tyhjennä deadline
            </button>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-on-surface-variant">
            {REMINDER_LABEL}
          </label>
          <input
            type="datetime-local"
            value={reminder}
            onChange={(e) => onReminderChange(e.target.value)}
            className={inputClassName}
          />
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
            <button
              type="button"
              onClick={copyDeadlineToReminder}
              disabled={!deadline}
              className="text-xs text-primary underline hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Kopioi deadlinesta
            </button>
            <button
              type="button"
              onClick={setSameAsDeadline}
              disabled={!deadline || sameAsDeadline}
              className="text-xs text-primary underline hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Sama kuin deadline
            </button>
            {reminder ? (
              <button
                type="button"
                onClick={() => onReminderChange('')}
                className="text-xs text-on-surface-variant underline hover:text-on-surface"
              >
                Tyhjennä hälytys
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <p className="mt-2 text-xs text-on-surface-variant">
        Deadline ja hälytysaika voivat olla eri tai samat. Kopioi deadlinesta tai aseta sama aika
        hälytykseen yhdellä napilla.
      </p>
    </div>
  )
}
