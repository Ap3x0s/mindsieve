import { describe, it, expect } from 'vitest'
import { getLevel, xpForLevel, levelProgress, xpNeededForNext } from '../xp'

describe('getLevel', () => {
  it('returns level 1 for 0 XP', () => expect(getLevel(0)).toBe(1))
  it('returns level 1 for 99 XP', () => expect(getLevel(99)).toBe(1))
  it('returns level 2 for 100 XP', () => expect(getLevel(100)).toBe(2))
  it('returns level 5 for 450 XP', () => expect(getLevel(450)).toBe(5))
  it('returns level 11 for 1000 XP', () => expect(getLevel(1000)).toBe(11))
})

describe('xpForLevel', () => {
  it('returns 0 for level 1', () => expect(xpForLevel(1)).toBe(0))
  it('returns 100 for level 2', () => expect(xpForLevel(2)).toBe(100))
  it('returns 500 for level 6', () => expect(xpForLevel(6)).toBe(500))
})

describe('levelProgress', () => {
  it('returns 50 for 50 XP', () => expect(levelProgress(50)).toBe(50))
  it('returns 0 for 100 XP (just leveled)', () => expect(levelProgress(100)).toBe(0))
  it('returns 50 for 150 XP', () => expect(levelProgress(150)).toBe(50))
})

describe('xpNeededForNext', () => {
  it('returns 100 for 0 XP (need 100 for level 2)', () => expect(xpNeededForNext(0)).toBe(100))
  it('returns 50 for 50 XP', () => expect(xpNeededForNext(50)).toBe(50))
  it('returns 100 for 100 XP (need 100 for level 3)', () => expect(xpNeededForNext(100)).toBe(100))
})
