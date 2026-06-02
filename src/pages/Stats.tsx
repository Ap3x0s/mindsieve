import { useMemo, useState, useEffect } from 'react'
import {
  Zap, BookOpen, BrainCircuit, Flame, Trophy, CheckCircle,
  BarChart4, Clock, Tag, Globe, Snowflake,
  GraduationCap, BookCheck, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useXP } from '../hooks/useXP'
import { useNavigate } from 'react-router-dom'
import { subDays, isSameDay, format, startOfWeek, addDays } from 'date-fns'
import { StatCardSkeleton } from '../components/LoadingSkeleton'
import { XP_PER_READ, XP_PER_QUIZ, XP_PER_REVIEW } from '../lib/xp'
import { loadSm2Settings } from '../lib/sm2'
import { ACHIEVEMENT_THRESHOLDS } from '../lib/constants'

const PERIOD_OPTIONS = [
  { value: 7, label: '7d' },
  { value: 30, label: '30d' },
  { value: 90, label: '90d' },
  { value: 365, label: '1y' },
]

const VIEW_OPTIONS = [
  { value: 'calendar' as const, label: 'Calendar' },
  { value: 'timeline' as const, label: 'Timeline' },
]

function QuestIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1.5L14.5 8H21L16 12.5L18 19L12 15.5L6 19L8 12.5L3 8H9.5L12 1.5z" />
      <polyline points="10.5,11.5 11.8,13 14,10.5" />
    </svg>
  )
}

function getIntensityClass(count: number, max: number): string {
  if (count === 0) return 'bg-[var(--color-surface-700)]'
  const ratio = count / max
  if (ratio > 0.5) return 'bg-[var(--color-accent)]/60'
  if (ratio > 0.2) return 'bg-[var(--color-accent)]/30'
  return 'bg-[var(--color-accent)]/10'
}

function calcAchievementProgress(a: { id: string; unlocked: boolean }, items: number, mastered: number, streak: number, level: number, totalRead: number, totalQuizMastered: number, uniqueTags: number, hasDeepReader: boolean, streakFreezeDays: number): { current: number; target: number } | null {
  if (a.unlocked) return null
  switch (a.id) {
    case 'first_read': return { current: Math.min(totalRead, ACHIEVEMENT_THRESHOLDS.first_read), target: ACHIEVEMENT_THRESHOLDS.first_read }
    case 'quiz_ace': return { current: Math.min(totalQuizMastered, ACHIEVEMENT_THRESHOLDS.quiz_ace), target: ACHIEVEMENT_THRESHOLDS.quiz_ace }
    case 'streak_7': return { current: Math.min(streak, streakFreezeDays), target: streakFreezeDays }
    case 'curator': return { current: Math.min(items, ACHIEVEMENT_THRESHOLDS.curator), target: ACHIEVEMENT_THRESHOLDS.curator }
    case 'deep_reader': return { current: hasDeepReader ? 1 : 0, target: ACHIEVEMENT_THRESHOLDS.deep_reader > 0 ? 1 : 1 }
    case 'level_5': return { current: Math.min(level, ACHIEVEMENT_THRESHOLDS.level_5), target: ACHIEVEMENT_THRESHOLDS.level_5 }
    case 'level_10': return { current: Math.min(level, ACHIEVEMENT_THRESHOLDS.level_10), target: ACHIEVEMENT_THRESHOLDS.level_10 }
    case 'collector': return { current: Math.min(uniqueTags, ACHIEVEMENT_THRESHOLDS.collector), target: ACHIEVEMENT_THRESHOLDS.collector }
    case 'perfectionist': return { current: Math.min(mastered, ACHIEVEMENT_THRESHOLDS.perfectionist), target: ACHIEVEMENT_THRESHOLDS.perfectionist }
    default: return null
  }
}

