import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFilteredItems } from '../useFilteredItems'
import { createElement, type ReactNode } from 'react'
import { AppProvider } from '../../context/AppContext'

vi.mock('../../lib/api')

function Wrapper({ children }: { children?: ReactNode }) {
  return createElement(AppProvider, null, children)
}

describe('useFilteredItems', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('returns all items by default', async () => {
    const { result } = renderHook(() => useFilteredItems(), { wrapper: Wrapper })
    await waitFor(() => {
      expect(result.current.filtered.length).toBe(3)
    })
  })

  it('filters by search query', async () => {
    const { result } = renderHook(() => useFilteredItems(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.filtered.length).toBe(3))
    act(() => result.current.setSearch('habit'))
    await waitFor(() => {
      expect(result.current.filtered.length).toBe(1)
    })
    expect(result.current.filtered[0].title).toContain('Habit')
  })

  it('filters by status', async () => {
    const { result } = renderHook(() => useFilteredItems(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.filtered.length).toBe(3))
    act(() => result.current.setStatusFilter('sieved'))
    const allSieved = result.current.filtered.every(i => i.status === 'sieved')
    expect(allSieved).toBe(true)
  })

  it('sorts by newest (default)', async () => {
    const { result } = renderHook(() => useFilteredItems(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.filtered.length).toBe(3))
    const dates = result.current.filtered.map(i => new Date(i.date).getTime())
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i]).toBeLessThanOrEqual(dates[i - 1])
    }
  })

  it('sorts by title', async () => {
    const { result } = renderHook(() => useFilteredItems(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.filtered.length).toBe(3))
    act(() => result.current.setSort('title'))
    const titles = result.current.filtered.map(i => i.title)
    const sorted = [...titles].sort((a, b) => a.localeCompare(b))
    expect(titles).toEqual(sorted)
  })
})
