'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import type { TaskContentDocument } from '@yksi/core'
import { emptyTaskContent } from '@yksi/core'
import { useI18n } from '@yksi/i18n/react'
import type { Locale } from '@yksi/i18n'
import { useTheme } from '@/components/theme-provider'
import { getBlockNoteDictionary } from '@/lib/blocknote-dictionary'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/shadcn/style.css'

interface TaskContentEditorProps {
  value: TaskContentDocument | null
  onChange: (value: TaskContentDocument) => void
  editable?: boolean
  className?: string
}

function TaskContentEditorInner({
  value,
  onChange,
  editable = true,
  className,
  locale,
  resolvedTheme,
}: TaskContentEditorProps & { locale: Locale; resolvedTheme: 'light' | 'dark' }) {
  const dictionary = useMemo(() => getBlockNoteDictionary(locale), [locale])
  const initialContent = useMemo(
    () => (value?.length ? value : emptyTaskContent()) as never,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only initial mount
    [],
  )

  const editor = useCreateBlockNote({ initialContent, dictionary })

  useEffect(() => {
    return editor.onChange(() => {
      onChange(editor.document as unknown as TaskContentDocument)
    })
  }, [editor, onChange])

  return (
    <div className={`task-content-editor ${className ?? ''}`}>
      <BlockNoteView editor={editor} editable={editable} theme={resolvedTheme} />
    </div>
  )
}

export function TaskContentEditor(props: TaskContentEditorProps) {
  const { locale } = useI18n()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        className={`task-content-editor min-h-32 animate-pulse rounded-lg bg-surface-container ${props.className ?? ''}`}
      />
    )
  }

  return <TaskContentEditorInner key={`${locale}-${resolvedTheme}`} {...props} locale={locale} resolvedTheme={resolvedTheme} />
}

interface TaskContentViewerProps {
  value: TaskContentDocument | null
  className?: string
}

function TaskContentViewerInner({
  value,
  className,
  locale,
  resolvedTheme,
}: TaskContentViewerProps & { locale: Locale; resolvedTheme: 'light' | 'dark' }) {
  const dictionary = useMemo(() => getBlockNoteDictionary(locale), [locale])
  const editor = useCreateBlockNote({
    initialContent: (value?.length ? value : undefined) as never,
    dictionary,
  })

  useEffect(() => {
    if (!editor || !value?.length) return
    editor.replaceBlocks(editor.document, value as never)
  }, [editor, value])

  return (
    <div className={`task-content-viewer rounded-lg border border-outline-variant bg-surface-container-lowest p-3 ${className ?? ''}`}>
      <BlockNoteView editor={editor} editable={false} theme={resolvedTheme} />
    </div>
  )
}

export function TaskContentViewer({ value, className }: TaskContentViewerProps) {
  const { locale } = useI18n()
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!value?.length) {
    return (
      <p className="text-sm italic text-on-surface-variant">
        {locale === 'en' ? 'No description.' : 'Ei kuvausta.'}
      </p>
    )
  }

  if (!mounted) {
    return (
      <div
        className={`min-h-24 animate-pulse rounded-lg border border-outline-variant bg-surface-container-lowest p-3 ${className ?? ''}`}
      />
    )
  }

  return <TaskContentViewerInner key={`${locale}-${resolvedTheme}`} value={value} className={className} locale={locale} resolvedTheme={resolvedTheme} />
}
