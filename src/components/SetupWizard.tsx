import { useState } from 'react'
import { Brain, CheckCircle, XCircle, Loader2, ArrowRight, ChevronDown } from 'lucide-react'
import { PROVIDER_PRESETS, saveConfig, testConnection, API_FORMATS, type AIProvider, type ApiFormat, type OmniRouteConfig } from '../lib/omniroute'
import { PROVIDER_ICONS } from './ProviderIcons'

const providerOrder: AIProvider[] = ['openai', 'anthropic', 'google', 'ollama', 'custom']
const formatOptions: ApiFormat[] = ['openai', 'anthropic', 'google']

const ENDPOINT_EXAMPLES: Record<ApiFormat, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models',
}

export default function SetupWizard({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [provider, setProvider] = useState<AIProvider | null>(null)
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [customFormat, setCustomFormat] = useState<ApiFormat>('openai')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null)

  const preset = provider ? PROVIDER_PRESETS[provider] : null

  const handleSelectProvider = (p: AIProvider) => {
    setProvider(p)
    setTestResult(null)
    const pr = PROVIDER_PRESETS[p]
    setModel(pr.models[0] || '')
    setCustomEndpoint('')
    setApiKey('')
    setStep(1)
  }

  const handleTestAndSave = async () => {
    if (!provider) return
    const endpoint = provider === 'custom' ? customEndpoint : PROVIDER_PRESETS[provider].endpoint
    if (!endpoint || !model) return
    const cfg: OmniRouteConfig = provider === 'custom'
      ? { provider, endpoint, model, apiKey, format: customFormat }
      : { provider, endpoint, model, apiKey }
    setTesting(true)
    setTestResult(null)
    const ok = await testConnection(cfg)
    setTestResult(ok ? 'ok' : 'fail')
    setTesting(false)
    if (ok) {
      saveConfig(cfg)
      setTimeout(() => onDone(), 800)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent)]/10 flex items-center justify-center">
            <Brain className="w-5 h-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">AI Setup</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Connect an AI provider to process content</p>
          </div>
        </div>

        {step === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">Choose your AI provider:</p>
            {providerOrder.map(p => {
              const pr = PROVIDER_PRESETS[p]
                  const Icon = PROVIDER_ICONS[p]
              return (
                <button
                  key={p}
                  onClick={() => handleSelectProvider(p)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-700)] transition-all cursor-pointer text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-surface-700)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[var(--color-accent)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">{pr.label}</p>
                    <p className="text-xs text-[var(--color-text-muted)] truncate">{pr.endpoint || 'OpenAI-compatible endpoint'}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--color-text-muted)] shrink-0" />
                </button>
              )
            })}
            <button onClick={onDone} className="w-full py-2.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer">
              Skip — use Mock AI
            </button>
          </div>
        )}

        {step === 1 && preset && (
          <div className="space-y-4">
            <button onClick={() => setStep(0)} className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] cursor-pointer">
              ← Back to providers
            </button>

            <div className="p-3 rounded-xl bg-[var(--color-surface-800)] border border-[var(--color-border)]">
              <p className="text-xs text-[var(--color-text-secondary)]">{preset.label}</p>
              <p className="text-xs text-[var(--color-text-muted)] break-all">{provider === 'custom' ? (customEndpoint || 'Enter endpoint below') : preset.endpoint}</p>
            </div>

            {preset.needsKey && (
              <div>
                <label className="text-xs text-[var(--color-text-muted)] mb-1 block">{preset.keyLabel}</label>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                  placeholder={preset.keyPlaceholder}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]" />
              </div>
            )}

            {provider === 'custom' ? (
              <>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Format API</label>
                  <div className="relative">
                    <select value={customFormat} onChange={e => { setCustomFormat(e.target.value as ApiFormat); setCustomEndpoint(ENDPOINT_EXAMPLES[e.target.value as ApiFormat]) }}
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] appearance-none cursor-pointer">
                      {formatOptions.map(f => (
                        <option key={f} value={f}>{API_FORMATS[f].label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{API_FORMATS[customFormat].description}</p>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Endpoint URL</label>
                  <input value={customEndpoint} onChange={e => setCustomEndpoint(e.target.value)}
                    placeholder={ENDPOINT_EXAMPLES[customFormat]}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]" />
                </div>
              </>
            ) : null}

            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Model</label>
              {preset.models.length > 0 ? (
                <select value={model} onChange={e => setModel(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] cursor-pointer">
                  {preset.models.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input value={model} onChange={e => setModel(e.target.value)}
                  placeholder="model-id"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-800)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)]" />
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button onClick={handleTestAndSave} disabled={testing || !model || (preset.needsKey && !apiKey) || (provider === 'custom' && !customEndpoint)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {testing ? 'Testing...' : 'Test & Save'}
              </button>
              {testResult === 'ok' && <CheckCircle className="w-5 h-5 text-[var(--color-success)]" />}
              {testResult === 'fail' && <XCircle className="w-5 h-5 text-danger" />}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
