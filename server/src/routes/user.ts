import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

router.get('/', async (_req, res) => {
  let user = await prisma.userState.findUnique({ where: { id: 1 } })
  if (!user) {
    user = await prisma.userState.create({ data: { id: 1 } })
  }
  res.json(user)
})

router.put('/', async (req, res) => {
  const user = await prisma.userState.upsert({
    where: { id: 1 },
    update: req.body,
    create: { id: 1, ...req.body },
  })
  res.json(user)
})

export default router
