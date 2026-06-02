import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const quests = await prisma.dailyQuest.findMany()
  res.json(quests)
})

router.put('/:id', async (req, res) => {
  const quest = await prisma.dailyQuest.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(quest)
})

export default router
