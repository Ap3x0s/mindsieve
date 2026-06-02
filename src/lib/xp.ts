export const XP_PER_READ = 10
export const XP_PER_QUIZ = 50
export const XP_PER_REVIEW = 15
export const XP_PER_QUEST = 30

export function getLevel(xp: number): number {
  return Math.floor(xp / 100) + 1
}

export function xpForLevel(level: number): number {
  return (level - 1) * 100
}

export function xpToNextLevel(xp: number): number {
  const current = getLevel(xp)
  const currentFloor = xpForLevel(current)
  const nextFloor = xpForLevel(current + 1)
  return nextFloor - currentFloor
}

export function levelProgress(xp: number): number {
  const current = getLevel(xp)
  const currentFloor = xpForLevel(current)
  return xp - currentFloor
}

export function xpNeededForNext(xp: number): number {
  const current = getLevel(xp)
  return xpForLevel(current + 1) - xp
}
