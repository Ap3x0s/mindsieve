import type { SieveItem } from '../types'

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/)
  const stopwords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
    'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below', 'between',
    'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'either',
    'neither', 'each', 'every', 'all', 'any', 'few', 'most', 'other',
    'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very',
    'just', 'because', 'about', 'this', 'that', 'these', 'those', 'it',
    'its', 'you', 'your', 'he', 'she', 'they', 'we', 'our', 'my', 'me',
    'i', 'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how'])
  const freq: Record<string, number> = {}
  for (const w of words) {
    const clean = w.replace(/[^a-z0-9]/g, '')
    if (clean.length > 3 && !stopwords.has(clean)) {
      freq[clean] = (freq[clean] || 0) + 1
    }
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 6).map(e => e[0])
}

function extractTitle(text: string): string {
  const lines = text.split('\n').filter(l => l.trim())
  for (const line of lines) {
    if (line.length > 10 && line.length < 120) return line.trim().replace(/^#+\s*/, '')
  }
  return text.slice(0, 80).trim()
}

const domainPattern = /https?:\/\/(?:www\.)?([^/\s]+)/i

const TAG_MAP: Record<string, string[]> = {
  tech: ['AI', 'Technology', 'Programming', 'Software', 'Engineering'],
  psych: ['Psychology', 'Habits', 'Science', 'Self-Improvement', 'Neuroscience'],
  crypto: ['Crypto', 'Blockchain', 'Privacy', 'Technology', 'Security'],
}

function suggestTags(keywords: string[], domain: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const kw of [...domain.split('.'), ...keywords]) {
    for (const [key, tags] of Object.entries(TAG_MAP)) {
      if (kw.toLowerCase().includes(key) || key.includes(kw.toLowerCase())) {
        for (const t of tags) {
          if (!seen.has(t) && result.length < 5) {
            seen.add(t)
            result.push(t)
          }
        }
      }
    }
  }
  if (result.length === 0) result.push(keywords[0] || 'General')
  return result
}

export async function processWithAI(input: string): Promise<Pick<SieveItem, 'title' | 'domain' | 'url' | 'readingTime' | 'summary' | 'actionItems' | 'quiz' | 'sourceType'> & { tags: string[] }> {
  await new Promise(r => setTimeout(r, 2200))

  const domainMatch = input.match(domainPattern)
  const domain = domainMatch ? domainMatch[1] : 'paste.text'
  const title = domainMatch ? extractTitle(input) : extractTitle(input)
  const keywords = extractKeywords(input)

  const summary = keywords.length > 0
    ? [
        `This ${domain === 'paste.text' ? 'text' : 'article'} explores key concepts around "${keywords.slice(0, 2).join(' and ')}", providing actionable insights for understanding the core thesis.`,
        `The analysis identifies ${keywords.length} critical factors: ${keywords.slice(0, 4).join(', ')}, each contributing to the overall framework discussed.`,
        `Practical implications suggest that focusing on "${keywords[0] || 'the main topic'}" yields the highest ROI for readers looking to apply these learnings.`,
      ]
    : [
        'This piece examines a topic with measurable insights — early research suggests significant practical applications.',
        'The core thesis centers on the interplay between theory and implementation, with concrete examples provided.',
        'Critics point to edge cases, but the mainstream consensus favors adoption of the outlined principles.',
      ]

  const actionItems = [
    `Explore the core concept of "${keywords[0] || 'the main topic'}" in more depth through primary sources.`,
    `Apply one insight from this ${domain === 'paste.text' ? 'text' : 'article'} to your current project or workflow this week.`,
    `Discuss the findings with a colleague — cross-perspective analysis strengthens retention by 40%.`,
    `Bookmark the key references for a deeper dive when you have dedicated focus time.`,
  ]

  const quiz = [
    {
      question: `What is the primary focus of this ${domain === 'paste.text' ? 'text' : 'article'}?`,
      options: [keywords[0] || 'General overview', keywords[1] || 'Technical analysis', 'Historical context', 'Future predictions'],
      correctIndex: 0,
    },
    {
      question: 'How many critical factors does the analysis identify?',
      options: [`${keywords.length}`, `${keywords.length + 2}`, `${Math.max(1, keywords.length - 1)}`, `${keywords.length + 5}`],
      correctIndex: 0,
    },
    {
      question: 'What yields the highest ROI according to the analysis?',
      options: [`Focusing on "${keywords[0] || 'the main topic'}"`, 'Quick implementation', 'Team collaboration', 'External consulting'],
      correctIndex: 0,
    },
  ]

  return {
    title,
    domain,
    url: domainMatch ? input.match(/https?:\/\/[^\s]+/)?.[0] || '' : '',
    readingTime: `${Math.max(3, Math.ceil(input.split(/\s+/).length / 200))} min read`,
    summary,
    actionItems,
    quiz,
    sourceType: domainMatch ? 'link' : 'text',
    tags: suggestTags(keywords, domain),
  }
}
