import * as cheerio from 'cheerio'

interface ScrapeRequest {
  url: string
}

interface ScrapeResponse {
  images: string[]
}

const FILTER_PATTERNS = [
  /logo/i,
  /icon/i,
  /avatar/i,
  /thumb/i,
  /banner/i,
  /advertisement/i,
  /ad-?banner/i,
  /sprite/i,
  /1x1/i,
  /pixel/i,
  /tracking/i,
  /spinner/i,
  /loader/i,
  /favicon/i,
  /emoji/i,
  /badge/i,
  /button/i,
  /social/i,
  /share/i,
  /facebook/i,
  /twitter/i,
  /instagram/i,
  /youtube/i,
  /discord/i,
  /menu/i,
  /nav/i,
  /header/i,
  /footer/i,
  /widget/i,
]

function looksLikePageImage(url: string): boolean {
  const lower = url.toLowerCase()
  for (const pattern of FILTER_PATTERNS) {
    if (pattern.test(lower)) return false
  }
  return true
}

function resolveUrl(base: string, relative: string): string {
  try {
    return new URL(relative, base).href
  } catch {
    return relative
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { url } = req.body as ScrapeRequest

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url' })
    return
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    })

    if (!response.ok) {
      res.status(502).json({ error: `Upstream responded with ${response.status}` })
      return
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const baseUrl = response.url || url
    const images: string[] = []

    $('img').each((_, el) => {
      const src = $(el).attr('src')
      if (!src) return

      const absolute = resolveUrl(baseUrl, src)
      if (!looksLikePageImage(absolute)) return

      const width = parseInt($(el).attr('width') || '0', 10)
      const height = parseInt($(el).attr('height') || '0', 10)
      if (width > 0 && height > 0 && (width < 100 || height < 100)) return

      if (!images.includes(absolute)) {
        images.push(absolute)
      }
    })

    const data: ScrapeResponse = { images }
    res.status(200).json(data)
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Scrape failed' })
  }
}
