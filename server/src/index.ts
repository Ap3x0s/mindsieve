import express from 'express'
import cors from 'cors'
import itemsRouter from './routes/items.js'
import userRouter from './routes/user.js'
import tagsRouter from './routes/tags.js'
import achievementsRouter from './routes/achievements.js'
import questsRouter from './routes/quests.js'
import migrateRouter from './routes/migrate.js'
import reviewsRouter from './routes/reviews.js'
import authRouter from './routes/auth.js'
import aiProxyRouter from './routes/ai-proxy.js'

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '5mb' }))

app.use('/api/ai-proxy', aiProxyRouter)
app.use('/api/items', itemsRouter)
app.use('/api/user', userRouter)
app.use('/api/tags', tagsRouter)
app.use('/api/achievements', achievementsRouter)
app.use('/api/quests', questsRouter)
app.use('/api/migrate', migrateRouter)
app.use('/api/reviews', reviewsRouter)
app.use('/api/auth', authRouter)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`MindSieve API running on http://localhost:${PORT}`)
})
