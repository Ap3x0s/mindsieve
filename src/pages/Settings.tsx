import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, TestTube, Trash2, CheckCircle, XCircle, Bot, Key, Info, ChevronDown, Code, RefreshCw } from 'lucide-react'
import { getConfig, saveConfig, clearConfig, testConnection, saveSystemPrompt, getSystemPrompt, PROVIDER_PRESETS, type AIProvider, type ApiFormat, type OmniRouteConfig } from '../lib/omniroute'
import { loadSm2Settings, saveSm2Settings } from '../lib/sm2'
import type { Sm2Settings } from '../types'
import { DEFAULT_SM2 } from '../types'
import { PROVIDER_ICONS } from '../components/ProviderIcons'

export default function Settings() {
  const navigate = useNavigate()
  const existing = getConfig()
  const currentSm2 = loadSm2Settings()
  const [sm2, setSm2] = useState<Sm2Settings>(currentSm2)
  const [sm2Saved, setSm2Saved] = useState(false)
  const [provider, setProvider] = useState<AIProvider>(existing?.provider || 'openai')
  const [endpoint, setEndpoint] = useState(existing?.endpoint || PROVIDER_PRESETS[provider].endpoint)
  const [model, setModel] = useState(existing?.model || '')
  const [apiKey, setApiKey] = useState(existing?.apiKey || '')
  const [showCustomModel, setShowCustomModel] = useState(false)
  const [customModel, setCustomModel] = useState('')
  const [customFormat, setCustomFormat] = useState<ApiFormat>(existing?.format || 'openai')
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(getSystemPrompt())
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)
  const [testError, setTestError] = useState('')
  const [showProviderList, setShowProviderList] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const providerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const preset = PROVIDER_PRESETS[provider]

  useEffect(() => {
    if (saved) {
      const t = setTimeout(() => setSaved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [saved])

  useEffect(() => {
    if (provider !== 'custom') {
      setEndpoint(preset.endpoint)
      if (preset.models.length > 0) {
        if (!preset.models.includes(model)) setModel(preset.models[0])
      }
    }
  }, [provider])

  const currentModel = showCustomModel ? customModel : model

  const buildConfig = (): OmniRouteConfig => ({
    provider,
    endpoint,
    model: currentModel,
    apiKey,
    systemPrompt,
    ...(provider === 'custom' ? { format: customFormat } : {}),
  })

  const handleSave = () => {
    if (endpoint && currentModel) {
      saveConfig(buildConfig())
      saveSystemPrompt(systemPrompt)
      setSaved(true)
    }
  }

  useEffect(() => {
    if (sm2Saved) {
      const t = setTimeout(() => setSm2Saved(false), 2000)
      return () => clearTimeout(t)
    }
  }, [sm2Saved])

  const handleSaveSm2 = () => {
    saveSm2Settings(sm2)
    setSm2Saved(true)
  }

  const handleResetSm2 = () => {
    setSm2(DEFAULT_SM2)
    saveSm2Settings(DEFAULT_SM2)
    setSm2Saved(true)
  }

  const handleClear = () => {
    clearConfig()
    setProvider('openai')
    setEndpoint(PROVIDER_PRESETS.openai.endpoint)
    setModel(PROVIDER_PRESETS.openai.models[0])
    setApiKey('')
    setCustomModel('')
    setShowCustomModel(false)
    setCustomFormat('openai')
    setSystemPrompt(getSystemPrompt())
    setTestResult(null)
  }

  const handleTest = async () => {
    if (!endpoint || !currentModel) return
    setTesting(true)
    setTestResult(null)
    setTestError('')
    const result = await testConnection(buildConfig())
    setTestResult(result.ok ? 'ok' : 'fail')
    if (!result.ok && result.error) setTestError(result.error)
    setTesting(false)
  }

  const providerOptions: AIProvider[] = ['openai', 'anthropic', 'google', 'ollama', 'custom']

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (providerRef.current && !providerRef.current.contains(e.target as Node)) {
        setShowProviderList(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectProvider = (p: AIProvider) => {
    setProvider(p)
    setShowCustomModel(false)
    setShowProviderList(false)
    setFocusedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showProviderList) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault()
        setShowProviderList(true)
        setFocusedIndex(0)
      }
      return
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => Math.min(prev + 1, providerOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (focusedIndex >= 0) selectProvider(providerOptions[focusedIndex])
        break
      case 'Escape':
        e.preventDefault()
        setShowProviderList(false)
        setFocusedIndex(-1)
        break
    }
  }

  const renderModelSection = () => (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-primary)]">
        <Bot className="w-3 h-3" /> Model ID
      </label>
      {preset.models.length > 0 && !showCustomModel ? (
        <div className="relative">
          <select
            value={model}
            onChange={e => setModel(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] appearance-none cursor-pointer"
          >
            {preset.models.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      ) : (
        <input
          value={showCustomModel ? customModel : model}
          onChange={e => { setCustomModel(e.target.value); setShowCustomModel(true) }}
          placeholder="gpt-4.1-mini"
          className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
        />
      )}
      {preset.models.length > 0 && (
        <button
          onClick={() => setShowCustomModel(!showCustomModel)}
          className="mt-1 text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
        >
          {showCustomModel ? 'Pick from presets' : 'Custom model'}
        </button>
      )}
    </div>
  )

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Connections</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Bot className="w-4 h-4" /> AI Provider
        </h2>

        <div className="space-y-4 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-1.5">
              <Bot className="w-3 h-3" /> Provider
            </label>
            <div ref={providerRef} className="relative">
              <button
                onClick={() => setShowProviderList(!showProviderList)}
                onKeyDown={handleKeyDown}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] cursor-pointer"
              >
                <span className="flex items-center gap-2 flex-1 text-left">
                  {PROVIDER_ICONS[provider] && <span className="w-4 h-4">{PROVIDER_ICONS[provider]({ className: 'w-4 h-4' })}</span>}
                  {preset.label}
                </span>
                <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
              </button>
              {showProviderList && (
                <div ref={listRef} className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-bg)] shadow-lg z-10 overflow-hidden" role="listbox">
                  {providerOptions.map((p, i) => {
                    const Icon = PROVIDER_ICONS[p]
                    return (
                      <button key={p} onClick={() => selectProvider(p)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          i === focusedIndex ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)]'
                        } ${provider === p ? 'bg-[var(--color-accent)]/5' : ''}`}
                        role="option" aria-selected={provider === p}
                      >
                        <span className="w-4 h-4">{Icon({ className: 'w-4 h-4' })}</span>
                        {PROVIDER_PRESETS[p].label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {renderModelSection()}

          <div>
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-1.5">
              <Code className="w-3 h-3" /> API Endpoint
            </label>
            <input
              value={endpoint}
              onChange={e => setEndpoint(e.target.value)}
              placeholder="https://api.openai.com/v1/chat/completions"
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>

          {preset.needsKey && (
            <div>
              <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-1.5">
                <Key className="w-3 h-3" /> {preset.keyLabel}
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder={preset.keyPlaceholder}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]"
              />
              {preset.docsUrl && (
                <a href={preset.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="mt-1 text-xs text-[var(--color-accent)] hover:underline inline-block">
                  Get your API key
                </a>
              )}
            </div>
          )}

          <div>
            <button
              onClick={() => setShowPromptEditor(!showPromptEditor)}
              className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
            >
              <Code className="w-3 h-3" />
              {showPromptEditor ? 'Hide' : 'Edit'} system prompt
            </button>
            {showPromptEditor && (
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                rows={8}
                className="w-full mt-2 px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] font-mono resize-y"
              />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button onClick={handleSave} disabled={!endpoint || !currentModel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save'}
            </button>

            <button onClick={handleTest} disabled={!endpoint || !currentModel || testing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
              <TestTube className="w-4 h-4" />
              {testing ? 'Testing...' : 'Test Connection'}
            </button>

            {testResult === 'ok' && (
              <span className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                <CheckCircle className="w-3 h-3" /> Connection OK
              </span>
            )}
            {testResult === 'fail' && (
              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-xs text-danger">
                  <XCircle className="w-3 h-3" /> Connection failed
                </span>
                {testError && (
                  <span className="text-[10px] text-danger/70 font-mono break-all">{testError}</span>
                )}
              </div>
            )}

            <button onClick={handleClear}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-all cursor-pointer">
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-[var(--color-surface-700)] border border-[var(--color-border)]">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[var(--color-text-muted)] shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-text-muted)]">
              If AI Provider is not configured, MindSieve will use local mock AI to generate summaries and quizzes. Your API key stays in your browser — it's never sent anywhere except the endpoint you configure.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Spaced Repetition (SM-2)
        </h2>

        <div className="space-y-4 p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Default Ease</label>
              <input type="number" step="0.1" min="1.3" max="5"
                value={sm2.defaultEase}
                onChange={e => setSm2(s => ({ ...s, defaultEase: parseFloat(e.target.value) || 2.5 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Min Ease</label>
              <input type="number" step="0.1" min="1.0" max="2.5"
                value={sm2.minEase}
                onChange={e => setSm2(s => ({ ...s, minEase: parseFloat(e.target.value) || 1.3 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Max Interval (days)</label>
              <input type="number" step="1" min="1" max="9999"
                value={sm2.maxInterval}
                onChange={e => setSm2(s => ({ ...s, maxInterval: parseInt(e.target.value) || 365 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Interval Step 1 (days)</label>
              <input type="number" step="1" min="1" max="99"
                value={sm2.intervalStep1}
                onChange={e => setSm2(s => ({ ...s, intervalStep1: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Interval Step 2 (days)</label>
              <input type="number" step="1" min="1" max="99"
                value={sm2.intervalStep2}
                onChange={e => setSm2(s => ({ ...s, intervalStep2: parseInt(e.target.value) || 6 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] block mb-1">Streak Freeze (days)</label>
              <input type="number" step="1" min="1" max="365"
                value={sm2.streakFreezeDays}
                onChange={e => setSm2(s => ({ ...s, streakFreezeDays: parseInt(e.target.value) || 7 }))}
                className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]" />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button onClick={handleSaveSm2}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer">
              <Save className="w-4 h-4" />
              {sm2Saved ? 'Saved!' : 'Save SM-2 Settings'}
            </button>
            <button onClick={handleResetSm2}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-all cursor-pointer">
              <Trash2 className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
