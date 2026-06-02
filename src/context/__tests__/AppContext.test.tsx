import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppProvider, useApp } from '../AppContext'

vi.mock('../../lib/api')

function TestHarness() {
  const ctx = useApp()
  return (
    <div>
      <span data-testid="xp">{ctx.state.user.xp}</span>
      <span data-testid="level">{ctx.state.user.level}</span>
      <span data-testid="items">{ctx.state.items.length}</span>
      <span data-testid="streak">{ctx.state.user.streak}</span>
      <span data-testid="read">{ctx.state.user.totalRead}</span>
      <span data-testid="mastered">{ctx.state.user.totalQuizMastered}</span>
      <span data-testid="quiz-failed">{ctx.state.user.totalQuizFailed}</span>
      {ctx.state.items.map(i => (
        <div key={i.id} data-testid={`item-${i.id}`}>
          <span data-testid={`status-${i.id}`}>{i.status}</span>
          <span data-testid={`fav-${i.id}`}>{String(i.favorite)}</span>
          <span data-testid={`arch-${i.id}`}>{String(i.archived)}</span>
          <span data-testid={`xp-awarded-${i.id}`}>{String(i.xpAwarded)}</span>
          <span data-testid={`date-${i.id}`}>{i.date}</span>
        </div>
      ))}
      <button data-testid="call-markRead" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.markAsRead(first.id)
      }}>Mark Read</button>
      <button data-testid="call-master" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.markQuizMastered(first.id, [5, 5, 5])
      }}>Master Quiz</button>
      <button data-testid="call-quizfail" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.quizFailed(first.id)
      }}>Fail Quiz</button>
      <button data-testid="call-fav" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.toggleFavorite(first.id)
      }}>Toggle Fav</button>
      <button data-testid="call-arch" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.toggleArchive(first.id)
      }}>Toggle Arch</button>
      <button data-testid="call-delete" onClick={() => {
        const first = ctx.state.items[0]
        if (first) ctx.deleteItem(first.id)
      }}>Delete</button>
    </div>
  )
}

function renderWithProvider() {
  return render(
    <AppProvider>
      <TestHarness />
    </AppProvider>
  )
}

describe('AppContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('initializes with items and user state', async () => {
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId('items').textContent).toBe('3')
    })
    expect(screen.getByTestId('xp').textContent).toBe('450')
    expect(screen.getByTestId('level').textContent).toBe('5')
  })

  it('adds a new item when addItem is called', async () => {
    function AddTest() {
      const ctx = useApp()
      return (
        <div>
          <span data-testid="count">{ctx.state.items.length}</span>
          <button onClick={() => ctx.addItem({
            title: 'New', domain: 'test.com', url: 'https://test.com',
            readingTime: '1 min read', summary: [], actionItems: [], quiz: [],
            status: 'unread', xpAwarded: false, quizMastered: false, sourceType: 'link',
          })}>Add</button>
        </div>
      )
    }
    render(<AppProvider><AddTest /></AppProvider>)
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('3')
    })
    fireEvent.click(screen.getByText('Add'))
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('4')
    })
  })

  it('markAsRead awards XP and changes status', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    const initialXp = Number(screen.getByTestId('xp').textContent)
    fireEvent.click(screen.getByTestId('call-markRead'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('xp').textContent)).toBe(initialXp + 10)
    })
    expect(Number(screen.getByTestId('read').textContent)).toBe(1)
  })

  it('markQuizMastered awards XP and changes status', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    const initialXp = Number(screen.getByTestId('xp').textContent)
    fireEvent.click(screen.getByTestId('call-master'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('xp').textContent)).toBe(initialXp + 50)
    })
    expect(Number(screen.getByTestId('mastered').textContent)).toBe(1)
  })

  it('quizFailed increments counter', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    fireEvent.click(screen.getByTestId('call-quizfail'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('quiz-failed').textContent)).toBe(1)
    })
    fireEvent.click(screen.getByTestId('call-quizfail'))
    await waitFor(() => {
      expect(Number(screen.getByTestId('quiz-failed').textContent)).toBe(2)
    })
  })

  it('toggleFavorite toggles', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    fireEvent.click(screen.getByTestId('call-fav'))
    fireEvent.click(screen.getByTestId('call-fav'))
  })

  it('toggleArchive toggles', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    fireEvent.click(screen.getByTestId('call-arch'))
    fireEvent.click(screen.getByTestId('call-arch'))
  })

  it('deleteItem removes item', async () => {
    renderWithProvider()
    await waitFor(() => expect(screen.getByTestId('items').textContent).toBe('3'))
    fireEvent.click(screen.getByTestId('call-delete'))
    await waitFor(() => {
      expect(screen.getByTestId('items').textContent).toBe('2')
    })
  })

  it('stores dates in ISO format', async () => {
    renderWithProvider()
    await waitFor(() => {
      expect(screen.getByTestId('items').textContent).toBe('3')
    })
    expect(screen.getByTestId('date-1').textContent).toMatch(/T/)
  })
})
