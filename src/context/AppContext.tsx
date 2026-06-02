import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { nanoid } from 'nanoid'
import { isSameDay, subDays } from 'date-fns'
import type { SieveItem, UserState, Achievement, DailyQuest, TagInfo, AppState, ReviewLog, ReviewEntry, ThemeConfig } from '../types'
import { getLevel, XP_PER_READ, XP_PER_QUIZ, XP_PER_REVIEW } from '../lib/xp'
import { defaultAchievements } from '../lib/achievements'
import { TAG_COLORS, ACHIEVEMENT_THRESHOLDS, storageKey } from '../lib/constants'
import { generateDailyQuests } from '../lib/quests'
import { loadJSON, saveJSON } from '../lib/storage'
import { createReview, scheduleReview, loadSm2Settings } from '../lib/sm2'
import { api } from '../lib/api'
import { loadCustomTheme, saveCustomTheme, clearCustomTheme, applyTheme, resetTheme } from '../lib/themes'

interface AppContextType {
  state: AppState
  loading: boolean
  migrating: boolean
  error: string | null
  setDarkMode: (v: boolean) => void
  addItem: (partial: Omit<SieveItem, 'id' | 'date' | 'tags' | 'favorite' | 'archived' | 'review'>, suggestedTags?: string[]) => void
  addItemFull: (item: SieveItem) => void
  markAsRead: (id: string) => void
  markQuizMastered: (id: string, quizResults: number[]) => void
  quizFailed: (id: string) => void
  addXp: (amount: number) => void
  toggleFavorite: (id: string) => void
  toggleArchive: (id: string) => void
  deleteItem: (id: string) => void
  setTags: (id: string, tags: string[]) => void
  addTag: (name: string, color: string) => string
  removeTag: (id: string) => void
  completeQuest: (id: string) => void
  createReviewEntry: (id: string, grades: number[]) => void
  updateReview: (id: string, grade: number) => void
  checkAchievements: () => void
  setCustomTheme: (theme: ThemeConfig | null) => void
}

const AppContext = createContext<AppContextType | null>(null)

function updateStreak(user: UserState): UserState {
  const today = new Date()
  const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null
  if (!last) return { ...user, streak: 1, lastActiveDate: today.toISOString() }
  if (isSameDay(last, today)) return user
  if (isSameDay(subDays(today, 1), last)) return { ...user, streak: user.streak + 1, lastActiveDate: today.toISOString() }
  const settings = loadSm2Settings()
  if (user.streak >= settings.streakFreezeDays && isSameDay(subDays(today, 2), last)) {
    return { ...user, lastActiveDate: today.toISOString() }
  }
  return { ...user, streak: 1, lastActiveDate: today.toISOString() }
}

function migrateItem(item: Partial<SieveItem>): SieveItem {
  let date = item.date || new Date().toISOString()
  if (date && !date.includes('T')) {
    date = new Date(date).toISOString()
  }
  return {
    tags: [], favorite: false, archived: false, review: null, sourceType: 'link',
    xpAwarded: false, quizMastered: false, status: 'unread', readingTime: '5 min read',
    summary: [], actionItems: [], quiz: [],
    ...item,
    id: item.id || '',
    title: item.title || 'Untitled',
    domain: item.domain || 'unknown',
    url: item.url || '',
    date,
  } as SieveItem
}

function initLocalState(): AppState {
  const raw = loadJSON<Partial<SieveItem>[]>(storageKey('items'), [] as Partial<SieveItem>[])
  const items: SieveItem[] = raw ? raw.map(migrateItem) : []
  const user = loadJSON<UserState>(storageKey('user'), { xp: 0, level: 1, totalRead: 0, totalQuizMastered: 0, totalQuizFailed: 0, streak: 0, lastActiveDate: '' })
  const darkMode = loadJSON<boolean>(storageKey('theme'), true)
  const tags = loadJSON<TagInfo[]>(storageKey('tags'), [])
  const achievements = loadJSON<Achievement[]>(storageKey('achievements'), defaultAchievements)
  const dailyQuests = generateDailyQuests()
  const customTheme = loadCustomTheme()
  const reviewLogs = loadJSON<ReviewLog[]>(storageKey('review_logs'), [])
  return { items, user, darkMode, tags, achievements, dailyQuests, reviewLogs, customTheme }
}

