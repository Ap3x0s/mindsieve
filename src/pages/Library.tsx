import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Trash2, Archive, Star, Upload, Sparkles } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useFilteredItems } from '../hooks/useFilteredItems'
import ContentCard from '../components/ContentCard'
import SwipeableCard from '../components/SwipeableCard'
import ImportModal from '../components/ImportModal'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSkeleton, { FilterBarSkeleton } from '../components/LoadingSkeleton'
import { extractKeywords } from '../lib/mockAI'
import { getConfig, callOmniRoute } from '../lib/omniroute'
import { TAG_COLORS } from '../lib/constants'

export default function Library() {
  const navigate = useNavigate()
  const { state, loading, toggleFavorite, toggleArchive, deleteItem } = useApp()
  const { filtered, search, setSearch, statusFilter, setStatusFilter, tagFilter, setTagFilter, sort, setSort, showArchived, setShowArchived } = useFilteredItems()
  const [showImport, setShowImport] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [editingTags, setEditingTags] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const toggleSelect = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  const bulkAction = (action: 'archive' | 'delete' | 'favorite') => {
    selectedItems.forEach(id => {
      if (action === 'archive') toggleArchive(id)
      if (action === 'delete') deleteItem(id)
      if (action === 'favorite') toggleFavorite(id)
    })
    setSelectedItems(new Set())
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Library</h1>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setShowImport(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import
          </button>
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {['all', 'unread', 'sieved', 'mastered'].map(s => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setSelectedItems(new Set()) }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-[background] cursor-pointer ${
              statusFilter === s
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-surface-700)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-600)]'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <div className="w-px h-5 bg-[var(--color-border)] mx-1" />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-700)] text-xs text-[var(--color-text-secondary)] outline-none cursor-pointer"
        >
          <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="title">Title A-Z</option>
        </select>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-[background] cursor-pointer flex items-center gap-1 ${
            showArchived ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-700)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
          }`}
        >
          <Archive className="w-3 h-3" />
          Archived
        </button>
      </div>

      {state.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-xs text-[var(--color-text-muted)]">Tags:</span>
          <button
            onClick={() => setTagFilter('all')}
            className={`px-2.5 py-1 rounded-md text-xs cursor-pointer ${
              tagFilter === 'all' ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
            }`}
          >
            All
          </button>
          {state.tags.map(t => (
            <button
              key={t.id}
              onClick={() => setTagFilter(t.id)}
              className={`px-2.5 py-1 rounded-md text-xs cursor-pointer ${
                tagFilter === t.id ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {selectedItems.size > 0 && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
          <span className="text-sm text-[var(--color-text-secondary)]">{selectedItems.size} selected</span>
          <button onClick={() => bulkAction('favorite')} className="ml-auto p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] cursor-pointer"><Star className="w-4 h-4" /></button>
          <button onClick={() => bulkAction('archive')} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] cursor-pointer"><Archive className="w-4 h-4" /></button>
          <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg text-danger hover:bg-danger/10 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
          <button onClick={() => setSelectedItems(new Set())} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {editingTags && (
        <TagEditor itemId={editingTags} onClose={() => setEditingTags(null)} />
      )}

      {loading ? (
        <div className="px-6 py-4 space-y-3">
          <FilterBarSkeleton />
          <LoadingSkeleton />
        </div>
      ) : (
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--color-text-muted)]">No items match your filters.</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 opacity-60">Try changing the search query, status filter, or clearing tags.</p>
          </div>
        ) : (
          filtered.map(item => (
            <SwipeableCard key={item.id} onSwipeLeft={() => toggleArchive(item.id)} onSwipeRight={() => toggleFavorite(item.id)}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  className="shrink-0 w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-accent)] cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <ContentCard item={item} onClick={() => navigate(`/sieve/${item.id}`)} />
                </div>
              </div>
            </SwipeableCard>
          ))
        )}
      </div>
      )}

      {showImport && <ImportModal onClose={() => setShowImport(false)} />}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete items?"
        message={`Are you sure you want to delete ${selectedItems.size} selected item(s)?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { bulkAction('delete'); setShowDeleteConfirm(false) }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  )
}

function TagEditor({ itemId, onClose }: { itemId: string; onClose: () => void }) {
  const { state, setTags, addTag, removeTag } = useApp()
  const item = state.items.find(i => i.id === itemId)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366F1')
  const [removeTagConfirm, setRemoveTagConfirm] = useState<string | null>(null)

  const toggle = (tagId: string) => {
    if (!item) return
    const next = item.tags.includes(tagId) ? item.tags.filter(t => t !== tagId) : [...item.tags, tagId]
    setTags(itemId, next)
  }

  const createTag = () => {
    if (!newName.trim()) return
    addTag(newName.trim(), newColor)
    setNewName('')
  }

  const handleAutoTag = async () => {
    if (!item) return
    const text = `${item.title} ${item.summary.join(' ')} ${item.domain}`
    const cfg = getConfig()
    let keywords: string[]
    if (cfg) {
      try {
        const result = await callOmniRoute(`Extract 3-5 topic tags from this text. Return ONLY JSON: {"tags":["tag1","tag2"]}\n\n${text}`, cfg)
        keywords = result.tags || []
      } catch {
        keywords = extractKeywords(text)
      }
    } else {
      keywords = extractKeywords(text)
    }
    const tagIds = new Set(item.tags)
    for (const kw of keywords) {
      if (tagIds.size >= 5) break
      const match = state.tags.find(t => t.name.toLowerCase() === kw.toLowerCase())
      if (match) {
        tagIds.add(match.id)
      } else {
        const realId = addTag(kw.charAt(0).toUpperCase() + kw.slice(1), TAG_COLORS[tagIds.size % TAG_COLORS.length])
        tagIds.add(realId)
      }
    }
    setTags(itemId, Array.from(tagIds))
  }

  return (
    <div className="mb-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Edit Tags</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoTag}
            disabled={!item}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-700)] text-[var(--color-text-secondary)] text-xs hover:bg-[var(--color-surface-600)] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3" /> Auto-tag
          </button>
          <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {state.tags.map(t => (
          <div key={t.id} className="flex items-center gap-0.5">
            <button
              onClick={() => toggle(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-[background] cursor-pointer ${
                item?.tags.includes(t.id)
                  ? 'text-white'
                  : 'text-[var(--color-text-secondary)] border border-[var(--color-border)]'
              }`}
              style={item?.tags.includes(t.id) ? { backgroundColor: t.color } : {}}
            >
              {t.name}
            </button>
            <button
              onClick={() => setRemoveTagConfirm(t.id)}
              className="p-0.5 rounded-full text-[var(--color-text-muted)] hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
              title={`Delete tag "${t.name}"`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New tag name..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-700)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none"
        />
        <input
          type="color"
          value={newColor}
          onChange={e => setNewColor(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer"
        />
        <button onClick={createTag} className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">Add</button>
      </div>

      <ConfirmDialog
        open={removeTagConfirm !== null}
        title="Delete tag?"
        message={removeTagConfirm ? `Delete this tag from all items? This cannot be undone.` : ''}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { if (removeTagConfirm) { removeTag(removeTagConfirm); setRemoveTagConfirm(null) } }}
        onCancel={() => setRemoveTagConfirm(null)}
      />
    </div>
  )
}
