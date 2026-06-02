import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const achievements = await prisma.achievement.findMany()
  res.json(achievements)
})

router.put('/:id', async (req, res) => {
  const achievement = await prisma.achievement.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(achievement)
})

export default router
