import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'crypto'
import { generateToken, authRequired } from '../middleware/auth.js'

const router = Router()
const prisma = new PrismaClient()

function hashPassword(password: string, salt: string): string {
  const derivedKey = scryptSync(password, salt, 64)
  return derivedKey.toString('hex')
}

function createSalt(): string {
  return randomBytes(32).toString('hex')
}

router.post('/register', async (req, res) => {
  try {
    const { nickname, password } = req.body
    if (!nickname || !password) {
      res.status(400).json({ error: 'Nickname and password are required' })
      return
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' })
      return
    }
    if (nickname.length < 2) {
      res.status(400).json({ error: 'Nickname must be at least 2 characters' })
      return
    }
    const existing = await prisma.user.findUnique({ where: { nickname } })
    if (existing) {
      res.status(409).json({ error: 'Nickname already taken' })
      return
    }
    const salt = createSalt()
    const passwordHash = hashPassword(password, salt)
    const user = await prisma.user.create({
      data: { nickname, passwordHash, salt },
    })
    const token = generateToken(user.id, user.nickname)
    res.status(201).json({
      token,
      user: { id: user.id, nickname: user.nickname },
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { nickname, password } = req.body
    if (!nickname || !password) {
      res.status(400).json({ error: 'Nickname and password are required' })
      return
    }
    const user = await prisma.user.findUnique({ where: { nickname } })
    if (!user) {
      res.status(401).json({ error: 'Invalid nickname or password' })
      return
    }
    const hash = hashPassword(password, user.salt)
    if (hash !== user.passwordHash) {
      res.status(401).json({ error: 'Invalid nickname or password' })
      return
    }
    const token = generateToken(user.id, user.nickname)
    res.json({
      token,
      user: { id: user.id, nickname: user.nickname },
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Login failed' })
  }
})

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, nickname: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch (err) {
    console.error('Me error:', err)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
