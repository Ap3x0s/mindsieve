export interface QuizQuestion {
  question: string
  options: string[]
  correctIndex: number
}

export type SieveStatus = 'unread' | 'sieved' | 'mastered'
export type SourceType = 'link' | 'text'

export interface ReviewEntry {
  dueDate: string
  interval: number
  easeFactor: number
  repetitions: number
}

export interface SieveItem {
  id: string
  title: string
  domain: string
  url: string
  date: string
  readingTime: string
  image?: string
  summary: string[]
  actionItems: string[]
  quiz: QuizQuestion[]
  status: SieveStatus
  xpAwarded: boolean
  quizMastered: boolean
  tags: string[]
  favorite: boolean
  archived: boolean
  sourceType: SourceType
  review: ReviewEntry | null
}

export interface UserState {
  xp: number
  level: number
  totalRead: number
  totalQuizMastered: number
  totalQuizFailed: number
  streak: number
  lastActiveDate: string
}

export type TabType = 'summary' | 'actions' | 'quiz'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt: string | null
}

export interface DailyQuest {
  id: string
  title: string
  description: string
  target: number
  progress: number
  xpReward: number
  completed: boolean
}

export interface TagInfo {
  id: string
  name: string
  color: string
}

export interface ThemeConfig {
  name: string
  colors: {
    surface900: string
    surface800: string
    surface700: string
    surface600: string
    surface500: string
    accent: string
    accentHover: string
    success: string
    successLight: string
    warning: string
    textPrimary: string
    textSecondary: string
    textMuted: string
    border: string
    cardBg: string
  }
}

export interface ReviewLog {
  id: string
  itemId: string
  grade: number
  easeBefore: number
  easeAfter: number
  intervalBefore: number
  intervalAfter: number
  date: string
}

export interface Sm2Settings {
  defaultEase: number
  minEase: number
  maxInterval: number
  intervalStep1: number
  intervalStep2: number
  streakFreezeDays: number
}

export const DEFAULT_SM2: Sm2Settings = {
  defaultEase: 2.5,
  minEase: 1.3,
  maxInterval: 365,
  intervalStep1: 1,
  intervalStep2: 6,
  streakFreezeDays: 7,
}

export interface AppState {
  items: SieveItem[]
  user: UserState
  darkMode: boolean
  tags: TagInfo[]
  achievements: Achievement[]
  dailyQuests: DailyQuest[]
  reviewLogs: ReviewLog[]
  customTheme: ThemeConfig | null
}
