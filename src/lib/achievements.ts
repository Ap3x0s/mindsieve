import type { Achievement } from '../types'

export const defaultAchievements: Achievement[] = [
  { id: 'first_read', title: 'First Read', description: 'Mark your first article as read', icon: 'BookOpen', unlocked: false, unlockedAt: null },
  { id: 'quiz_ace', title: 'Quiz Ace', description: 'Complete 10 quizzes without mistakes', icon: 'BrainCircuit', unlocked: false, unlockedAt: null },
  { id: 'streak_7', title: 'Streak Master', description: 'Maintain a 7-day review streak', icon: 'Zap', unlocked: false, unlockedAt: null },
  { id: 'curator', title: 'Curator', description: 'Save 50 articles to your collection', icon: 'Library', unlocked: false, unlockedAt: null },
  { id: 'deep_reader', title: 'Deep Reader', description: 'Read an article longer than 15 minutes', icon: 'BookMarked', unlocked: false, unlockedAt: null },
  { id: 'level_5', title: 'Scholar', description: 'Reach Level 5', icon: 'GraduationCap', unlocked: false, unlockedAt: null },
  { id: 'level_10', title: 'Professor', description: 'Reach Level 10', icon: 'Trophy', unlocked: false, unlockedAt: null },
  { id: 'collector', title: 'Collector', description: 'Use 5 different tags', icon: 'Tags', unlocked: false, unlockedAt: null },
  { id: 'perfectionist', title: 'Perfectionist', description: 'Master 10 articles (read + quiz)', icon: 'Sparkles', unlocked: false, unlockedAt: null },
]
