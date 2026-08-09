export interface Panel {
  x: number
  y: number
  width: number
  height: number
  confidence: number
}

export async function detectPanels(
  imageUrl: string,
  threshold: number = 0.6
): Promise<Panel[]> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const width = canvas.width
      const height = canvas.height

      const gray = new Uint8Array(width * height)
      for (let i = 0; i < width * height; i++) {
        const r = data[i * 4]
        const g = data[i * 4 + 1]
        const b = data[i * 4 + 2]
        gray[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
      }

      const rowSums = new Array(height).fill(0)
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          rowSums[y] += gray[y * width + x]
        }
        rowSums[y] /= width
      }

      const colSums = new Array(width).fill(0)
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          colSums[x] += gray[y * width + x]
        }
        colSums[x] /= height
      }

      const thresholdVal = 30
      const rowEdges: number[] = []
      for (let y = 1; y < height - 1; y++) {
        const diff = Math.abs(rowSums[y] - rowSums[y - 1])
        if (diff > thresholdVal) rowEdges.push(y)
      }

      const colEdges: number[] = []
      for (let x = 1; x < width - 1; x++) {
        const diff = Math.abs(colSums[x] - colSums[x - 1])
        if (diff > thresholdVal) colEdges.push(x)
      }

      if (rowEdges.length < 2 || colEdges.length < 2) {
        resolve([])
        return
      }

      const panels: Panel[] = []
      const rowSegments = [0, ...rowEdges, height]
      const colSegments = [0, ...colEdges, width]

      for (let r = 0; r < rowSegments.length - 1; r++) {
        for (let c = 0; c < colSegments.length - 1; c++) {
          const x = colSegments[c]
          const y = rowSegments[r]
          const w = colSegments[c + 1] - x
          const h = rowSegments[r + 1] - y

          if (w < width * 0.1 || h < height * 0.1) continue

          const edgeCount = (rowEdges.filter(e => e > y && e < y + h).length +
            colEdges.filter(e => e > x && e < x + w).length)

          const coverage = (w * h) / (width * height)
          const confidence = Math.min(1, (edgeCount / 8) * 0.6 + coverage * 2)

          if (confidence > threshold) {
            panels.push({
              x: x / width,
              y: y / height,
              width: w / width,
              height: h / height,
              confidence,
            })
          }
        }
      }

      panels.sort((a, b) => a.y - b.y || a.x - b.x)

      const filtered: Panel[] = []
      for (const panel of panels) {
        const overlaps = filtered.some(p =>
          panel.x < p.x + p.width &&
          panel.x + panel.width > p.x &&
          panel.y < p.y + p.height &&
          panel.y + panel.height > p.y
        )
        if (!overlaps) filtered.push(panel)
      }

      resolve(filtered.slice(0, 8))
    }
    img.onerror = () => resolve([])
    img.src = imageUrl
  })
}
