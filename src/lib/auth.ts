import { API_BASE_URL, STORAGE_PREFIX } from './constants'

const TOKEN_KEY = `${STORAGE_PREFIX}_token`
const USER_KEY = `${STORAGE_PREFIX}_user`

interface AuthResponse {
  token: string
  user: { id: string; nickname: string }
}

interface MeResponse {
  id: string
  nickname: string
  createdAt: string
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): { id: string; nickname: string } | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

export function saveSession(token: string, user: { id: string; nickname: string }): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function safeJSON<T>(res: Response): Promise<T | null> {
  try {
    const text = await res.text()
    if (!text) return null
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

export async function register(nickname: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, password }),
  })
  const data = await safeJSON<AuthResponse>(res)
  if (!res.ok || !data) throw new Error((data as any)?.error || 'Registration failed')
  saveSession(data.token, data.user)
  return data
}

export async function login(nickname: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nickname, password }),
  })
  const data = await safeJSON<AuthResponse>(res)
  if (!res.ok || !data) throw new Error((data as any)?.error || 'Login failed')
  saveSession(data.token, data.user)
  return data
}

export async function checkSession(): Promise<MeResponse | null> {
  const token = getToken()
  if (!token) return null
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      clearSession()
      return null
    }
    const data = await safeJSON<MeResponse>(res)
    if (!data) {
      clearSession()
      return null
    }
    return data
  } catch {
    clearSession()
    return null
  }
}

export function logout(): void {
  clearSession()
  window.location.href = '/auth'
}
