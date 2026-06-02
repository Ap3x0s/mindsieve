import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(items)
})

router.get('/:id', async (req, res) => {
  const item = await prisma.item.findUnique({ where: { id: req.params.id } })
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

router.post('/', async (req, res) => {
  const data = req.body
  const item = await prisma.item.create({
    data: {
      title: data.title || 'Untitled',
      domain: data.domain || 'unknown',
      url: data.url || '',
      date: data.date || new Date().toISOString(),
      readingTime: data.readingTime || '5 min read',
      image: data.image || null,
      summary: JSON.stringify(data.summary || []),
      actionItems: JSON.stringify(data.actionItems || []),
      quiz: JSON.stringify(data.quiz || []),
      status: data.status || 'unread',
      xpAwarded: data.xpAwarded || false,
      quizMastered: data.quizMastered || false,
      tags: JSON.stringify(data.tags || []),
      favorite: data.favorite || false,
      archived: data.archived || false,
      sourceType: data.sourceType || 'link',
      review: data.review ? JSON.stringify(data.review) : null,
    },
  })
  res.status(201).json(item)
})

router.put('/:id', async (req, res) => {
  const data = req.body
  const updateData: Record<string, unknown> = {}
  const fields = ['title', 'domain', 'url', 'date', 'readingTime', 'image', 'status', 'xpAwarded', 'quizMastered', 'favorite', 'archived', 'sourceType']
  for (const f of fields) {
    if (data[f] !== undefined) updateData[f] = data[f]
  }
  if (data.summary) updateData.summary = JSON.stringify(data.summary)
  if (data.actionItems) updateData.actionItems = JSON.stringify(data.actionItems)
  if (data.quiz) updateData.quiz = JSON.stringify(data.quiz)
  if (data.tags) updateData.tags = JSON.stringify(data.tags)
  if (data.review !== undefined) updateData.review = data.review ? JSON.stringify(data.review) : null

  const item = await prisma.item.update({ where: { id: req.params.id }, data: updateData })
  res.json(item)
})

router.delete('/:id', async (req, res) => {
  await prisma.item.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
