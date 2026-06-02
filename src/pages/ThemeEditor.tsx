import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Palette, RotateCcw, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { PRESETS, DARK_THEME, LIGHT_THEME, clearCustomTheme } from '../lib/themes'
import type { ThemeColors } from '../lib/themes'

const COLOR_LABELS: { key: keyof ThemeColors; label: string }[] = [
  { key: 'surface900', label: 'Background' },
  { key: 'surface800', label: 'Card Background' },
  { key: 'surface700', label: 'Surface' },
  { key: 'surface600', label: 'Surface Alt' },
  { key: 'surface500', label: 'Border' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentHover', label: 'Accent Hover' },
  { key: 'success', label: 'Success' },
  { key: 'warning', label: 'Warning' },
  { key: 'textPrimary', label: 'Text Primary' },
  { key: 'textSecondary', label: 'Text Secondary' },
  { key: 'textMuted', label: 'Text Muted' },
]

export default function ThemeEditor() {
  const navigate = useNavigate()
  const { state, setCustomTheme } = useApp()
  const base = state.customTheme?.colors || (state.darkMode ? DARK_THEME : LIGHT_THEME)
  const [colors, setColors] = useState<ThemeColors>({ ...base })
  const [saved, setSaved] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const applyAndSave = (c: ThemeColors, name: string) => {
    const theme = { name, colors: c }
    setColors(c)
    setCustomTheme(theme)
  }

  const handlePreset = (key: string) => {
    const preset = PRESETS[key]
    if (preset) {
      setSelectedPreset(key)
      applyAndSave(preset.colors, preset.name)
    }
  }

  const handleReset = () => {
    const baseDefault = state.darkMode ? DARK_THEME : LIGHT_THEME
    setColors({ ...baseDefault })
    setSelectedPreset(null)
    setCustomTheme(null)
    clearCustomTheme()
  }

  const handleSaveCustom = () => {
    applyAndSave(colors, 'Custom')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateColor = (key: keyof ThemeColors, value: string) => {
    const next = { ...colors, [key]: value }
    setColors(next)
    setCustomTheme({ name: 'Custom', colors: next })
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/connections')} className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Theme Editor</h1>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Presets
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button key={key} onClick={() => handlePreset(key)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                selectedPreset === key
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/5'
                  : 'border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent)]/40'
              }`}>
              <div className="flex gap-1 mb-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.accent }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.surface700 }} />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: preset.colors.textPrimary }} />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{preset.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {key === 'dark' ? 'Dark default' : key === 'light' ? 'Light default' : key === 'sepia' ? 'Warm tones' : 'Cool tones'}
              </p>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Palette className="w-4 h-4" /> Custom Colors
        </h2>
        <div className="p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card-bg)] space-y-3">
          {COLOR_LABELS.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <label className="text-xs text-[var(--color-text-secondary)] w-28 shrink-0">{label}</label>
              <input type="color"
                value={colors[key]}
                onChange={e => updateColor(key, e.target.value)}
                className="w-8 h-8 rounded-lg border border-[var(--color-border)] bg-transparent cursor-pointer p-0.5"
              />
              <input
                value={colors[key]}
                onChange={e => updateColor(key, e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-800)] text-xs text-[var(--color-text-primary)] font-mono outline-none focus:border-[var(--color-accent)]"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={handleSaveCustom}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer">
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Apply Theme'}
        </button>
        <button onClick={handleReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-700)] transition-all cursor-pointer">
          <RotateCcw className="w-4 h-4" /> Reset to Default
        </button>
      </div>
    </div>
  )
}
