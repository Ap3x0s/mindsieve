export interface ExtractedMeta {
  title: string
  description: string
  favicon: string
  author: string
  domain: string
  cleanText: string
  image: string
}

export async function extractUrlMeta(url: string): Promise<ExtractedMeta | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')

    const getMeta = (prop: string): string => {
      const el = doc.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`)
      return el?.getAttribute('content') || ''
    }

    const title = getMeta('og:title') || doc.title || ''
    const description = getMeta('og:description') || getMeta('description') || ''
    const image = getMeta('og:image')
    const author = getMeta('author') || ''
    const domain = new URL(url).hostname.replace('www.', '')
    const favicon = doc.querySelector('link[rel="icon"]')?.getAttribute('href')
      || doc.querySelector('link[rel="shortcut icon"]')?.getAttribute('href')
      || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

    const article = doc.querySelector('article')
    const main = doc.querySelector('main')
    const body = doc.querySelector('body')
    const textEl = article || main || body
    const cleanText = textEl
      ? (textEl.textContent || '')
          .replace(/\s+/g, ' ')
          .replace(/<[^>]*>/g, '')
          .trim()
          .slice(0, 15000)
      : ''

    return { title, description, favicon, author, domain, cleanText, image }
  } catch {
    return null
  }
}
