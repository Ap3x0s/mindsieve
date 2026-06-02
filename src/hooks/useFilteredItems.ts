import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'

export type SortOption = 'newest' | 'oldest' | 'title' | 'xp'

export function useFilteredItems() {
  const { state } = useApp()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [tagFilter, setTagFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [showArchived, setShowArchived] = useState(false)

  const filtered = useMemo(() => {
    let list = [...state.items]
    if (!showArchived) list = list.filter(i => !i.archived)
    if (statusFilter !== 'all') list = list.filter(i => i.status === statusFilter)
    if (tagFilter !== 'all') list = list.filter(i => i.tags.includes(tagFilter))
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.title.toLowerCase().includes(q) || i.domain.toLowerCase().includes(q) || i.summary.some(s => s.toLowerCase().includes(q)))
    }
    switch (sort) {
      case 'newest': return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      case 'oldest': return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      case 'title': return list.sort((a, b) => a.title.localeCompare(b.title))
      default: return list
    }
  }, [state.items, search, statusFilter, tagFilter, sort, showArchived])

  return { filtered, search, setSearch, statusFilter, setStatusFilter, tagFilter, setTagFilter, sort, setSort, showArchived, setShowArchived }
}
