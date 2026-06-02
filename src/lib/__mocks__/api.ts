import { vi } from 'vitest'
import { mockArticles } from '../../data/mockData'
import { defaultAchievements } from '../../lib/achievements'

const defaultTags = [
  { id: 'tag-tech', name: 'Tech', color: '#6366F1' },
  { id: 'tag-psych', name: 'Psychology', color: '#EC4899' },
  { id: 'tag-crypto', name: 'Crypto', color: '#F59E0B' },
]

export const api = {
  loadState: vi.fn().mockResolvedValue({
    items: mockArticles.map(i => ({
      ...i,
      tags: [...i.tags],
      summary: [...i.summary],
      actionItems: [...i.actionItems],
      quiz: i.quiz.map(q => ({ ...q })),
      review: i.review ? { ...i.review } : null,
    })),
    user: { id: 1, xp: 450, level: 5, totalRead: 0, totalQuizMastered: 0, totalQuizFailed: 0, streak: 0, lastActiveDate: '' },
    tags: defaultTags,
    achievements: defaultAchievements.map(a => ({ ...a })),
    dailyQuests: [],
    reviewLogs: [],
    customTheme: null,
  }),
  createItem: vi.fn().mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve({ id: 'new-id', ...data })
  ),
  updateItem: vi.fn().mockImplementation((_id: string, data: Record<string, unknown>) =>
    Promise.resolve(data)
  ),
  deleteItem: vi.fn().mockResolvedValue(undefined),
  updateUser: vi.fn().mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(data)
  ),
  getTags: vi.fn().mockResolvedValue(defaultTags),
  createTag: vi.fn().mockImplementation((data: Record<string, unknown>) =>
    Promise.resolve(data)
  ),
  deleteTag: vi.fn().mockResolvedValue(undefined),
  updateAchievement: vi.fn().mockImplementation((_id: string, data: Record<string, unknown>) =>
    Promise.resolve(data)
  ),
  updateQuest: vi.fn().mockImplementation((_id: string, data: Record<string, unknown>) =>
    Promise.resolve(data)
  ),
  migrate: vi.fn().mockResolvedValue(undefined),
}
