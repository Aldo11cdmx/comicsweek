interface DownloadRequest {
  url: string
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { url } = req.body as DownloadRequest

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url' })
    return
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      res.status(502).json({ error: `Image fetch failed with ${response.status}` })
      return
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    res.status(200).json({ base64, contentType })
  } catch (error: any) {
    res.status(500).json({ error: error?.message || 'Download failed' })
  }
}
