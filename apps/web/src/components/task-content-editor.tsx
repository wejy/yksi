'use client'

import { useEffect, useMemo, useState } from 'react'
import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import type { TaskContentDocument } from '@yksi/core'
import { emptyTaskContent } from '@yksi/core'
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
}: TaskContentEditorProps) {
  const initialContent = useMemo(
    () => (value?.length ? value : emptyTaskContent()) as never,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only initial mount
    [],
  )

  const editor = useCreateBlockNote({ initialContent })

  useEffect(() => {
    return editor.onChange(() => {
      onChange(editor.document as unknown as TaskContentDocument)
    })
  }, [editor, onChange])

  return (
    <div className={`task-content-editor ${className ?? ''}`}>
      <BlockNoteView editor={editor} editable={editable} theme="light" />
    </div>
  )
}

export function TaskContentEditor(props: TaskContentEditorProps) {
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

  return <TaskContentEditorInner {...props} />
}

interface TaskContentViewerProps {
  value: TaskContentDocument | null
  className?: string
}

function TaskContentViewerInner({ value, className }: TaskContentViewerProps) {
  const editor = useCreateBlockNote({
    initialContent: (value?.length ? value : undefined) as never,
  })

  useEffect(() => {
    if (!editor || !value?.length) return
    editor.replaceBlocks(editor.document, value as never)
  }, [editor, value])

  return (
    <div className={`task-content-viewer rounded-lg border border-outline-variant bg-surface-container-lowest p-3 ${className ?? ''}`}>
      <BlockNoteView editor={editor} editable={false} theme="light" />
    </div>
  )
}

export function TaskContentViewer({ value, className }: TaskContentViewerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!value?.length) {
    return (
      <p className="text-sm italic text-on-surface-variant">Ei kuvausta.</p>
    )
  }

  if (!mounted) {
    return (
      <div
        className={`min-h-24 animate-pulse rounded-lg border border-outline-variant bg-surface-container-lowest p-3 ${className ?? ''}`}
      />
    )
  }

  return <TaskContentViewerInner value={value} className={className} />
}
