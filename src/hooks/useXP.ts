import { useMemo } from 'react'
import { getLevel, levelProgress, xpNeededForNext } from '../lib/xp'

export function useXP(xp: number) {
  return useMemo(() => ({
    level: getLevel(xp),
    progress: levelProgress(xp),
    needed: xpNeededForNext(xp),
    xp,
  }), [xp])
}
