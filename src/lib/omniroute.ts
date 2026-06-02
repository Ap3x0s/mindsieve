import { storageKey } from './constants'

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama' | 'custom'
export type ApiFormat = 'openai' | 'anthropic' | 'google'

export interface OmniRouteConfig {
  provider: AIProvider
  endpoint: string
  model: string
  apiKey: string
  systemPrompt?: string
  format?: ApiFormat
}

export interface FormatInfo {
  label: string
  description: string
}

export const API_FORMATS: Record<ApiFormat, FormatInfo> = {
  openai: { label: 'OpenAI-compatible', description: 'POST /v1/chat/completions — DeepSeek, Mistral, Groq, Together, xAI, OpenRouter, OctoML, Fireworks, Perplexity, Kimi, StepFun, Yi, Qwen' },
  anthropic: { label: 'Anthropic Claude', description: 'POST /v1/messages — Anthropic native format' },
  google: { label: 'Google Gemini', description: 'POST /{model}:generateContent — Google native format' },
}

export interface AIResult {
  title: string
  summary: string[]
  actionItems: string[]
  quiz: { question: string; options: string[]; correctIndex: number }[]
  tags?: string[]
}

interface ProviderPreset {
  label: string
  endpoint: string
  models: string[]
  needsKey: boolean
  keyLabel: string
  keyPlaceholder: string
  docsUrl?: string
}

export const PROVIDER_PRESETS: Record<AIProvider, ProviderPreset> = {
  openai: {
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: ['gpt-5.5', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-4.1', 'gpt-4.1-mini'],
    needsKey: true,
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  anthropic: {
    label: 'Anthropic Claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    models: ['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5', 'claude-opus-4-7'],
    needsKey: true,
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  google: {
    label: 'Google Gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash'],
    needsKey: true,
    keyLabel: 'Gemini API Key',
    keyPlaceholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  ollama: {
    label: 'Ollama (Local)',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    models: ['qwen3.5', 'llama3.3', 'deepseek-v3.2', 'mistral-small3', 'phi4', 'qwen2.5-coder'],
    needsKey: false,
    keyLabel: '',
    keyPlaceholder: '',
  },
  custom: {
    label: 'Custom',
    endpoint: '',
    models: [],
    needsKey: false,
    keyLabel: 'API Key (optional)',
    keyPlaceholder: 'sk-...',
  },
}

const DEFAULT_SYSTEM_PROMPT = `You are MindSieve, an AI content curator. Given an article or text, return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "title": "string",
  "summary": ["3 bullet points explaining the core thesis"],
  "actionItems": ["3-4 actionable bullet points starting with verbs"],
  "quiz": [
    {
      "question": "string",
      "options": ["4 answer options"],
      "correctIndex": 0
    }
  ],
  "tags": ["3-5 relevant topic tags like 'AI', 'Productivity', 'Science'"]
}
The quiz must have exactly 3 questions, each with exactly 4 options. correctIndex is 0-based.`

const STORAGE_KEY = storageKey('omniroute')
const PROMPT_KEY = storageKey('system_prompt')

export function getConfig(): OmniRouteConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const cfg = JSON.parse(raw)
    if (cfg.provider && cfg.model) {
      if (cfg.provider === 'custom' && !cfg.endpoint) return null
      return cfg
    }
    if (cfg.endpoint && cfg.model) {
      return { provider: 'custom', endpoint: cfg.endpoint, model: cfg.model, apiKey: cfg.apiKey || '', format: cfg.format || 'openai' }
    }
    return null
  } catch {
    return null
  }
}

export function saveConfig(cfg: OmniRouteConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
}

export function clearConfig(): void {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(PROMPT_KEY)
}

export function getSystemPrompt(): string {
  try {
    return localStorage.getItem(PROMPT_KEY) || DEFAULT_SYSTEM_PROMPT
  } catch {
    return DEFAULT_SYSTEM_PROMPT
  }
}

export function saveSystemPrompt(prompt: string): void {
  localStorage.setItem(PROMPT_KEY, prompt)
}

function parseAIResult(content: string, text: string): AIResult {
  const cleaned = content.replace(/```(?:json)?\s*/gi, '').trim()
  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error('AI returned invalid JSON')
  }
  return {
    title: parsed.title || text.slice(0, 80),
    summary: Array.isArray(parsed.summary) ? parsed.summary.slice(0, 3) : ['Summary not available'],
    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems.slice(0, 4) : ['No action items generated'],
    quiz: Array.isArray(parsed.quiz) ? parsed.quiz.slice(0, 3).map((q: any) => ({
      question: q.question || '',
      options: Array.isArray(q.options) ? q.options.slice(0, 4) : ['', '', '', ''],
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
    })) : [],
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5).map(String) : undefined,
  }
}

async function callOpenAI(text: string, cfg: OmniRouteConfig): Promise<AIResult> {
  const systemPrompt = getSystemPrompt()
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: cfg.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Process this content and return the structured response:\n\n${text}` },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('No content in response')
  return parseAIResult(content, text)
}

async function callAnthropic(text: string, cfg: OmniRouteConfig): Promise<AIResult> {
  const systemPrompt = getSystemPrompt()
  const res = await fetch(cfg.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': cfg.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: cfg.model,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Process this content and return the structured response:\n\n${text}` }],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
  const data = await res.json()
  const content = data.content?.[0]?.text
  if (!content) throw new Error('No content in response')
  return parseAIResult(content, text)
}

async function callGoogle(text: string, cfg: OmniRouteConfig): Promise<AIResult> {
  const systemPrompt = getSystemPrompt()
  const url = `${cfg.endpoint}/${cfg.model}:generateContent${cfg.apiKey ? `?key=${cfg.apiKey}` : ''}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Process this content and return the structured response:\n\n${text}` }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { temperature: 0.3, maxOutputTokens: 2000 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${(await res.text().catch(() => '')).slice(0, 200)}`)
  const data = await res.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('No content in response')
  return parseAIResult(content, text)
}

export async function callOmniRoute(text: string, cfg: OmniRouteConfig): Promise<AIResult> {
  if (cfg.provider === 'custom' && cfg.format) {
    switch (cfg.format) {
      case 'anthropic': return callAnthropic(text, cfg)
      case 'google': return callGoogle(text, cfg)
      case 'openai': return callOpenAI(text, cfg)
    }
  }
  switch (cfg.provider) {
    case 'anthropic': return callAnthropic(text, cfg)
    case 'google': return callGoogle(text, cfg)
    case 'ollama':
    case 'openai':
    case 'custom':
    default: return callOpenAI(text, cfg)
  }
}

export async function testConnection(cfg: OmniRouteConfig): Promise<{ ok: boolean; error?: string }> {
  try {
    await callOmniRoute('Test. Respond with a simple JSON with title "ok", summary ["ok"], actionItems ["ok"], quiz [], tags ["test"].', cfg)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Unknown error' }
  }
}
