import type { SieveItem } from '../types'

export function toObsidianNote(item: SieveItem): string {
  const date = new Date().toISOString().split('T')[0]
  const tags = item.tags.map(t => `  - ${t}`).join('\n')

  return [
    '---',
    `title: "${item.title.replace(/"/g, '\\"')}"`,
    `source: "${item.url || item.domain}"`,
    `date: ${date}`,
    `tags:`,
    tags || '  - unsorted',
    `status: "${item.status}"`,
    '---',
    '',
    `# ${item.title}`,
    '',
    `> **Source:** [${item.domain}](${item.url || ''}) · ${item.readingTime} · ${item.date}`,
    '',
    '## Summary',
    '',
    ...item.summary.map(s => `- ${s}`),
    '',
    '## Action Items',
    '',
    ...item.actionItems.map(a => `- [ ] ${a}`),
    '',
    item.quiz.length > 0 ? '## Quiz' : '',
    ...item.quiz.flatMap((q, i) => [
      '',
      `### Q${i + 1}: ${q.question}`,
      ...q.options.map((o, oi) => `${oi === q.correctIndex ? '✅' : '❌'} ${o}`),
    ]),
    '',
    '---',
    '_Created by MindSieve_',
  ].filter(l => l !== undefined).join('\n')
}

export function downloadObsidianNote(item: SieveItem) {
  const md = toObsidianNote(item)
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${item.title.replace(/[^a-zA-Z0-9а-яА-Я]/g, '_')}.md`
  a.click()
  URL.revokeObjectURL(url)
}
