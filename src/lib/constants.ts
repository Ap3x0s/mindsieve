export const TAG_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EF4444', '#14B8A6']

export const ACHIEVEMENT_THRESHOLDS = {
  first_read: 1,
  quiz_ace: 10,
  streak_7: 0,
  curator: 50,
  deep_reader: 15,
  level_5: 5,
  level_10: 10,
  collector: 5,
  perfectionist: 10,
} as const

export const STORAGE_PREFIX = 'mindsieve'

export function storageKey(key: string): string {
  return `${STORAGE_PREFIX}_${key}`
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
