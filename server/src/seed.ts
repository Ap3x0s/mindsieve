import prisma from './lib/prisma.js'

async function seed() {
  const existing = await prisma.item.count()
  if (existing > 0) {
    console.log('Database already has data, skipping seed.')
    return
  }

  const tags = [
    { id: 'tag-tech', name: 'Tech', color: '#6366F1' },
    { id: 'tag-psych', name: 'Psychology', color: '#EC4899' },
    { id: 'tag-crypto', name: 'Crypto', color: '#F59E0B' },
  ]
  for (const t of tags) {
    await prisma.tagInfo.create({ data: t })
  }

  const achievements = [
    { id: 'first_read', title: 'First Read', description: 'Read your first article', icon: 'BookOpen', unlocked: false, unlockedAt: null },
    { id: 'quiz_ace', title: 'Quiz Ace', description: 'Ace 10 quizzes without mistakes', icon: 'BrainCircuit', unlocked: false, unlockedAt: null },
    { id: 'streak_7', title: 'Streak Master', description: 'Maintain a 7-day streak', icon: 'Zap', unlocked: false, unlockedAt: null },
    { id: 'curator', title: 'Curator', description: 'Collect 50 articles', icon: 'Library', unlocked: false, unlockedAt: null },
    { id: 'deep_reader', title: 'Deep Reader', description: 'Read an article over 15 min', icon: 'BookMarked', unlocked: false, unlockedAt: null },
    { id: 'level_5', title: 'Scholar', description: 'Reach level 5', icon: 'GraduationCap', unlocked: false, unlockedAt: null },
    { id: 'level_10', title: 'Professor', description: 'Reach level 10', icon: 'Trophy', unlocked: false, unlockedAt: null },
    { id: 'collector', title: 'Collector', description: 'Use 5 different tags', icon: 'Tags', unlocked: false, unlockedAt: null },
    { id: 'perfectionist', title: 'Perfectionist', description: 'Master 10 articles', icon: 'Sparkles', unlocked: false, unlockedAt: null },
  ]
  for (const a of achievements) {
    await prisma.achievement.create({ data: a })
  }

  await prisma.userState.create({ data: { id: 1, xp: 0, level: 1 } })

  console.log('Seed complete.')
}

seed().catch(console.error).finally(() => prisma.$disconnect())
