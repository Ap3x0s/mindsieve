import { useState } from 'react'
import type { QuizQuestion } from '../types'

export function useQuiz(questions: QuizQuestion[], onMastered: (results: number[]) => void) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)
  const [allCorrect, setAllCorrect] = useState(false)

  const allAnswered = questions.every((_, i) => answers[i] !== undefined)

  const submit = () => {
    if (submitted) return
    setSubmitted(true)
    const results = questions.map((q, i) => answers[i] === q.correctIndex ? 5 : 1)
    const correct = results.every(r => r === 5)
    setAllCorrect(correct)
    if (correct) onMastered(results)
    return { allCorrect: correct, results }
  }

  const reset = () => {
    setAnswers({})
    setSubmitted(false)
    setAllCorrect(false)
  }

  return { answers, setAnswers, submitted, allCorrect, allAnswered, submit, reset }
}
