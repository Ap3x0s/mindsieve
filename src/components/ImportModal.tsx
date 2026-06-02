import { useState } from 'react'
import { X, Upload, FileText, Link, Sparkles, CheckCircle, AlertCircle, Tags } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAI } from '../hooks/useAI'

interface ImportResult { title: string; success: boolean; error?: string; tags?: string[] }

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const { addItem } = useApp()
  const { process, loading } = useAI()
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'paste' | 'bulk'>('paste')
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])

  const handleBulkImport = async () => {
    const urls = input.split('\n').map(l => l.trim()).filter(l => l.startsWith('http'))
    if (urls.length === 0) return
    setImporting(true)
    setResults([])
    for (const url of urls) {
      try {
        const data = await process(url)
        addItem(data, data.tags)
        setResults(prev => [...prev, { title: data.title, success: true, tags: data.tags }])
      } catch (e) {
        setResults(prev => [...prev, { title: url.slice(0, 60), success: false, error: String(e) }])
      }
    }
    setInput('')
    setImporting(false)
  }

  const handleSingleImport = async () => {
    if (!input.trim()) return
    setImporting(true)
    try {
      const data = await process(input.trim())
      addItem(data, data.tags)
      setResults([{ title: data.title, success: true, tags: data.tags }])
    } catch (e) {
      setResults([{ title: input.slice(0, 60), success: false, error: String(e) }])
    }
    setInput('')
    setImporting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-900)] shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Upload className="w-4 h-4" /> Import
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('paste')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${mode === 'paste' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-700)] text-[var(--color-text-secondary)]'}`}
          >
            <Link className="w-3 h-3" /> Single URL
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${mode === 'bulk' ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-700)] text-[var(--color-text-secondary)]'}`}
          >
            <FileText className="w-3 h-3" /> Bulk Import
          </button>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === 'bulk' ? 'Paste multiple URLs, one per line...\nhttps://example1.com\nhttps://example2.com' : 'Paste URL or text...'}
          className="w-full h-28 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] resize-none"
        />

        <button
          onClick={mode === 'bulk' ? handleBulkImport : handleSingleImport}
          disabled={importing || loading || !input.trim()}
          className="mt-3 w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {(importing || loading) ? <Sparkles className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {(importing || loading) ? 'Importing...' : `Import ${mode === 'bulk' ? input.split('\n').filter(l => l.trim().startsWith('http')).length || '...' : ''}`}
        </button>

        {results.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-40 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className={`flex flex-col gap-1 px-3 py-2 rounded-lg text-xs ${r.success ? 'bg-[var(--color-success)]/5 text-[var(--color-success)]' : 'bg-danger/5 text-danger'}`}>
                <div className="flex items-center gap-2">
                  {r.success ? <CheckCircle className="w-3 h-3 shrink-0" /> : <AlertCircle className="w-3 h-3 shrink-0" />}
                  <span className="truncate">{r.title}</span>
                </div>
                {r.tags && r.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 pl-5">
                    <Tags className="w-3 h-3 shrink-0 text-[var(--color-text-muted)]" />
                    {r.tags.map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-[var(--color-surface-700)] text-[var(--color-text-muted)]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
