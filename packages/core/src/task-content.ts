/**
 * Unified block document for task body content.
 * Compatible with BlockNote / Notion-style blocks (paragraph, heading, todo, image, …).
 */

export interface TaskInlineContent {
  type: 'text'
  text: string
  styles?: Record<string, boolean>
}

export interface TaskContentBlock {
  id: string
  type: string
  props?: Record<string, string | number | boolean>
  content?: TaskInlineContent[]
  children?: TaskContentBlock[]
}

export type TaskContentDocument = TaskContentBlock[]

let blockIdCounter = 0

function nextBlockId(): string {
  blockIdCounter += 1
  return `blk_${blockIdCounter}_${Math.random().toString(36).slice(2, 9)}`
}

export function createTextContent(text: string, styles?: Record<string, boolean>): TaskInlineContent[] {
  if (!text) return []
  return [{ type: 'text', text, styles }]
}

export function emptyTaskContent(): TaskContentDocument {
  return [
    {
      id: nextBlockId(),
      type: 'paragraph',
      content: [],
    },
  ]
}

export function taskContentFromMarkdown(markdown: string | null | undefined): TaskContentDocument {
  if (!markdown?.trim()) return emptyTaskContent()

  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: TaskContentBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i] ?? ''

    const heading = line.match(/^(#{1,3})\s+(.+)$/)
    if (heading) {
      blocks.push({
        id: nextBlockId(),
        type: 'heading',
        props: { level: heading[1]!.length },
        content: parseInlineMarkdown(heading[2]!),
      })
      i += 1
      continue
    }

    const todo = line.match(/^- \[( |x|X)\]\s+(.+)$/)
    if (todo) {
      blocks.push({
        id: nextBlockId(),
        type: 'checkListItem',
        props: { checked: todo[1]!.toLowerCase() === 'x' },
        content: parseInlineMarkdown(todo[2]!),
      })
      i += 1
      continue
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/)
    if (image) {
      blocks.push({
        id: nextBlockId(),
        type: 'image',
        props: { url: image[2]!, caption: image[1]! },
      })
      i += 1
      continue
    }

    const bullet = line.match(/^[-*]\s+(.+)$/)
    if (bullet) {
      blocks.push({
        id: nextBlockId(),
        type: 'bulletListItem',
        content: parseInlineMarkdown(bullet[1]!),
      })
      i += 1
      continue
    }

    const numbered = line.match(/^\d+\.\s+(.+)$/)
    if (numbered) {
      blocks.push({
        id: nextBlockId(),
        type: 'numberedListItem',
        content: parseInlineMarkdown(numbered[1]!),
      })
      i += 1
      continue
    }

    if (line.trim() === '') {
      i += 1
      continue
    }

    const paragraphLines: string[] = [line]
    i += 1
    while (i < lines.length && lines[i]!.trim() !== '' && !isBlockStarter(lines[i]!)) {
      paragraphLines.push(lines[i]!)
      i += 1
    }

    blocks.push({
      id: nextBlockId(),
      type: 'paragraph',
      content: parseInlineMarkdown(paragraphLines.join('\n')),
    })
  }

  return blocks.length > 0 ? blocks : emptyTaskContent()
}

function isBlockStarter(line: string): boolean {
  return (
    /^#{1,3}\s+/.test(line) ||
    /^- \[( |x|X)\]\s+/.test(line) ||
    /^!\[/.test(line) ||
    /^[-*]\s+/.test(line) ||
    /^\d+\.\s+/.test(line)
  )
}

function parseInlineMarkdown(text: string): TaskInlineContent[] {
  if (!text) return []

  const parts: TaskInlineContent[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: text.slice(lastIndex, match.index) })
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push({ type: 'text', text: token.slice(2, -2), styles: { bold: true } })
    } else if (token.startsWith('*')) {
      parts.push({ type: 'text', text: token.slice(1, -1), styles: { italic: true } })
    } else if (token.startsWith('`')) {
      parts.push({ type: 'text', text: token.slice(1, -1), styles: { code: true } })
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', text: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: 'text', text }]
}

export function taskContentToPlainText(
  doc: TaskContentDocument | null | undefined,
  maxLength?: number,
): string {
  if (!doc?.length) return ''

  const parts: string[] = []

  for (const block of doc) {
    const inline = block.content?.map((c) => c.text).join('') ?? ''
    switch (block.type) {
      case 'heading':
        parts.push(inline)
        break
      case 'checkListItem':
        parts.push(`${block.props?.checked ? '☑' : '☐'} ${inline}`)
        break
      case 'image':
        parts.push(block.props?.caption ? String(block.props.caption) : '[Kuva]')
        break
      case 'bulletListItem':
      case 'numberedListItem':
        parts.push(inline)
        break
      default:
        if (inline) parts.push(inline)
    }
  }

  const text = parts.join(' · ').replace(/\s+/g, ' ').trim()
  if (maxLength && text.length > maxLength) {
    return `${text.slice(0, maxLength - 1).trim()}…`
  }
  return text
}