function saveReviewLogs(logs: ReviewLog[]) {
  saveJSON(storageKey('review_logs'), logs)
}

function incrementQuest(state: AppState, prefix: string): AppState {
  const today = new Date().toDateString()
  return {
    ...state,
    dailyQuests: state.dailyQuests.map(q => {
      if (q.completed || !q.id.startsWith(prefix) || !q.id.includes(today)) return q
      const next = Math.min(q.progress + 1, q.target)
      return { ...q, progress: next, completed: next >= q.target }
    }),
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const s = initLocalState()
    return { ...s, darkMode: loadJSON<boolean>(storageKey('theme'), true) }
  })
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [migrated, setMigrated] = useState(() => loadJSON<boolean>(storageKey('migrated'), false))

  useEffect(() => {
    api.loadState()
      .then(remote => {
        setState(prev => ({ ...remote, darkMode: prev.darkMode }))
        setMigrated(true)
        saveJSON(storageKey('migrated'), true)
      })
      .catch(err => {
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const hasLocal = loadJSON(storageKey('items'), null) !== null
    if (hasLocal && !migrated && !loading) {
      setMigrating(true)
      const localState = initLocalState()
      api.migrate({
        items: localState.items,
        user: localState.user,
        tags: localState.tags,
        achievements: localState.achievements,
        quests: localState.dailyQuests,
      }).then(() => {
        setMigrated(true)
        saveJSON(storageKey('migrated'), true)
        return api.loadState()
      }).then(remote => {
        setState(prev => ({ ...remote, darkMode: prev.darkMode }))
      }).catch(() => {}).finally(() => setMigrating(false))
    }
  }, [migrated, loading])

  useEffect(() => { saveJSON(storageKey('theme'), state.darkMode) }, [state.darkMode])
  useEffect(() => { saveReviewLogs(state.reviewLogs) }, [state.reviewLogs])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode)
    document.documentElement.classList.toggle('light', !state.darkMode)
    if (state.customTheme) {
      applyTheme(state.customTheme.colors)
    } else {
      resetTheme()
    }
  }, [state.darkMode, state.customTheme])

  const setDarkMode = useCallback((v: boolean) => { setState(prev => ({ ...prev, darkMode: v })) }, [])

  const setCustomTheme = useCallback((theme: ThemeConfig | null) => {
    setState(prev => ({ ...prev, customTheme: theme }))
    if (theme) {
      saveCustomTheme(theme)
    } else {
      clearCustomTheme()
    }
  }, [])

  const addItem = useCallback((partial: Omit<SieveItem, 'id' | 'date' | 'tags' | 'favorite' | 'archived' | 'review'>, suggestedTags?: string[]) => {
    const id = nanoid()
    const colors = TAG_COLORS
    const tagIds: string[] = []
    if (suggestedTags) {
      setState(s => {
        const existingTags = s.tags
        const newTagInfos: TagInfo[] = []
        for (const name of suggestedTags) {
          const match = existingTags.find(t => t.name.toLowerCase() === name.toLowerCase())
          if (match) {
            tagIds.push(match.id)
          } else {
            const newTag = { id: nanoid(), name, color: colors[tagIds.length % colors.length] }
            newTagInfos.push(newTag)
            tagIds.push(newTag.id)
            api.createTag(newTag).catch(() => {})
          }
        }
        return { ...s, tags: [...s.tags, ...newTagInfos] }
      })
    }
    const item: SieveItem = {
      ...partial, id,
      date: new Date().toISOString(),
      tags: tagIds, favorite: false, archived: false, review: null,
    }
    setState(prev => ({ ...prev, items: [item, ...prev.items] }))
    api.createItem(partial).then(created => {
      setState(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...created, tags: tagIds } : i) }))
    }).catch(() => {})
  }, [])

  const addItemFull = useCallback((item: SieveItem) => {
    setState(prev => ({ ...prev, items: [item, ...prev.items] }))
    api.createItem(item).catch(() => {})
  }, [])

  const updateUser = useCallback((fn: (u: UserState) => UserState) => {
    setState(prev => {
      const newUser = fn(prev.user)
      api.updateUser(newUser).catch(() => {})
      return { ...prev, user: newUser }
    })
  }, [])

  const checkAchievements = useCallback(() => {
    setState(prev => {
      let updated = [...prev.achievements]
      const mark = (id: string) => {
        const idx = updated.findIndex(a => a.id === id)
        if (idx >= 0 && !updated[idx].unlocked) {
          updated[idx] = { ...updated[idx], unlocked: true, unlockedAt: new Date().toISOString() }
          api.updateAchievement(id, { unlocked: true, unlockedAt: new Date().toISOString() }).catch(() => {})
        }
      }
      if (prev.user.totalRead >= ACHIEVEMENT_THRESHOLDS.first_read) mark('first_read')
      if (prev.user.totalQuizMastered >= ACHIEVEMENT_THRESHOLDS.quiz_ace) mark('quiz_ace')
      if (prev.user.streak >= loadSm2Settings().streakFreezeDays) mark('streak_7')
      if (prev.items.length >= ACHIEVEMENT_THRESHOLDS.curator) mark('curator')
      if (prev.items.some(i => i.readingTime.includes('15') || parseInt(i.readingTime) >= ACHIEVEMENT_THRESHOLDS.deep_reader)) mark('deep_reader')
      if (prev.user.level >= ACHIEVEMENT_THRESHOLDS.level_5) mark('level_5')
      if (prev.user.level >= ACHIEVEMENT_THRESHOLDS.level_10) mark('level_10')
      if (new Set(prev.items.flatMap(i => i.tags)).size >= ACHIEVEMENT_THRESHOLDS.collector) mark('collector')
      if (prev.items.filter(i => i.status === 'mastered').length >= ACHIEVEMENT_THRESHOLDS.perfectionist) mark('perfectionist')
      return { ...prev, achievements: updated }
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id)
      if (!item || item.xpAwarded) return prev
      const user = updateStreak(prev.user)
      const newUser = { ...user, xp: user.xp + XP_PER_READ, level: getLevel(user.xp + XP_PER_READ), totalRead: user.totalRead + 1 }
      const review = createReview([5])
      api.updateUser(newUser).catch(() => {})
      api.updateItem(id, { status: 'sieved', xpAwarded: true, review } as Partial<SieveItem>).catch(() => {})
      return incrementQuest({
        ...prev, user: newUser,
        items: prev.items.map(i => i.id === id ? { ...i, status: 'sieved', xpAwarded: true, review } : i),
      }, 'read_')
    })
    setTimeout(() => checkAchievements(), 0)
  }, [checkAchievements])

  const markQuizMastered = useCallback((id: string, quizResults: number[]) => {
    setState(prev => {
      const user = updateStreak(prev.user)
      const newUser = { ...user, xp: user.xp + XP_PER_QUIZ, level: getLevel(user.xp + XP_PER_QUIZ), totalQuizMastered: user.totalQuizMastered + 1 }
      const item = prev.items.find(i => i.id === id)
      const review = item?.review ? scheduleReview(item.review, 5) : createReview(quizResults)
      api.updateUser(newUser).catch(() => {})
      api.updateItem(id, { status: 'mastered', quizMastered: true, review } as Partial<SieveItem>).catch(() => {})
      return incrementQuest({
        ...prev, user: newUser,
        items: prev.items.map(i => i.id === id ? { ...i, status: 'mastered', quizMastered: true, review } : i),
      }, 'quiz_')
    })
    setTimeout(() => checkAchievements(), 0)
  }, [checkAchievements])

  const quizFailed = useCallback((id: string) => {
    setState(prev => {
      const user = updateStreak(prev.user)
      const newUser = { ...user, totalQuizFailed: user.totalQuizFailed + 1 }
      api.updateUser(newUser).catch(() => {})
      api.updateItem(id, { status: 'sieved' } as Partial<SieveItem>).catch(() => {})
      return {
        ...prev,
        user: newUser,
        items: prev.items.map(i => i.id === id && i.status === 'mastered' ? { ...i, status: 'sieved' } : i),
      }
    })
  }, [])

  const addXp = useCallback((amount: number) => {
    updateUser(u => ({ ...u, xp: u.xp + amount, level: getLevel(u.xp + amount) }))
  }, [updateUser])

  const toggleFavorite = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id)
      if (!item) return prev
      const fav = !item.favorite
      api.updateItem(id, { favorite: fav } as Partial<SieveItem>).catch(() => {})
      return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, favorite: fav } : i) }
    })
  }, [])

  const toggleArchive = useCallback((id: string) => {
    setState(prev => {
      const item = prev.items.find(i => i.id === id)
      if (!item) return prev
      const arch = !item.archived
      api.updateItem(id, { archived: arch } as Partial<SieveItem>).catch(() => {})
      return { ...prev, items: prev.items.map(i => i.id === id ? { ...i, archived: arch } : i) }
    })
  }, [])

  const deleteItem = useCallback((id: string) => {
    setState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
    api.deleteItem(id).catch(() => {})
  }, [])

  const setTags = useCallback((id: string, tags: string[]) => {
    setState(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, tags } : i) }))
    api.updateItem(id, { tags } as Partial<SieveItem>).catch(() => {})
  }, [])

  const addTag = useCallback((name: string, color: string) => {
    const tag: TagInfo = { id: nanoid(), name, color }
    setState(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    api.createTag(tag).catch(() => {})
    return tag.id
  }, [])

  const removeTag = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t.id !== id),
      items: prev.items.map(i => ({ ...i, tags: i.tags.filter(t => t !== id) })),
    }))
    api.deleteTag(id).catch(() => {})
  }, [])

  const completeQuest = useCallback((id: string) => {
    setState(prev => {
      const quest = prev.dailyQuests.find(q => q.id === id)
      if (!quest || quest.completed || quest.progress < quest.target) return prev
      const updated = prev.dailyQuests.map(q => q.id === id ? { ...q, completed: true } : q)
      api.updateQuest(id, { completed: true } as Partial<DailyQuest>).catch(() => {})
      return { ...prev, dailyQuests: updated, user: { ...prev.user, xp: prev.user.xp + quest.xpReward, level: getLevel(prev.user.xp + quest.xpReward) } }
    })
  }, [])

  const createReviewEntry = useCallback((id: string, grades: number[]) => {
    const review = createReview(grades)
    setState(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, review } : i) }))
    api.updateItem(id, { review } as Partial<SieveItem>).catch(() => {})
  }, [])

  const updateReview = useCallback((id: string, grade: number) => {
    setState(prev => {
      const user = updateStreak(prev.user)
      const newUser = { ...user, xp: user.xp + XP_PER_REVIEW, level: getLevel(user.xp + XP_PER_REVIEW) }
      const item = prev.items.find(i => i.id === id)
      const oldReview: ReviewEntry | null = item?.review ?? null
      const newReview: ReviewEntry | null = oldReview ? scheduleReview(oldReview, grade) : null
      const items = prev.items.map(i => i.id === id && newReview ? { ...i, review: newReview } : i)
      api.updateUser(newUser).catch(() => {})
      if (newReview) {
        api.updateItem(id, { review: newReview } as Partial<SieveItem>).catch(() => {})
        if (oldReview) {
          const log = {
            itemId: id, grade,
            easeBefore: oldReview.easeFactor,
            easeAfter: newReview.easeFactor,
            intervalBefore: oldReview.interval,
            intervalAfter: newReview.interval,
            date: new Date().toISOString(),
          }
          api.createReviewLog(log).catch(() => {})
          return incrementQuest({ ...prev, user: newUser, items, reviewLogs: [{ ...log, id: '' }, ...prev.reviewLogs] }, 'review_')
        }
      }
      return incrementQuest({ ...prev, user: newUser, items }, 'review_')
    })
    setTimeout(() => checkAchievements(), 0)
  }, [checkAchievements])

  return (
    <AppContext.Provider value={{
      state, loading, migrating, error,
      setDarkMode, addItem, addItemFull, markAsRead, markQuizMastered, quizFailed, addXp,
      toggleFavorite, toggleArchive, deleteItem, setTags, addTag, removeTag,
      completeQuest, createReviewEntry, updateReview, checkAchievements, setCustomTheme,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
