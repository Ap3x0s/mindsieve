import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, CheckCircle, ChevronRight, BrainCircuit, BarChart3, SkipForward } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useRetention } from '../hooks/useRetention'
import { ReviewCardSkeleton } from '../components/LoadingSkeleton'
import type { SieveItem } from '../types'

export default function Review() {
  const navigate = useNavigate()
  const { state, loading, updateReview } = useApp()
  const { dueItems, score: retentionScore } = useRetention(state.items)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)

  const reset = () => {
    setShowAnswer(false)
    setQuizAnswers({})
    setQuizSubmitted(false)
  }

  const handleGrade = useCallback((grade: number) => {
    if (!dueItems[currentIndex]) return
    updateReview(dueItems[currentIndex].id, grade)
    reset()
    setCurrentIndex(prev => prev + 1)
  }, [dueItems, currentIndex, updateReview])

  const handleSkip = useCallback(() => {
    reset()
    setCurrentIndex(prev => prev + 1)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= 5 && showAnswer) {
        e.preventDefault()
        handleGrade(num)
        return
      }
      if ((e.key === ' ' || e.key === 'Enter') && !showAnswer) {
        e.preventDefault()
        if (!quizSubmitted) {
          setQuizSubmitted(true)
        } else {
          setShowAnswer(true)
        }
        return
      }
      if ((e.key === 's' || e.key === 'S') && showAnswer) {
        e.preventDefault()
        handleSkip()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAnswer, quizSubmitted, handleGrade, handleSkip])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Review</h1>
        </div>
        <ReviewCardSkeleton />
      </div>
    )
  }

  if (dueItems.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-700)] flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">All caught up!</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">No items due for review.</p>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] hover:underline cursor-pointer">Back to Dashboard</button>
      </div>
    )
  }

  if (currentIndex >= dueItems.length) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-success)]/10 flex items-center justify-center mx-auto mb-4">
          <BrainCircuit className="w-8 h-8 text-[var(--color-success)]" />
        </div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">Review Complete!</h2>
        <p className="text-sm text-[var(--color-text-muted)] mb-1">You reviewed {dueItems.length} item{dueItems.length > 1 ? 's' : ''}.</p>
        <p className="text-xs text-[var(--color-text-muted)] mb-4">+15 XP per item earned.</p>
        <button onClick={() => navigate('/')} className="text-[var(--color-accent)] hover:underline cursor-pointer">Done</button>
      </div>
    )
  }

  const item = dueItems[currentIndex]
  const score = retentionScore(item.review)
  const miniQuiz = item.quiz.slice(0, 2)

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Review</h1>
        <span className="text-sm text-[var(--color-text-muted)]">{currentIndex + 1} / {dueItems.length}</span>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--color-surface-700)] mb-4 overflow-hidden">
        <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${(currentIndex / dueItems.length) * 100}%` }} />
      </div>

      <div className="flex items-center gap-2 mb-4 text-xs text-[var(--color-text-muted)]">
        <BarChart3 className="w-3 h-3" />
        Retention Score:
        <span className={`font-semibold ${score >= 80 ? 'text-[var(--color-success)]' : score >= 50 ? 'text-[var(--color-warning)]' : 'text-danger'}`}>
          {score}%
        </span>
        <span className="mx-1">·</span>
        <RotateCcw className="w-3 h-3" />
        Interval: {item.review?.interval ?? 0}d
        <span className="mx-1">·</span>
        Repetitions: {item.review?.repetitions ?? 0}
      </div>

      <ReviewCard
        item={item}
        showAnswer={showAnswer}
        onReveal={() => setShowAnswer(true)}
        onGrade={handleGrade}
        onSkip={handleSkip}
        miniQuiz={miniQuiz}
        quizAnswers={quizAnswers}
        setQuizAnswers={setQuizAnswers}
        quizSubmitted={quizSubmitted}
      />
    </div>
  )
}

function ReviewCard({ item, showAnswer, onReveal, onGrade, onSkip, miniQuiz, quizAnswers, setQuizAnswers, quizSubmitted }: {
  item: SieveItem; showAnswer: boolean; onReveal: () => void; onGrade: (g: number) => void; onSkip: () => void
  miniQuiz: typeof item.quiz; quizAnswers: Record<number, number>; setQuizAnswers: (v: Record<number, number>) => void; quizSubmitted: boolean
}) {
  return (
    <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
      <h3 className="text-base font-medium text-[var(--color-text-primary)] mb-4">{item.title}</h3>

      {!showAnswer ? (
        <div className="space-y-4">
          {miniQuiz.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">Mini Quiz</p>
              {miniQuiz.map((q, qi) => (
                <div key={qi}>
                  <p className="text-sm text-[var(--color-text-secondary)] mb-2">{q.question}</p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => {
                      const selected = quizAnswers[qi] === oi
                      const correct = oi === q.correctIndex
                      let cls = 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40'
                      if (quizSubmitted) {
                        if (correct) cls = 'border-[var(--color-success)] bg-[var(--color-success)]/5 text-[var(--color-success)]'
                        else if (selected) cls = 'border-danger/50 bg-danger/5 text-danger'
                        else cls = 'border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50'
                      } else if (selected) cls = 'border-[var(--color-accent)] bg-[var(--color-accent)]/5 text-[var(--color-accent)]'
                      return (
                        <button key={oi} onClick={() => { if (!quizSubmitted) setQuizAnswers({ ...quizAnswers, [qi]: oi }) }}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${cls}`}>
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={onReveal}
            className="w-full py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer flex items-center justify-center gap-2">
            {quizSubmitted ? 'Reveal Summary' : 'Submit & Reveal'} <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-[var(--color-text-muted)] text-center">Press Space or Enter to reveal</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-surface-700)]">
            <p className="text-xs text-[var(--color-text-muted)] mb-2">Summary</p>
            {item.summary.map((s, i) => <p key={i} className="text-sm text-[var(--color-text-secondary)] mb-1">• {s}</p>)}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-surface-700)]">
            <span className="text-xs text-[var(--color-text-muted)]">Quiz:</span>
            <span className="text-xs text-[var(--color-success)]">{quizAnswers[0] === miniQuiz[0]?.correctIndex ? '✓' : '✗'}</span>
            {miniQuiz.length > 1 && <span className="text-xs text-[var(--color-text-muted)]">/</span>}
            {miniQuiz.length > 1 && (
              <span className="text-xs text-[var(--color-success)]">{quizAnswers[1] === miniQuiz[1]?.correctIndex ? '✓' : '✗'}</span>
            )}
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">How well did you remember?</p>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(grade => (
              <button key={grade} onClick={() => onGrade(grade)}
                className={`py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  grade <= 2 ? 'bg-danger/10 text-danger hover:bg-danger/20'
                    : grade === 3 ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] hover:bg-[var(--color-warning)]/20'
                    : 'bg-[var(--color-success)]/10 text-[var(--color-success)] hover:bg-[var(--color-success)]/20'
                }`}>
                {grade}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] px-1">
            <span>Forgot</span><span>Hard</span><span>OK</span><span>Easy</span><span>Perfect</span>
          </div>
          <div className="flex items-center justify-between pt-2">
            <button onClick={onSkip}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-accent)]/40 transition-colors cursor-pointer">
              <SkipForward className="w-3.5 h-3.5" /> Skip
            </button>
            <span className="text-[10px] text-[var(--color-text-muted)]">Keys 1-5 to rate · S to skip</span>
          </div>
        </div>
      )}
    </div>
  )
}
