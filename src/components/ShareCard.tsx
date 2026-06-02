import { useState } from 'react'
import { Share2, Check, Download, Copy, X, BookMarked } from 'lucide-react'
import type { SieveItem } from '../types'
import { toObsidianNote, downloadObsidianNote } from '../lib/exportObsidian'

export default function ShareCard({ item, onClose }: { item: SieveItem; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const shareText = [
    `🧠 MindSieve Summary: ${item.title}`,
    '',
    ...item.summary.map(s => `• ${s}`),
    '',
    '---',
    `Source: ${item.domain}`,
    item.url || '',
    '',
    'via MindSieve',
  ].join('\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([shareText], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-900)] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share & Export
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--color-text-muted)] mb-4 line-clamp-1">{item.title}</p>

        <div className="space-y-2">
          <button onClick={handleCopy} className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            <span className="flex items-center gap-2">{copied ? <Check className="w-4 h-4 text-[var(--color-success)]" /> : <Copy className="w-4 h-4" />} Copy Markdown</span>
            {copied && <span className="text-xs text-[var(--color-success)]">Copied!</span>}
          </button>

          <button onClick={handleDownload} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            <Download className="w-4 h-4" /> Download .md
          </button>

          <button onClick={handleExportJSON} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            <Download className="w-4 h-4" /> Export JSON
          </button>

          <button onClick={() => downloadObsidianNote(item)} className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            <BookMarked className="w-4 h-4" /> Export Obsidian Note
          </button>
        </div>

        <details className="mt-4">
          <summary className="text-xs text-[var(--color-text-muted)] cursor-pointer hover:text-[var(--color-text-secondary)]">Preview Obsidian Note</summary>
          <pre className="mt-2 p-3 rounded-lg bg-[var(--color-surface-800)] text-[10px] text-[var(--color-text-secondary)] overflow-x-auto max-h-40">{toObsidianNote(item)}</pre>
        </details>
      </div>
    </div>
  )
}
