import { Router } from 'express'

const router = Router()

router.post('/', async (req, res) => {
  const { url, method, headers, body } = req.body

  if (!url || typeof url !== 'string') {
    res.status(400).json({ ok: false, error: 'Missing "url" in request body' })
    return
  }

  try {
    const response = await fetch(url, {
      method: method || 'POST',
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined,
    })

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = await response.text().catch(() => '')
    }

    res.json({ ok: true, status: response.status, data })
  } catch (e) {
    res.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' })
  }
})

export default router
