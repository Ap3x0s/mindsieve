import type { SieveItem, UserState, Achievement, DailyQuest, TagInfo, AppState, ReviewLog } from '../types'
import { getToken } from './auth'
import { API_BASE_URL } from './constants'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...options,
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${err.slice(0, 200)}`)
  }
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

function parseJSONArray(val: string | undefined | null): unknown[] {
  if (!val) return []
  try { return JSON.parse(val) } catch { return [] }
}

function parseItem(item: Record<string, unknown>): SieveItem {
  return {
    id: item.id as string,
    title: item.title as string,
    domain: item.domain as string,
    url: item.url as string,
    date: item.date as string,
    readingTime: item.readingTime as string,
    image: item.image as string | undefined,
    summary: parseJSONArray(item.summary as string) as string[],
    actionItems: parseJSONArray(item.actionItems as string) as string[],
    quiz: parseJSONArray(item.quiz as string) as SieveItem['quiz'],
    status: item.status as SieveItem['status'],
    xpAwarded: item.xpAwarded as boolean,
    quizMastered: item.quizMastered as boolean,
    tags: parseJSONArray(item.tags as string) as string[],
    favorite: item.favorite as boolean,
    archived: item.archived as boolean,
    sourceType: item.sourceType as SieveItem['sourceType'],
    review: item.review ? JSON.parse(item.review as string) : null,
  }
}

export const api = {
  async loadState(): Promise<Omit<AppState, 'darkMode'>> {
    const [items, user, tags, achievements, quests, reviewLogs] = await Promise.all([
      request<Record<string, unknown>[]>('/items'),
      request<Record<string, unknown>>('/user'),
      request<TagInfo[]>('/tags'),
      request<Achievement[]>('/achievements'),
      request<DailyQuest[]>('/quests'),
      request<ReviewLog[]>('/reviews'),
    ])
    return {
      items: items.map(parseItem),
      user: user as unknown as UserState,
      tags,
      achievements,
      dailyQuests: quests,
      reviewLogs,
      customTheme: null,
    }
  },

  async createItem(data: Omit<SieveItem, 'id' | 'date' | 'tags' | 'favorite' | 'archived' | 'review'>): Promise<SieveItem> {
    const item = await request<Record<string, unknown>>('/items', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return parseItem(item)
  },

  async updateItem(id: string, data: Partial<SieveItem>): Promise<SieveItem> {
    const item = await request<Record<string, unknown>>(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return parseItem(item)
  },

  async deleteItem(id: string): Promise<void> {
    await request(`/items/${id}`, { method: 'DELETE' })
  },

  async updateUser(data: Partial<UserState>): Promise<UserState> {
    return request('/user', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  async getTags(): Promise<TagInfo[]> {
    return request('/tags')
  },

  async createTag(data: TagInfo): Promise<TagInfo> {
    return request('/tags', { method: 'POST', body: JSON.stringify(data) })
  },

  async deleteTag(id: string): Promise<void> {
    await request(`/tags/${id}`, { method: 'DELETE' })
  },

  async updateAchievement(id: string, data: Partial<Achievement>): Promise<Achievement> {
    return request(`/achievements/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  async updateQuest(id: string, data: Partial<DailyQuest>): Promise<DailyQuest> {
    return request(`/quests/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  },

  async migrate(data: {
    items?: SieveItem[]
    user?: UserState
    tags?: TagInfo[]
    achievements?: Achievement[]
    quests?: DailyQuest[]
  }): Promise<void> {
    await request('/migrate', { method: 'POST', body: JSON.stringify(data) })
  },

  async getReviewLogs(): Promise<ReviewLog[]> {
    return request('/reviews')
  },

  async getItemReviewLogs(itemId: string): Promise<ReviewLog[]> {
    return request(`/reviews/${itemId}`)
  },

  async createReviewLog(data: Omit<ReviewLog, 'id' | 'createdAt'>): Promise<ReviewLog> {
    return request('/reviews', { method: 'POST', body: JSON.stringify(data) })
  },
}
