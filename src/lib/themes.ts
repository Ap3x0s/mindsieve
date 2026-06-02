import { loadJSON, saveJSON } from './storage'
import { storageKey } from './constants'

export interface ThemeColors {
  surface900: string
  surface800: string
  surface700: string
  surface600: string
  surface500: string
  accent: string
  accentHover: string
  success: string
  successLight: string
  warning: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  border: string
  cardBg: string
}

export interface ThemeConfig {
  name: string
  colors: ThemeColors
}

export const DARK_THEME: ThemeColors = {
  surface900: '#0B0F19',
  surface800: '#121726',
  surface700: '#1A2235',
  surface600: '#232E44',
  surface500: '#2D3A52',
  accent: '#6366F1',
  accentHover: '#5558E6',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#2D3A52',
  cardBg: '#121726',
}

export const LIGHT_THEME: ThemeColors = {
  surface900: '#FFFFFF',
  surface800: '#F8FAFC',
  surface700: '#F1F5F9',
  surface600: '#E2E8F0',
  surface500: '#CBD5E1',
  accent: '#6366F1',
  accentHover: '#5558E6',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  cardBg: '#FFFFFF',
}

export const PRESETS: Record<string, ThemeConfig> = {
  dark: { name: 'Dark', colors: DARK_THEME },
  light: { name: 'Light', colors: LIGHT_THEME },
  sepia: {
    name: 'Sepia',
    colors: {
      surface900: '#1A1410',
      surface800: '#2A221C',
      surface700: '#3A3028',
      surface600: '#4D4036',
      surface500: '#6B5B4E',
      accent: '#D4A76A',
      accentHover: '#C49A5E',
      success: '#7BA873',
      successLight: '#2A3A28',
      warning: '#D4A76A',
      textPrimary: '#E8DCC8',
      textSecondary: '#B8A88C',
      textMuted: '#8A7A66',
      border: '#3A3028',
      cardBg: '#2A221C',
    },
  },
  nord: {
    name: 'Nord',
    colors: {
      surface900: '#1A1D24',
      surface800: '#232731',
      surface700: '#2E3440',
      surface600: '#3B4252',
      surface500: '#4C566A',
      accent: '#88C0D0',
      accentHover: '#81A1C1',
      success: '#A3BE8C',
      successLight: '#3B4252',
      warning: '#EBCB8B',
      textPrimary: '#ECEFF4',
      textSecondary: '#D8DEE9',
      textMuted: '#6B7A8F',
      border: '#3B4252',
      cardBg: '#232731',
    },
  },
  dracula: {
    name: 'Dracula',
    colors: {
      surface900: '#1E1E2E',
      surface800: '#282A36',
      surface700: '#343746',
      surface600: '#44475A',
      surface500: '#565761',
      accent: '#BD93F9',
      accentHover: '#CDA4FF',
      success: '#50FA7B',
      successLight: '#2D3A3A',
      warning: '#FFB86C',
      textPrimary: '#F8F8F2',
      textSecondary: '#D0D0C8',
      textMuted: '#909090',
      border: '#44475A',
      cardBg: '#282A36',
    },
  },
  monokai: {
    name: 'Monokai',
    colors: {
      surface900: '#1A1A1A',
      surface800: '#272822',
      surface700: '#3E3D32',
      surface600: '#49483E',
      surface500: '#5B5A4F',
      accent: '#A6E22E',
      accentHover: '#B8F340',
      success: '#66D9EF',
      successLight: '#1E3A3F',
      warning: '#FD971F',
      textPrimary: '#F8F8F2',
      textSecondary: '#CFCFC2',
      textMuted: '#8A8A7A',
      border: '#49483E',
      cardBg: '#272822',
    },
  },
  tokyo: {
    name: 'Tokyo Night',
    colors: {
      surface900: '#0F1419',
      surface800: '#1A1B2E',
      surface700: '#24283B',
      surface600: '#2F3447',
      surface500: '#3B4058',
      accent: '#7AA2F7',
      accentHover: '#89B4FA',
      success: '#9ECE6A',
      successLight: '#1C2E1C',
      warning: '#E0AF68',
      textPrimary: '#C0CAF5',
      textSecondary: '#A9B1D6',
      textMuted: '#565F89',
      border: '#2F3447',
      cardBg: '#1A1B2E',
    },
  },
  catppuccin: {
    name: 'Catppuccin',
    colors: {
      surface900: '#11111B',
      surface800: '#1E1E2E',
      surface700: '#2B2B3D',
      surface600: '#363648',
      surface500: '#45465A',
      accent: '#F5C2E7',
      accentHover: '#F2CDCD',
      success: '#A6E3A1',
      successLight: '#1E3520',
      warning: '#F9E2AF',
      textPrimary: '#CDD6F4',
      textSecondary: '#BAC2DE',
      textMuted: '#6C7086',
      border: '#363648',
      cardBg: '#1E1E2E',
    },
  },
}

const STORAGE_KEY = storageKey('custom_theme')

export function loadCustomTheme(): ThemeConfig | null {
  return loadJSON<ThemeConfig | null>(STORAGE_KEY, null)
}

export function saveCustomTheme(theme: ThemeConfig): void {
  saveJSON(STORAGE_KEY, theme)
}

export function clearCustomTheme(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function applyTheme(colors: ThemeColors): void {
  const root = document.documentElement
  const map: Record<string, keyof ThemeColors> = {
    '--color-surface-900': 'surface900',
    '--color-surface-800': 'surface800',
    '--color-surface-700': 'surface700',
    '--color-surface-600': 'surface600',
    '--color-surface-500': 'surface500',
    '--color-accent': 'accent',
    '--color-accent-hover': 'accentHover',
    '--color-success': 'success',
    '--color-success-light': 'successLight',
    '--color-warning': 'warning',
    '--color-text-primary': 'textPrimary',
    '--color-text-secondary': 'textSecondary',
    '--color-text-muted': 'textMuted',
    '--color-border': 'border',
    '--color-card-bg': 'cardBg',
  }
  for (const [cssVar, key] of Object.entries(map)) {
    root.style.setProperty(cssVar, colors[key])
  }
}

export function resetTheme(): void {
  const root = document.documentElement
  const vars = [
    '--color-surface-900', '--color-surface-800', '--color-surface-700',
    '--color-surface-600', '--color-surface-500',
    '--color-accent', '--color-accent-hover',
    '--color-success', '--color-success-light', '--color-warning',
    '--color-text-primary', '--color-text-secondary', '--color-text-muted',
    '--color-border', '--color-card-bg',
  ]
  for (const v of vars) {
    root.style.removeProperty(v)
  }
}
