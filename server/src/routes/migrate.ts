import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.post('/', async (req, res) => {
  const { items, user, tags, achievements, quests } = req.body

  if (items && Array.isArray(items)) {
    for (const item of items) {
      await prisma.item.upsert({
        where: { id: item.id },
        update: {},
        create: {
          id: item.id,
          title: item.title || 'Untitled',
          domain: item.domain || 'unknown',
          url: item.url || '',
          date: item.date || new Date().toISOString(),
          readingTime: item.readingTime || '5 min read',
          image: item.image || null,
          summary: JSON.stringify(item.summary || []),
          actionItems: JSON.stringify(item.actionItems || []),
          quiz: JSON.stringify(item.quiz || []),
          status: item.status || 'unread',
          xpAwarded: item.xpAwarded || false,
          quizMastered: item.quizMastered || false,
          tags: JSON.stringify(item.tags || []),
          favorite: item.favorite || false,
          archived: item.archived || false,
          sourceType: item.sourceType || 'link',
          review: item.review ? JSON.stringify(item.review) : null,
        },
      })
    }
  }

  if (user) {
    await prisma.userState.upsert({ where: { id: 1 }, update: user, create: { id: 1, ...user } })
  }

  if (tags && Array.isArray(tags)) {
    for (const tag of tags) {
      await prisma.tagInfo.upsert({ where: { id: tag.id }, update: tag, create: tag })
    }
  }

  if (achievements && Array.isArray(achievements)) {
    for (const a of achievements) {
      await prisma.achievement.upsert({ where: { id: a.id }, update: a, create: a })
    }
  }

  if (quests && Array.isArray(quests)) {
    for (const q of quests) {
      await prisma.dailyQuest.upsert({ where: { id: q.id }, update: q, create: q })
    }
  }

  res.json({ ok: true })
})

export default router
