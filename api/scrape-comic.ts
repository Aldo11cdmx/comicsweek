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
  /ads?\./i,
  /doubleclick\.net/i,
  /googlesyndication\.com/i,
  /google-analytics\.com/i,
  /googleadservices\.com/i,
]

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp)(\?.*)?$/i

const READING_CONTENT_SELECTORS = [
  '[class*="reading-content"]',
  '[class*="reader-content"]',
  '[class*="chapter-content"]',
  '[class*="manga-content"]',
  '[class*="comic-content"]',
  '[id*="reading-content"]',
  '[id*="reader-content"]',
  '[id*="chapter-content"]',
  'article',
  '.entry-content',
  '.post-content',
  '.content',
  'main',
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

function extractSrcsetUrls(srcset: string | undefined, baseUrl: string): string[] {
  if (!srcset) return []
  return srcset
    .split(',')
    .map(part => part.trim().split(/\s+/)[0])
    .filter(Boolean)
    .map(relative => resolveUrl(baseUrl, relative))
}

function getImageSrc($: cheerio.CheerioAPI, el: any, baseUrl: string): string | null {
  const $el = $(el)

  const src = $el.attr('src')
  if (src && src.trim()) {
    const absolute = resolveUrl(baseUrl, src.trim())
    if (absolute && absolute !== 'about:blank' && !absolute.startsWith('data:')) {
      return absolute
    }
  }

  const dataSrc = $el.attr('data-src')
  if (dataSrc && dataSrc.trim()) {
    const absolute = resolveUrl(baseUrl, dataSrc.trim())
    if (absolute && absolute !== 'about:blank' && !absolute.startsWith('data:')) {
      return absolute
    }
  }

  const dataLazySrc = $el.attr('data-lazy-src')
  if (dataLazySrc && dataLazySrc.trim()) {
    const absolute = resolveUrl(baseUrl, dataLazySrc.trim())
    if (absolute && absolute !== 'about:blank' && !absolute.startsWith('data:')) {
      return absolute
    }
  }

  const dataCfsrc = $el.attr('data-cfsrc')
  if (dataCfsrc && dataCfsrc.trim()) {
    const absolute = resolveUrl(baseUrl, dataCfsrc.trim())
    if (absolute && absolute !== 'about:blank' && !absolute.startsWith('data:')) {
      return absolute
    }
  }

  const srcset = $el.attr('srcset')
  const srcsetUrls = extractSrcsetUrls(srcset, baseUrl)
  if (srcsetUrls.length > 0) {
    return srcsetUrls[0]
  }

  const dataSrcset = $el.attr('data-srcset')
  const dataSrcsetUrls = extractSrcsetUrls(dataSrcset, baseUrl)
  if (dataSrcsetUrls.length > 0) {
    return dataSrcsetUrls[0]
  }

  return null
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
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

    const readingContents = READING_CONTENT_SELECTORS.map(selector => $(selector).first()).filter(Boolean)

    function processImage(src: string | null) {
      if (!src) return
      const absolute = resolveUrl(baseUrl, src)
      if (!absolute || absolute === 'about:blank' || absolute.startsWith('data:')) return
      if (!looksLikePageImage(absolute)) return
      if (!images.includes(absolute)) {
        images.push(absolute)
      }
    }

    if (readingContents.length > 0) {
      readingContents.forEach((container: any) => {
        container.find('img').each((_: any, el: any) => {
          const src = getImageSrc($, el, baseUrl)
          processImage(src)
        })
      })
    } else {
      $('img').each((_: any, el: any) => {
        const src = getImageSrc($, el, baseUrl)
        processImage(src)
      })
    }

    const extensionImages = images.filter(url => IMAGE_EXTENSIONS.test(url))

    const data: ScrapeResponse = { images: extensionImages.length > 0 ? extensionImages : images }
    res.status(200).json(data)
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Scrape failed' })
  }
}
