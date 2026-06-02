import { useState, useEffect } from 'react'
import { X, FileText, ListChecks, BrainCircuit, CheckCircle, Trophy, Sparkles, Star, StarOff, Trash2, Archive, Share2, Loader2 } from 'lucide-react'
import type { SieveItem, TabType } from '../types'
import { useApp } from '../context/AppContext'
import { useQuiz } from '../hooks/useQuiz'
import Confetti from './Confetti'
import ShareCard from './ShareCard'
import ConfirmDialog from './ConfirmDialog'
import { format } from 'date-fns'

interface SieveViewProps {
  item: SieveItem
  onClose: () => void
  fullPage?: boolean
}

const tabs: { id: TabType; label: string; icon: typeof FileText }[] = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'actions', label: 'Action Items', icon: ListChecks },
  { id: 'quiz', label: 'Smart Quiz', icon: BrainCircuit },
]

export default function SieveView({ item, onClose, fullPage }: SieveViewProps) {
  const [tab, setTab] = useState<TabType>('summary')
  const { markAsRead, markQuizMastered, toggleFavorite, toggleArchive, deleteItem } = useApp()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [readAwarded, setReadAwarded] = useState(item.xpAwarded)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    setReadAwarded(item.xpAwarded)
  }, [item.xpAwarded])

  useEffect(() => {
    if (!fullPage) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [fullPage])

  const handleMarkRead = () => {
    if (readAwarded) return
    markAsRead(item.id)
    setReadAwarded(true)
  }

  const handleQuizMastered = (results: number[]) => {
    markQuizMastered(item.id, results)
    setShowConfetti(true)
  }

  const content = (
    <div className={`flex flex-col bg-[var(--color-surface-900)] border border-[var(--color-border)] rounded-2xl shadow-2xl overflow-hidden ${fullPage ? 'max-w-2xl mx-auto' : 'relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] mx-4'}`}>
      {item.image && (
        <div className="w-full h-48 overflow-hidden bg-[var(--color-surface-800)]">
          <img src={item.image} alt="" className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLElement).style.display = 'none' }} />
        </div>
      )}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
        <div className="flex-1 min-w-0">
          <h2 className="text-[var(--color-text-primary)] font-semibold text-base truncate">{item.title}</h2>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5">{item.domain} · {item.readingTime} · {format(new Date(item.date), 'MMM d, yyyy')}</p>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <button onClick={() => toggleFavorite(item.id)} title={item.favorite ? 'Unfavorite' : 'Favorite'} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            {item.favorite ? <Star className="w-4 h-4 text-[var(--color-warning)]" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button onClick={() => toggleArchive(item.id)} title={item.archived ? 'Unarchive' : 'Archive'} className={`p-1.5 rounded-lg transition-colors cursor-pointer ${item.archived ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/10' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)]'}`}>
            <Archive className="w-4 h-4" />
          </button>
          <button onClick={() => setShowShare(true)} title="Share" className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} title="Delete" className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-danger/10 hover:text-danger transition-colors cursor-pointer">
            <Trash2 className="w-4 h-4" />
          </button>
          {!fullPage && (
            <button onClick={onClose} title="Close" className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex border-b border-[var(--color-border)] px-6 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-[color,border] duration-200 cursor-pointer whitespace-nowrap ${
              tab === t.id
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className={`${fullPage ? '' : 'flex-1'} overflow-y-auto p-6`}>
        {tab === 'summary' && (
          <div className="space-y-4">
            {item.summary.map((point, i) => (
              <div key={i} className="flex gap-3 animate-fade-in-up opacity-0">
                <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{point}</p>
              </div>
            ))}
            <button
              onClick={handleMarkRead}
              disabled={readAwarded}
              className={`mt-6 w-full py-2.5 rounded-xl text-sm font-medium transition-[background] duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                readAwarded
                  ? 'bg-[var(--color-surface-700)] text-[var(--color-text-muted)]'
                  : 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'
              }`}
            >
              {readAwarded ? <><CheckCircle className="w-4 h-4" /> Read · +10 XP</> : <><Sparkles className="w-4 h-4" /> Mark as Read · +10 XP</>}
            </button>
          </div>
        )}

        {tab === 'actions' && (
          <div className="space-y-3">
            {item.actionItems.map((action, i) => (
              <div key={i} className="flex gap-3 items-start animate-fade-in-up opacity-0">
                <span className="shrink-0 w-5 h-5 rounded border border-[var(--color-accent)]/40 flex items-center justify-center mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                </span>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'quiz' && <QuizContent item={item} onMastered={handleQuizMastered} />}
      </div>
    </div>
  )

  return (
    <>
      {fullPage ? (
        <div className="px-4 sm:px-6 py-4">{content}</div>
      ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          {showConfetti && <Confetti />}
          {content}
        </div>
      )}
      {showShare && <ShareCard item={item} onClose={() => setShowShare(false)} />}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete item?"
        message={`Are you sure you want to delete "${item.title.slice(0, 50)}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteItem(item.id); onClose(); setShowDeleteConfirm(false) }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}

function QuizContent({ item, onMastered }: { item: SieveItem; onMastered: (results: number[]) => void }) {
  const { quizFailed } = useApp()
  const { answers, setAnswers, submitted, allCorrect, allAnswered, submit, reset } = useQuiz(item.quiz, onMastered)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (submitting) return
    setSubmitting(true)
    const result = submit()
    if (result && !result.allCorrect) {
      quizFailed(item.id)
    }
    setSubmitting(false)
  }

  const isMastered = item.quizMastered

  return (
    <div className="space-y-6">
      {item.quiz.map((q, qi) => (
        <div key={qi} className="animate-fade-in-up opacity-0">
          <p className="text-[var(--color-text-primary)] font-medium text-sm mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const selected = answers[qi] === oi
              const correct = oi === q.correctIndex
              let optClasses = 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40'

              if (submitted || isMastered) {
                if (correct) optClasses = 'border-[var(--color-success)] bg-[var(--color-success)]/5 text-[var(--color-success)]'
                else if (selected && !correct) optClasses = 'border-danger/50 bg-danger/5 text-danger'
                else optClasses = 'border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50'
              } else if (selected) {
                optClasses = 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-accent)]'
              }

              return (
                <button
                  key={oi}
                  onClick={() => { if (!submitted && !isMastered) setAnswers({ ...answers, [qi]: oi }) }}
                  disabled={submitted || isMastered}
                  className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-[border,background] duration-150 cursor-pointer ${optClasses}`}
                >
                  <span className="flex items-center gap-3">
                    <span className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                      submitted || isMastered
                        ? correct ? 'border-[var(--color-success)] text-[var(--color-success)]' : selected ? 'border-danger text-danger' : 'border-[var(--color-border)]'
                        : selected ? 'border-[var(--color-accent)] bg-[var(--color-accent)]' : 'border-[var(--color-border)]'
                    }`}>
                      {(submitted || isMastered) && correct ? '✓' : selected ? '●' : ''}
                    </span>
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {!isMastered && !submitted && (
        <button onClick={handleSubmit} disabled={!allAnswered || submitting}
          className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-[background] duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {submitting ? 'Submitting...' : 'Submit Answers'}
        </button>
      )}

      {submitted && allCorrect && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
          <Trophy className="w-6 h-6 text-[var(--color-success)]" />
          <div>
            <p className="text-[var(--color-success)] font-semibold text-sm">Perfect Score!</p>
            <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">You earned +50 XP and mastered this article.</p>
          </div>
        </div>
      )}

      {submitted && !allCorrect && (
        <div className="p-4 rounded-xl bg-[var(--color-surface-700)] border border-[var(--color-border)]">
          <p className="text-[var(--color-text-secondary)] text-sm text-center">
            {item.quiz.filter((q, i) => answers[i] !== q.correctIndex).length > 1
              ? `You got ${item.quiz.filter((q, i) => answers[i] === q.correctIndex).length}/${item.quiz.length} correct. Review the summary and try again!`
              : 'Almost! Review the summary and try again.'}
          </p>
          <button onClick={reset}
            className="mt-3 w-full py-2 rounded-xl bg-[var(--color-surface-600)] text-[var(--color-text-secondary)] text-sm hover:bg-[var(--color-surface-500)] transition-[background] cursor-pointer">
            Retry Quiz
          </button>
        </div>
      )}

      {isMastered && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20">
          <CheckCircle className="w-6 h-6 text-[var(--color-success)]" />
          <div>
            <p className="text-[var(--color-success)] font-semibold text-sm">Already Mastered</p>
            <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">You completed this quiz earlier.</p>
          </div>
        </div>
      )}
    </div>
  )
}
