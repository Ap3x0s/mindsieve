import { describe, it, expect } from 'vitest'
import { createReview, scheduleReview, isReviewDue } from '../sm2'

describe('createReview', () => {
  it('creates a review entry with default ease', () => {
    const r = createReview([5])
    expect(r.interval).toBe(1)
    expect(r.easeFactor).toBeGreaterThanOrEqual(2.5)
    expect(r.repetitions).toBe(1)
    expect(r.dueDate).toBeTruthy()
  })

  it('resets on bad grade', () => {
    const r = createReview([1])
    expect(r.repetitions).toBe(0)
    expect(r.interval).toBe(1)
  })
})

describe('scheduleReview', () => {
  it('increases interval on good grades', () => {
    const r1 = createReview([5])
    const r2 = scheduleReview(r1, 5)
    expect(r2.interval).toBe(6)
    expect(r2.repetitions).toBe(2)
  })

  it('resets on bad grade', () => {
    const r1 = createReview([5])
    const r2 = scheduleReview(r1, 1)
    expect(r2.interval).toBe(1)
    expect(r2.repetitions).toBe(0)
  })

  it('applies ease factor for subsequent intervals', () => {
    const r1 = createReview([5])
    const r2 = scheduleReview(r1, 5)
    const r3 = scheduleReview(r2, 4)
    expect(r3.interval).toBeGreaterThanOrEqual(6 * 2.3)
  })
})

describe('isReviewDue', () => {
  it('returns false for null', () => expect(isReviewDue(null)).toBe(false))
  it('returns true for past date', () => {
    const entry = createReview([5])
    entry.dueDate = new Date(0).toISOString()
    expect(isReviewDue(entry)).toBe(true)
  })
})
