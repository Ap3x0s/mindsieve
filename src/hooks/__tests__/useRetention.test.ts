import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRetention } from '../useRetention'
import type { SieveItem } from '../../types'

const pastDue: SieveItem = {
  id: '1', title: 'Past', domain: 'a.com', url: '', date: new Date().toISOString(),
  readingTime: '1 min', summary: [], actionItems: [], quiz: [],
  status: 'sieved', xpAwarded: true, quizMastered: false,
  tags: [], favorite: false, archived: false, sourceType: 'link',
  review: { dueDate: new Date(0).toISOString(), interval: 1, easeFactor: 2.5, repetitions: 3 },
}

const futureDue: SieveItem = {
  id: '2', title: 'Future', domain: 'b.com', url: '', date: new Date().toISOString(),
  readingTime: '1 min', summary: [], actionItems: [], quiz: [],
  status: 'sieved', xpAwarded: true, quizMastered: false,
  tags: [], favorite: false, archived: false, sourceType: 'link',
  review: { dueDate: new Date(Date.now() + 86400000 * 30).toISOString(), interval: 30, easeFactor: 2.5, repetitions: 5 },
}

const noReview: SieveItem = {
  id: '3', title: 'None', domain: 'c.com', url: '', date: new Date().toISOString(),
  readingTime: '1 min', summary: [], actionItems: [], quiz: [],
  status: 'unread', xpAwarded: false, quizMastered: false,
  tags: [], favorite: false, archived: false, sourceType: 'link',
  review: null,
}

const archived: SieveItem = {
  ...pastDue, id: '4', title: 'Archived', archived: true,
}

describe('useRetention', () => {
  it('returns due items with past due date', () => {
    const { result } = renderHook(() => useRetention([pastDue, futureDue, noReview]))
    expect(result.current.dueItems).toHaveLength(1)
    expect(result.current.dueItems[0].id).toBe('1')
  })

  it('excludes archived items from due', () => {
    const { result } = renderHook(() => useRetention([pastDue, archived]))
    expect(result.current.dueItems).toHaveLength(1)
    expect(result.current.dueItems[0].id).toBe('1')
  })

  it('returns empty due for no items', () => {
    const { result } = renderHook(() => useRetention([]))
    expect(result.current.dueItems).toHaveLength(0)
  })

  it('calculates retention score', () => {
    const { result } = renderHook(() => useRetention([pastDue, noReview]))
    const high = result.current.itemsWithScore.find(i => i.id === '1')
    const none = result.current.itemsWithScore.find(i => i.id === '3')
    expect(high?.retentionScore).toBeGreaterThan(0)
    expect(none?.retentionScore).toBe(0)
  })

  it('score returns correct values by ease factor', () => {
    const { result } = renderHook(() => useRetention([pastDue]))
    const high = result.current.score(pastDue.review)
    expect(high).toBe(80)

    const low = result.current.score({ dueDate: new Date().toISOString(), interval: 1, easeFactor: 1.3, repetitions: 0 })
    expect(low).toBe(30)

    const null_ = result.current.score(null)
    expect(null_).toBe(0)
  })
})
