import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const logs = await prisma.reviewLog.findMany({ orderBy: { date: 'desc' }, take: 500 })
  res.json(logs)
})

router.get('/:itemId', async (req, res) => {
  const logs = await prisma.reviewLog.findMany({
    where: { itemId: req.params.itemId },
    orderBy: { date: 'desc' },
  })
  res.json(logs)
})

router.post('/', async (req, res) => {
  const data = req.body
  const log = await prisma.reviewLog.create({
    data: {
      itemId: data.itemId,
      grade: data.grade,
      easeBefore: data.easeBefore,
      easeAfter: data.easeAfter,
      intervalBefore: data.intervalBefore,
      intervalAfter: data.intervalAfter,
      date: data.date || new Date().toISOString(),
    },
  })
  res.status(201).json(log)
})

export default router
