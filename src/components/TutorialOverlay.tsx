import { useState } from 'react'
import { Brain, Library, RotateCcw, BarChart3, Sparkles, ArrowRight, X } from 'lucide-react'

const steps = [
  {
    icon: Brain,
    title: 'Welcome to MindSieve',
    description: 'Your AI-powered content curator. Paste any article link or text to instantly get summaries, action items, and quizzes.',
  },
  {
    icon: Sparkles,
    title: 'Process Content',
    description: 'Paste links or text in the quick input field. MindSieve uses AI to extract key insights and test your understanding.',
  },
  {
    icon: Library,
    title: 'Build Your Library',
    description: 'All processed content lives in your Library. Tag, favorite, archive, or swipe through articles to stay organized.',
  },
  {
    icon: RotateCcw,
    title: 'Spaced Repetition',
    description: 'Review what you\'ve learned with built-in spaced repetition. Strengthen retention by quizzing yourself on mastered content.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    description: 'Level up, earn achievements, and maintain your streak. Stats show your reading mastery and daily quests.',
  },
]

export default function TutorialOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const current = steps[step]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-[var(--color-accent)] w-4' : 'bg-[var(--color-surface-700)]'}`} />
            ))}
          </div>
          <button onClick={onDone} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-700)] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center mb-4">
            <current.icon className="w-7 h-7 text-[var(--color-accent)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{current.title}</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{current.description}</p>
        </div>

        <button
          onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onDone()}
          className="w-full py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          {step < steps.length - 1 ? 'Next' : 'Get Started'}
          {step < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
