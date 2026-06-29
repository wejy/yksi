import { describe, expect, it } from 'vitest'
import {
  taskContentFromMarkdown,
  taskContentFromNotionBlocks,
  taskContentToPlainText,
  normalizeTaskContent,
} from './task-content'

describe('taskContentFromMarkdown', () => {
  it('parses headings, todos, and lists', () => {
    const doc = taskContentFromMarkdown(`# Title\n\n- [ ] Todo item\n- Done item\n\nParagraph text`)
    expect(doc.some((b) => b.type === 'heading')).toBe(true)
    expect(doc.some((b) => b.type === 'checkListItem')).toBe(true)
    expect(doc.some((b) => b.type === 'bulletListItem')).toBe(true)
    expect(doc.some((b) => b.type === 'paragraph')).toBe(true)
  })

  it('parses images', () => {
    const doc = taskContentFromMarkdown('![Screenshot](https://example.com/a.png)')
    expect(doc[0]?.type).toBe('image')
    expect(doc[0]?.props?.url).toBe('https://example.com/a.png')
  })
})

describe('taskContentFromNotionBlocks', () => {
  it('converts notion blocks', () => {
    const doc = taskContentFromNotionBlocks([
      { id: '1', type: 'heading_2', heading_2: { rich_text: [{ plain_text: 'Specs' }] } },
      { id: '2', type: 'to_do', to_do: { checked: true, rich_text: [{ plain_text: 'Review' }] } },
    ])
    expect(doc[0]?.type).toBe('heading')
    expect(doc[1]?.type).toBe('checkListItem')
    expect(doc[1]?.props?.checked).toBe(true)
  })
})

describe('taskContentToPlainText', () => {
  it('builds excerpt', () => {
    const text = taskContentToPlainText(
      taskContentFromMarkdown('## Plan\n\n- [ ] Ship feature'),
      80,
    )
    expect(text).toContain('Plan')
    expect(text).toContain('Ship feature')
  })
})

describe('normalizeTaskContent', () => {
  it('prefers explicit blocks', () => {
    const blocks = taskContentFromMarkdown('# Hello')
    const result = normalizeTaskContent({ blocks, markdown: 'ignored' })
    expect(result.description).toContain('Hello')
  })
})