export default function Stats() {
  const { state, loading, completeQuest } = useApp()
  const navigate = useNavigate()
  const user = state.user
  const { progress, needed } = useXP(user.xp)
  const [periodDays, setPeriodDays] = useState(30)
  const [retentionView, setRetentionView] = useState<'calendar' | 'timeline'>('calendar')
  const [achievePage, setAchievePage] = useState(0)

  const ACHIEVEMENTS_PER_PAGE = 3
  const totalAchievementPages = Math.ceil(state.achievements.length / ACHIEVEMENTS_PER_PAGE)
  const paginatedAchievements = state.achievements.slice(achievePage * ACHIEVEMENTS_PER_PAGE, (achievePage + 1) * ACHIEVEMENTS_PER_PAGE)

  useEffect(() => {
    if (achievePage >= totalAchievementPages && totalAchievementPages > 0) {
      setAchievePage(totalAchievementPages - 1)
    }
  }, [totalAchievementPages])

  const activeItems = state.items.filter(i => !i.archived)
  const masteredCount = activeItems.filter(i => i.status === 'mastered').length
  const sievedCount = activeItems.filter(i => i.status === 'sieved').length
  const dueReviews = state.items.filter(i => i.review && new Date(i.review.dueDate) <= new Date()).length
  const streakFreezeDays = loadSm2Settings().streakFreezeDays
  const hasStreakFreeze = user.streak >= streakFreezeDays
  const uniqueTagIds = new Set(activeItems.flatMap(i => i.tags))

  const totalMinutes = useMemo(() => {
    let mins = 0
    for (const item of state.items) {
      const match = item.readingTime.match(/(\d+)/)
      if (match) mins += parseInt(match[1])
    }
    return mins
  }, [state.items])

  const readingDist = useMemo(() => {
    let quick = 0, medium = 0, deep = 0
    for (const item of activeItems) {
      const match = item.readingTime.match(/(\d+)/)
      const min = match ? parseInt(match[1]) : 5
      if (min <= 5) quick++
      else if (min <= 15) medium++
      else deep++
    }
    const total = quick + medium + deep || 1
    return { quick, medium, deep, total, quickPct: Math.round((quick / total) * 100), mediumPct: Math.round((medium / total) * 100), deepPct: Math.round((deep / total) * 100) }
  }, [activeItems])

  const domainTop = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of activeItems) {
      const d = item.domain || 'unknown'
      counts[d] = (counts[d] || 0) + 1
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain, count]) => ({ domain, count, pct: Math.round((count / activeItems.length) * 100) }))
  }, [activeItems])

  const hasDeepReader = useMemo(() => activeItems.some(i => parseInt(i.readingTime) >= ACHIEVEMENT_THRESHOLDS.deep_reader), [activeItems])

  const tagUsage = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of activeItems) {
      for (const tagId of item.tags) {
        counts[tagId] = (counts[tagId] || 0) + 1
      }
    }
    return state.tags.map(t => ({ ...t, count: counts[t.id] || 0 })).sort((a, b) => b.count - a.count)
  }, [state.tags, activeItems])

  const reviewSuccessRate = useMemo(() => {
    const logs = state.reviewLogs
    if (logs.length === 0) return null
    const good = logs.filter(l => l.grade >= 3).length
    return Math.round((good / logs.length) * 100)
  }, [state.reviewLogs])

  const achievementProgress = useMemo(() => {
    const total = state.achievements.length
    const unlocked = state.achievements.filter(a => a.unlocked).length
    return { total, unlocked, percent: total > 0 ? Math.round((unlocked / total) * 100) : 0 }
  }, [state.achievements])

  const retentionData = useMemo(() => {
    const today = new Date()
    const dailyCounts: Record<string, number> = {}
    for (const log of state.reviewLogs) {
      const key = format(new Date(log.date), 'yyyy-MM-dd')
      dailyCounts[key] = (dailyCounts[key] || 0) + 1
    }

    const start = startOfWeek(subDays(today, periodDays - 1), { weekStartsOn: 1 })
    const cells: { date: Date; dayNum: number; count: number; isToday: boolean }[] = []
    for (let i = 0; i < periodDays; i++) {
      const d = addDays(start, i)
      cells.push({
        date: d,
        dayNum: d.getDate(),
        count: dailyCounts[format(d, 'yyyy-MM-dd')] || 0,
        isToday: isSameDay(d, today),
      })
    }

    const weeks: typeof cells[] = []
    let currentWeek: typeof cells = []
    for (const cell of cells) {
      currentWeek.push(cell)
      if (cell.date.getDay() === 0) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) weeks.push(currentWeek)

    const timeline: { date: string; label: string; count: number }[] = []
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = subDays(today, i)
      const key = format(d, 'yyyy-MM-dd')
      timeline.push({
        date: key,
        label: format(d, 'd/M'),
        count: dailyCounts[key] || 0,
      })
    }

    const maxCount = Math.max(...cells.map(c => c.count), 1)
    const totalReviews = cells.reduce((s, c) => s + c.count, 0)
    const activeDays = cells.filter(c => c.count > 0).length

    return { cells, weeks, timeline, maxCount, totalReviews, activeDays, today }
  }, [state.reviewLogs, periodDays])

  const weeklyDigest = useMemo(() => {
    const weekAgo = subDays(new Date(), 7)
    let reads = 0, quizzes = 0, reviews = 0, xp = 0
    for (const item of state.items) {
      const d = new Date(item.date)
      if (d >= weekAgo) {
        if (item.status !== 'unread') reads++
        if (item.quizMastered) quizzes++
      }
      if (item.xpAwarded && d >= weekAgo) xp += XP_PER_READ
      if (item.quizMastered && d >= weekAgo) xp += XP_PER_QUIZ
    }
    for (const log of state.reviewLogs) {
      if (new Date(log.date) >= weekAgo) {
        reviews++
        xp += XP_PER_REVIEW
      }
    }
    return { reads, quizzes, reviews, xp }
  }, [state.items, state.reviewLogs])

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
        </div>
      </div>
    )
  }

  if (state.items.length === 0) {
    return (
      <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto text-center">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6">Statistics</h1>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-700)] flex items-center justify-center mb-4">
            <BarChart4 className="w-8 h-8 text-[var(--color-text-muted)]" />
          </div>
          <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-1">No data yet</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mb-4">
            Start sieving content to see your reading stats, XP growth, and review performance.
          </p>
          <button onClick={() => navigate('/')} className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Statistics</h1>

      {/* Profile & Progress */}
      <section className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent)]/10 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-[var(--color-accent)]" />
            </div>
            <div>
              <p className="text-xs text-[var(--color-text-muted)]">Level {user.level}</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{user.xp} XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-right">
            <Flame className="w-5 h-5 text-[var(--color-warning)]" />
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{user.streak}</p>
              <p className="text-xs text-[var(--color-text-muted)]">day streak</p>
            </div>
            {hasStreakFreeze && <Snowflake className="w-3 h-3 text-[var(--color-success)]" />}
          </div>
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
            <span>{progress} / {needed} XP to Level {user.level + 1}</span>
            <span>{needed > 0 ? Math.round((progress / needed) * 100) : 100}%</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-700)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-success)] transition-all duration-500"
              style={{ width: `${needed > 0 ? (progress / needed) * 100 : 100}%` }}
            />
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-3 mt-3">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{weeklyDigest.reads}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Read{weeklyDigest.reads === 1 ? '' : 's'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{weeklyDigest.quizzes}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Quiz{weeklyDigest.quizzes === 1 ? '' : 'zes'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{weeklyDigest.reviews}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Review{weeklyDigest.reviews === 1 ? '' : 's'}</p>
            </div>
            <div>
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{weeklyDigest.xp > 0 ? `+${weeklyDigest.xp}` : '—'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">XP this week</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Habits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Reading Distribution
          </h2>
          <div className="space-y-3">
            <DistBar label="Quick (<5 min)" value={readingDist.quick} pct={readingDist.quickPct} color="#10B981" />
            <DistBar label="Medium (5-15 min)" value={readingDist.medium} pct={readingDist.mediumPct} color="#6366F1" />
            <DistBar label="Deep (>15 min)" value={readingDist.deep} pct={readingDist.deepPct} color="#F59E0B" />
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Reading Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{totalMinutes}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Total min read</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{state.items.length > 0 ? Math.round(totalMinutes / state.items.length) : 0}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Avg min / article</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{user.totalRead}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Articles read</p>
            </div>
            <div>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{reviewSuccessRate !== null ? `${reviewSuccessRate}%` : '—'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">Review success</p>
            </div>
          </div>
        </div>
      </div>

      {/* Retention */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-3.5 h-3.5" /> Retention
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[var(--color-surface-700)] rounded-lg p-0.5">
              {VIEW_OPTIONS.map(v => (
                <button
                  key={v.value}
                  onClick={() => setRetentionView(v.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    retentionView === v.value
                      ? 'bg-[var(--color-surface-600)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPeriodDays(opt.value)}
                  className={`px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                    periodDays === opt.value
                      ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] mb-3">
            <span>{retentionData.totalReviews} review{retentionData.totalReviews !== 1 ? 's' : ''}</span>
            <span>{retentionData.activeDays} active {retentionData.activeDays === 1 ? 'day' : 'days'}</span>
          </div>

          {retentionView === 'calendar' ? (
            <RetentionCalendar data={retentionData} intensityFn={getIntensityClass} periodDays={periodDays} />
          ) : (
            <RetentionTimeline data={retentionData} />
          )}
        </div>
      </section>

      {/* Daily Quests + Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <QuestIcon className="w-5.5 h-5.5" /> Daily Quests
          </h2>
          <div className="space-y-2">
            {state.dailyQuests.map(q => {
              const pct = q.target > 0 ? Math.min(100, Math.round((q.progress / q.target) * 100)) : 0
              return (
                <div key={q.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    q.completed ? 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface-800)]'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${q.completed ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-surface-700)]'}`}>
                      {q.completed ? <CheckCircle className="w-8 h-8 text-[var(--color-success)]" /> : <QuestIcon className="w-8 h-8 text-[var(--color-accent)]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${q.completed ? 'text-[var(--color-text-muted)] line-through' : 'text-[var(--color-text-primary)]'}`}>
                        {q.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">{q.description} · +{q.xpReward} XP</p>
                      {!q.completed && (
                        <div className="mt-1.5">
                          <div className="h-1.5 rounded-full bg-[var(--color-surface-700)] overflow-hidden">
                            <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{q.progress}/{q.target}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {!q.completed && (
                    <button
                      onClick={() => completeQuest(q.id)}
                      disabled={q.progress < q.target}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-xs font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      Claim
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5" /> Achievements
          </h2>
          {achievementProgress.total > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-1">
                <span>{achievementProgress.unlocked}/{achievementProgress.total} unlocked</span>
                <span>{achievementProgress.percent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--color-surface-700)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-success)] transition-all" style={{ width: `${achievementProgress.percent}%` }} />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            {paginatedAchievements.map(a => {
              const Icon = iconMap[a.icon] || Trophy
              const prog = calcAchievementProgress(a, state.items.length, masteredCount, user.streak, user.level, user.totalRead, user.totalQuizMastered, uniqueTagIds.size, hasDeepReader, streakFreezeDays)
              return (
                <div
                  key={a.id}
                   className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                     a.unlocked ? 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5' : 'border-[var(--color-border)] bg-[var(--color-surface-800)] opacity-70'
                   }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.unlocked ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-surface-700)]'}`}>
                    <Icon className={`w-4 h-4 ${a.unlocked ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${a.unlocked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>{a.title}</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{a.description}</p>
                    {prog && (
                      <div className="mt-1">
                        <div className="h-1 rounded-full bg-[var(--color-surface-700)] overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${Math.round((prog.current / prog.target) * 100)}%` }} />
                        </div>
                        <p className="text-[9px] text-[var(--color-text-muted)] mt-0.5">{prog.current}/{prog.target}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {totalAchievementPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <button onClick={() => setAchievePage(p => Math.max(0, p - 1))} disabled={achievePage === 0} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-[var(--color-text-muted)]">{achievePage + 1} / {totalAchievementPages}</span>
              <button onClick={() => setAchievePage(p => Math.min(totalAchievementPages - 1, p + 1))} disabled={achievePage === totalAchievementPages - 1} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Sources + Tag Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5" /> Top Sources
          </h2>
          {domainTop.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Globe className="w-8 h-8 text-[var(--color-text-muted)] mb-2 opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">No sources yet</p>
              <p className="text-xs text-[var(--color-text-muted)] opacity-60 mt-0.5">Start sieving content to see where your articles come from</p>
            </div>
          ) : (
            <div className="space-y-2">
              {domainTop.map(d => (
                <div key={d.domain} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--color-text-primary)] flex-1 min-w-0 truncate">{d.domain}</span>
                  <span className="text-xs text-[var(--color-text-muted)] shrink-0">{d.count}</span>
                  <div className="w-20 h-1.5 rounded-full bg-[var(--color-surface-700)] overflow-hidden shrink-0">
                    <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" /> Tag Usage
          </h2>
          {tagUsage.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Tag className="w-8 h-8 text-[var(--color-text-muted)] mb-2 opacity-40" />
              <p className="text-sm text-[var(--color-text-muted)]">No tags used yet</p>
              <p className="text-xs text-[var(--color-text-muted)] opacity-60 mt-0.5">Tags appear as you organise your articles</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tagUsage.map(t => {
                const pct = tagUsage.length > 0 ? Math.round((t.count / Math.max(...tagUsage.map(x => x.count))) * 100) : 0
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    <span className="text-sm text-[var(--color-text-primary)] flex-1 min-w-0 truncate">{t.name}</span>
                    <span className="text-xs text-[var(--color-text-muted)] shrink-0">{t.count}</span>
                    <div className="w-20 h-1.5 rounded-full bg-[var(--color-surface-700)] overflow-hidden shrink-0">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: t.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Collection Overview */}
      <div>
        <h2 className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-3">Collection</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniCard icon={BookOpen} label="Active" value={activeItems.length} />
          <MiniCard icon={BookCheck} label="Sieved" value={sievedCount} />
          <MiniCard icon={BrainCircuit} label="Mastered" value={masteredCount} />
          <MiniCard icon={Flame} label="Due Review" value={dueReviews} onClick={() => navigate('/review')} />
        </div>
      </div>
    </div>
  )
}

function RetentionCalendar({ data, intensityFn, periodDays }: {
  data: { weeks: { date: Date; dayNum: number; count: number; isToday: boolean }[][]; maxCount: number }
  intensityFn: (count: number, max: number) => string
  periodDays: number
}) {
  const cellSize = periodDays <= 30 ? 'h-10' : periodDays <= 90 ? 'h-8' : 'h-[1.625rem]'
  const textSize = periodDays <= 30 ? 'text-xs' : periodDays <= 90 ? 'text-[8px]' : 'text-[6px]'
  const gap = periodDays <= 30 ? 'gap-0.5' : 'gap-px'

  return (
    <div>
      <div className={`grid grid-cols-7 ${gap}`}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className={`text-center font-medium pb-1 ${periodDays <= 30 ? 'text-[10px]' : periodDays <= 90 ? 'text-[8px]' : 'text-[6px]'} text-[var(--color-text-muted)]`}>{d}</div>
        ))}
        {data.weeks.map((week, wi) =>
          week.map((cell, ci) => (
            <div
              key={`${wi}-${ci}`}
              title={`${format(cell.date, 'MMM d, yyyy')}: ${cell.count} review${cell.count !== 1 ? 's' : ''}`}
              className={`flex items-center justify-center rounded-sm font-medium transition-all duration-100 ${cellSize} ${textSize} ${intensityFn(cell.count, data.maxCount)} ${cell.isToday ? 'ring-1 ring-[var(--color-accent)]' : ''} ${cell.count > 0 ? 'hover:scale-110 hover:z-10 hover:ring-1 hover:ring-[var(--color-accent)]' : ''}`}
            >
              {cell.dayNum}
            </div>
          ))
        )}
      </div>
      <div className="flex items-center justify-center gap-2 mt-3 text-[10px] text-[var(--color-text-muted)]">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-[var(--color-surface-700)]" />
        <div className="w-3 h-3 rounded-sm bg-[var(--color-accent)]/10" />
        <div className="w-3 h-3 rounded-sm bg-[var(--color-accent)]/30" />
        <div className="w-3 h-3 rounded-sm bg-[var(--color-accent)]/60" />
        <span>More</span>
      </div>
    </div>
  )
}

function RetentionTimeline({ data }: {
  data: { timeline: { date: string; label: string; count: number }[]; maxCount: number; totalReviews: number }
}) {
  const bars = data.timeline
  const max = data.maxCount
  const avg = bars.length > 0 ? (data.totalReviews / bars.length) : 0
  const interval = bars.length > 30 ? Math.ceil(bars.length / 10) : 1
  const showLabels = bars.filter((_, i) => i % interval === 0 || i === bars.length - 1)
  const firstDate = bars[0]?.date
  const lastDate = bars[bars.length - 1]?.date

  return (
    <div>
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-2">
        <span>Daily reviews</span>
        <span>Peak: {max}</span>
        <span>Avg: {avg.toFixed(1)}</span>
        <span className="ml-auto">{firstDate} — {lastDate}</span>
      </div>
      <div className="flex items-end gap-px h-28 rounded-lg bg-[var(--color-surface-700)] p-2">
        {bars.map(d => (
          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full group relative">
            <div
              className={`w-full rounded-sm transition-all duration-150 ${
                d.count > 0 ? 'bg-[var(--color-accent)]/60 hover:bg-[var(--color-accent)]' : 'bg-[var(--color-surface-700)]'
              }`}
              style={{ height: `${(d.count / max) * 100}%` }}
            />
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none bg-[var(--color-surface-800)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
              {d.count > 0 ? `${d.count} review${d.count !== 1 ? 's' : ''} on ${d.date}` : d.date}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1.5">
        {showLabels.map(d => (
          <span key={d.date}>{d.label}</span>
        ))}
      </div>
    </div>
  )
}

const iconMap: Record<string, typeof Zap> = {
  BookOpen, BrainCircuit, Zap, Trophy, GraduationCap,
  Library: BookOpen, BookMarked: BookOpen,
  Sparkles: Zap, Tags: Tag,
}

function DistBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-[var(--color-text-primary)]">{label}</span>
        <span className="text-[var(--color-text-muted)]">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--color-surface-700)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

function MiniCard({ icon: Icon, label, value, onClick }: { icon: typeof Zap; label: string; value: number; onClick?: () => void }) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className={`p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] ${onClick ? 'cursor-pointer hover:border-[var(--color-accent)]/40 transition-colors' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
      </div>
      <p className="text-lg font-semibold text-[var(--color-text-primary)]">{value}</p>
    </Comp>
  )
}
