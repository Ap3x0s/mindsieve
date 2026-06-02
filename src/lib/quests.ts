import type { DailyQuest } from '../types'
import { storageKey } from './constants'

export function generateDailyQuests(): DailyQuest[] {
  const today = new Date().toDateString()
  const saved = localStorage.getItem(storageKey('quests'))
  const savedDate = localStorage.getItem(storageKey('quests_date'))

  if (saved && savedDate === today) {
    try { return JSON.parse(saved) }
    catch { /* ignore */ }
  }

  const quests: DailyQuest[] = [
    { id: `read_${today}`, title: 'Read an Article', description: 'Read one article today', target: 1, progress: 0, xpReward: 30, completed: false },
    { id: `quiz_${today}`, title: 'Quiz Master', description: 'Complete 2 quizzes', target: 2, progress: 0, xpReward: 40, completed: false },
    { id: `review_${today}`, title: 'Review Session', description: 'Review 3 spaced repetition cards', target: 3, progress: 0, xpReward: 35, completed: false },
  ]

  localStorage.setItem(storageKey('quests'), JSON.stringify(quests))
  localStorage.setItem(storageKey('quests_date'), today)
  return quests
}