/** Build document from a plain string (native tasks, Notion rich_text property). */
export function taskContentFromPlainText(text: string | null | undefined): TaskContentDocument {
  if (!text?.trim()) return emptyTaskContent()
  return [
    {
      id: nextBlockId(),
      type: 'paragraph',
      content: createTextContent(text.trim()),
    },
  ]
}

export interface NotionBlockLike {
  id: string
  type: string
  has_children?: boolean
  children?: NotionBlockLike[]
  paragraph?: { rich_text?: { plain_text: string }[] }
  heading_1?: { rich_text?: { plain_text: string }[] }
  heading_2?: { rich_text?: { plain_text: string }[] }
  heading_3?: { rich_text?: { plain_text: string }[] }
  bulleted_list_item?: { rich_text?: { plain_text: string }[] }
  numbered_list_item?: { rich_text?: { plain_text: string }[] }
  to_do?: { rich_text?: { plain_text: string }[]; checked?: boolean }
  image?: { type?: string; external?: { url?: string }; file?: { url?: string }; caption?: { plain_text: string }[] }
  quote?: { rich_text?: { plain_text: string }[] }
  code?: { rich_text?: { plain_text: string }[] }
}

function notionRichText(block?: { rich_text?: { plain_text: string }[] }): TaskInlineContent[] {
  const text = block?.rich_text?.map((t) => t.plain_text).join('') ?? ''
  return createTextContent(text)
}

export function taskContentFromNotionBlocks(blocks: NotionBlockLike[]): TaskContentDocument {
  const result: TaskContentBlock[] = []

  for (const block of blocks) {
    const converted = notionBlockToTaskBlock(block)
    if (converted) result.push(converted)
  }

  return result.length > 0 ? result : emptyTaskContent()
}

function notionBlockToTaskBlock(block: NotionBlockLike): TaskContentBlock | null {
  switch (block.type) {
    case 'paragraph':
      return { id: block.id, type: 'paragraph', content: notionRichText(block.paragraph) }
    case 'heading_1':
      return { id: block.id, type: 'heading', props: { level: 1 }, content: notionRichText(block.heading_1) }
    case 'heading_2':
      return { id: block.id, type: 'heading', props: { level: 2 }, content: notionRichText(block.heading_2) }
    case 'heading_3':
      return { id: block.id, type: 'heading', props: { level: 3 }, content: notionRichText(block.heading_3) }
    case 'bulleted_list_item':
      return { id: block.id, type: 'bulletListItem', content: notionRichText(block.bulleted_list_item) }
    case 'numbered_list_item':
      return { id: block.id, type: 'numberedListItem', content: notionRichText(block.numbered_list_item) }
    case 'to_do':
      return {
        id: block.id,
        type: 'checkListItem',
        props: { checked: block.to_do?.checked ?? false },
        content: notionRichText(block.to_do),
      }
    case 'image': {
      const url = block.image?.external?.url ?? block.image?.file?.url
      if (!url) return null
      const caption = block.image?.caption?.map((c) => c.plain_text).join('') ?? ''
      return { id: block.id, type: 'image', props: { url, caption } }
    }
    case 'quote':
      return { id: block.id, type: 'paragraph', content: notionRichText(block.quote) }
    case 'code':
      return { id: block.id, type: 'paragraph', content: notionRichText(block.code) }
    default:
      return null
  }
}

export function normalizeTaskContent(
  input: {
    markdown?: string | null
    plainText?: string | null
    notionBlocks?: NotionBlockLike[] | null
    blocks?: TaskContentDocument | null
  },
): { contentDocument: TaskContentDocument; description: string | null } {
  let contentDocument: TaskContentDocument

  if (input.blocks?.length) {
    contentDocument = input.blocks
  } else if (input.notionBlocks?.length) {
    contentDocument = taskContentFromNotionBlocks(input.notionBlocks)
  } else if (input.markdown?.trim()) {
    contentDocument = taskContentFromMarkdown(input.markdown)
  } else if (input.plainText?.trim()) {
    contentDocument = taskContentFromPlainText(input.plainText)
  } else {
    contentDocument = emptyTaskContent()
  }

  const description = taskContentToPlainText(contentDocument, 500) || null
  return { contentDocument, description }
}
