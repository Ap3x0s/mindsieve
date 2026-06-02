import { useState } from 'react'
import { Loader2, Sparkles, Link, FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAI } from '../hooks/useAI'
import toast from 'react-hot-toast'

interface QuickInputProps {
  onProcessing: (v: boolean) => void
}

export default function QuickInput({ onProcessing }: QuickInputProps) {
  const [text, setText] = useState('')
  const { process, loading } = useAI()
  const { addItem } = useApp()

  const handleProcess = async () => {
    if (!text.trim() || loading) return
    onProcessing(true)
    try {
      const result = await process(text.trim())
      addItem(result, result.tags)
      setText('')
      toast.success('Article processed!')
    } catch (e) {
      toast.error('Processing failed')
      console.error(e)
    }
    onProcessing(false)
  }

  const isLink = /^https?:\/\//.test(text.trim())

  return (
    <div className="px-6 py-5">
      <div className="relative max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className={`flex items-center gap-1 text-xs ${isLink ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
            <Link className="w-3 h-3" /> Link
          </span>
          <span className="text-[var(--color-text-muted)]">|</span>
          <span className={`flex items-center gap-1 text-xs ${!isLink ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
            <FileText className="w-3 h-3" /> Text
          </span>
        </div>
        <div className="relative flex items-stretch">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleProcess()}
            placeholder="Paste any article link or text to sieve it..."
            className="flex-1 px-5 py-4 pr-36 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 text-base truncate min-w-0"
          />
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Sieving...' : 'Process'}
          </button>
        </div>
      </div>
    </div>
  )
}
