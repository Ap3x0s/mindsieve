import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  const tags = await prisma.tagInfo.findMany()
  res.json(tags)
})

router.post('/', async (req, res) => {
  const tag = await prisma.tagInfo.create({ data: req.body })
  res.status(201).json(tag)
})

router.delete('/:id', async (req, res) => {
  await prisma.tagInfo.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
