import { useState, useCallback } from 'react'
import { getConfig, callOmniRoute, type AIResult } from '../lib/omniroute'
import { processWithAI as mockAI } from '../lib/mockAI'
import { extractUrlMeta } from '../lib/extractUrl'

export type ProcessingStep = 'idle' | 'extracting' | 'processing' | 'parsing' | 'complete'

export interface ProcessResult extends AIResult {
  sourceType: 'link' | 'text'
  domain: string
  url: string
  favicon: string
  image?: string
  readingTime: string
  tags: string[]
  status: 'unread' | 'sieved' | 'mastered'
  xpAwarded: boolean
  quizMastered: boolean
}

export function useAI() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<ProcessingStep>('idle')

  const process = useCallback(async (input: string): Promise<ProcessResult> => {
    setLoading(true)
    setStep('idle')
    try {
      const isLink = /^https?:\/\//.test(input.trim())
      const rawUrl = isLink ? input.match(/https?:\/\/[^\s]+/)?.[0] || input.trim() : ''
      let text = input
      let domain = 'paste.text'
      let favicon = ''

      let image = ''
      if (isLink) {
        setStep('extracting')
        const meta = await extractUrlMeta(rawUrl)
        if (meta) {
          text = meta.cleanText || input
          domain = meta.domain
          favicon = meta.favicon
          image = meta.image
        } else {
          domain = new URL(rawUrl).hostname.replace('www.', '')
        }
      }

      setStep('processing')
      const cfg = getConfig()
      let result: AIResult

      if (cfg) {
        try {
          result = await callOmniRoute(text, cfg)
        } catch {
          result = await mockAI(text)
        }
      } else {
        result = await mockAI(text)
      }

      setStep('parsing')
      const wordCount = text.split(/\s+/).length
      setStep('complete')
      return {
        ...result,
        tags: result.tags || [],
        sourceType: isLink ? 'link' : 'text',
        domain,
        url: isLink ? rawUrl : '',
        favicon,
        image,
        status: 'unread' as const,
        xpAwarded: false,
        quizMastered: false,
        readingTime: `${Math.max(3, Math.ceil(wordCount / 200))} min read`,
      }
    } finally {
      setLoading(false)
      setStep('idle')
    }
  }, [])

  return { process, loading, step }
}
